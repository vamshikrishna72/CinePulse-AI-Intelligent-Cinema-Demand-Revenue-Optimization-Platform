"""
CinePulse AI - Model Training Pipeline
Trains:
1. Baseline: Capacity-Adjusted Historical Demand
2. Random Forest Regressor
3. XGBoost Regressor
Strictly chronological train/val/test splits.
"""

import json
import os
import sys

# Ensure project root is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from typing import Any, Dict, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, RegressorMixin
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

from backend.ml.baseline import CapacityAdjustedHistoricalBaseline
from backend.ml.features import (
    ALL_MODEL_FEATURES,
    TARGET_VARIABLE,
    GENRE_PRIORS,
)
from backend.ml.preprocessing import CinemaPreprocessor, split_processed_data


def compute_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    capacities: np.ndarray,
) -> Dict[str, float]:
    """
    Calculate MAE, RMSE, WAPE for both raw and capacity-constrained predictions.
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    capacities = np.asarray(capacities, dtype=float)

    # Raw metrics
    raw_errors = y_true - y_pred
    raw_mae = float(np.mean(np.abs(raw_errors)))
    raw_rmse = float(np.sqrt(np.mean(raw_errors ** 2)))
    sum_y = float(np.sum(y_true))
    raw_wape = float(np.sum(np.abs(raw_errors)) / (sum_y + 1e-9) * 100.0)

    # Capacity-constrained predictions
    pred_constrained = np.clip(y_pred, 0.0, capacities)
    con_errors = y_true - pred_constrained
    con_mae = float(np.mean(np.abs(con_errors)))
    con_rmse = float(np.sqrt(np.mean(con_errors ** 2)))
    con_wape = float(np.sum(np.abs(con_errors)) / (sum_y + 1e-9) * 100.0)

    return {
        "raw_mae": round(raw_mae, 3),
        "raw_rmse": round(raw_rmse, 3),
        "raw_wape": round(raw_wape, 2),
        "constrained_mae": round(con_mae, 3),
        "constrained_rmse": round(con_rmse, 3),
        "constrained_wape": round(con_wape, 2),
    }


def train_models(
    data_path: str,
    artifacts_dir: str,
    random_state: int = 42,
) -> Tuple[Dict[str, Any], str]:
    """
    Orchestrate complete model training, chronological evaluation,
    and artifact export.
    """
    os.makedirs(artifacts_dir, exist_ok=True)
    df = pd.read_csv(data_path)

    # 1. Chronological splitting
    train_df = df[df["split"] == "train"].copy()
    val_df = df[df["split"] == "val"].copy()
    test_df = df[df["split"] == "test"].copy()

    X_train = train_df[ALL_MODEL_FEATURES]
    y_train = train_df[TARGET_VARIABLE]

    X_val = val_df[ALL_MODEL_FEATURES]
    y_val = val_df[TARGET_VARIABLE]

    X_test = test_df[ALL_MODEL_FEATURES]
    y_test = test_df[TARGET_VARIABLE]

    print(f"Training split: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

    # 2. Fit Preprocessor strictly on training data
    preprocessor = CinemaPreprocessor()
    preprocessor.fit(X_train)

    X_train_proc = preprocessor.transform(X_train)
    X_val_proc = preprocessor.transform(X_val)
    X_test_proc = preprocessor.transform(X_test)

    feature_names = preprocessor.get_feature_names_out()

    # 3. Model 1: Baseline
    print("Training Baseline Model (Capacity-Adjusted Historical Demand)...")
    baseline = CapacityAdjustedHistoricalBaseline()
    baseline.fit(train_df, y_train)

    val_base_preds = baseline.predict(val_df)
    test_base_preds = baseline.predict(test_df)

    # 4. Model 2: Random Forest Regressor
    print("Training Random Forest Regressor...")
    rf_model = RandomForestRegressor(
        n_estimators=150,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=random_state,
        n_jobs=-1,
    )
    rf_model.fit(X_train_proc, y_train)

    val_rf_preds = rf_model.predict(X_val_proc)
    test_rf_preds = rf_model.predict(X_test_proc)

    # 5. Model 3: XGBoost Regressor
    print("Training XGBoost Regressor...")
    xgb_model = XGBRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=random_state,
        n_jobs=-1,
    )
    xgb_model.fit(X_train_proc, y_train)

    val_xgb_preds = xgb_model.predict(X_val_proc)
    test_xgb_preds = xgb_model.predict(X_test_proc)

    # 6. Evaluate all models on Validation set (Model Selection)
    val_caps = val_df["screen_capacity"].to_numpy()
    test_caps = test_df["screen_capacity"].to_numpy()

    metrics_results = {
        "validation": {
            "baseline": compute_metrics(y_val, val_base_preds, val_caps),
            "random_forest": compute_metrics(y_val, val_rf_preds, val_caps),
            "xgboost": compute_metrics(y_val, val_xgb_preds, val_caps),
        },
        "test": {
            "baseline": compute_metrics(y_test, test_base_preds, test_caps),
            "random_forest": compute_metrics(y_test, test_rf_preds, test_caps),
            "xgboost": compute_metrics(y_test, test_xgb_preds, test_caps),
        },
    }

    print("\n--- Validation Performance (WAPE & MAE) ---")
    for m_name, m_eval in metrics_results["validation"].items():
        print(f"{m_name.upper():15}: Constrained WAPE = {m_eval['constrained_wape']}% | MAE = {m_eval['constrained_mae']} | RMSE = {m_eval['constrained_rmse']}")

    print("\n--- Held-out Test Performance (Untouched during tuning) ---")
    for m_name, m_eval in metrics_results["test"].items():
        print(f"{m_name.upper():15}: Constrained WAPE = {m_eval['constrained_wape']}% | MAE = {m_eval['constrained_mae']} | RMSE = {m_eval['constrained_rmse']}")

    # Select winning model based on Validation constrained WAPE
    val_scores = {
        "baseline": metrics_results["validation"]["baseline"]["constrained_wape"],
        "random_forest": metrics_results["validation"]["random_forest"]["constrained_wape"],
        "xgboost": metrics_results["validation"]["xgboost"]["constrained_wape"],
    }
    winning_model_name = min(val_scores, key=val_scores.get)
    print(f"\nChampion Model Selected: {winning_model_name.upper()} (Val WAPE: {val_scores[winning_model_name]}%)")

    # Segmented test evaluation for Champion Model (and baseline comparison)
    test_eval_df = test_df.copy()
    test_eval_df["pred_baseline"] = np.clip(test_base_preds, 0, test_caps)
    test_eval_df["pred_rf"] = np.clip(test_rf_preds, 0, test_caps)
    test_eval_df["pred_xgb"] = np.clip(test_xgb_preds, 0, test_caps)
    test_eval_df["champ_pred"] = test_eval_df[f"pred_{'baseline' if winning_model_name == 'baseline' else ('rf' if winning_model_name == 'random_forest' else 'xgb')}"]
    test_eval_df["champ_error"] = test_eval_df[TARGET_VARIABLE] - test_eval_df["champ_pred"]
    test_eval_df["abs_error"] = test_eval_df["champ_error"].abs()

    # Detailed segment evaluations
    segments = {
        "low_demand (<40% occ)": test_eval_df["occupancy_rate"] < 0.40,
        "moderate_demand (40-75% occ)": (test_eval_df["occupancy_rate"] >= 0.40) & (test_eval_df["occupancy_rate"] <= 0.75),
        "high_demand (>75% occ)": test_eval_df["occupancy_rate"] > 0.75,
        "cold_start_shows": test_eval_df["is_cold_start"] == 1,
        "mature_shows": test_eval_df["is_cold_start"] == 0,
    }

    segmented_analysis = {}
    for seg_name, mask in segments.items():
        sub = test_eval_df[mask]
        if len(sub) > 0:
            sub_true = sub[TARGET_VARIABLE].to_numpy()
            sub_pred = sub["champ_pred"].to_numpy()
            sub_cap = sub["screen_capacity"].to_numpy()
            seg_metrics = compute_metrics(sub_true, sub_pred, sub_cap)
            seg_metrics["sample_count"] = int(len(sub))
            segmented_analysis[seg_name] = seg_metrics

    metrics_results["test_segmented_analysis"] = segmented_analysis
    metrics_results["champion_model"] = winning_model_name

    # 7. Extract Feature Importances for XGBoost and Random Forest
    rf_importances = dict(zip(feature_names, [float(x) for x in rf_model.feature_importances_]))
    xgb_importances = dict(zip(feature_names, [float(x) for x in xgb_model.feature_importances_]))
    
    # Sort descending
    rf_importances = dict(sorted(rf_importances.items(), key=lambda item: item[1], reverse=True))
    xgb_importances = dict(sorted(xgb_importances.items(), key=lambda item: item[1], reverse=True))

    feature_importance_data = {
        "feature_names": feature_names,
        "random_forest": rf_importances,
        "xgboost": xgb_importances,
    }

    # 8. Save Artifacts
    # Save Pipeline: Preprocessor + Model
    joblib.dump(preprocessor, os.path.join(artifacts_dir, "preprocessor.joblib"))
    joblib.dump(baseline, os.path.join(artifacts_dir, "baseline_model.joblib"))
    joblib.dump(rf_model, os.path.join(artifacts_dir, "rf_model.joblib"))
    joblib.dump(xgb_model, os.path.join(artifacts_dir, "xgb_model.joblib"))

    # Winning model pointer
    champ_model_obj = xgb_model if winning_model_name == "xgboost" else (rf_model if winning_model_name == "random_forest" else baseline)
    joblib.dump(champ_model_obj, os.path.join(artifacts_dir, "champion_model.joblib"))

    # Save metrics JSON
    with open(os.path.join(artifacts_dir, "metrics.json"), "w") as f:
        json.dump(metrics_results, f, indent=2)

    # Save Feature Importance JSON
    with open(os.path.join(artifacts_dir, "feature_importance.json"), "w") as f:
        json.dump(feature_importance_data, f, indent=2)

    # Save test predictions for visualization and error analysis
    test_eval_df.to_csv(os.path.join(artifacts_dir, "test_predictions.csv"), index=False)

    print(f"\nAll artifacts successfully saved to: {artifacts_dir}")
    return metrics_results, winning_model_name


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "../.."))
    raw_path = os.path.join(project_root, "data", "raw", "cinema_shows_synthetic.csv")
    art_dir = os.path.join(project_root, "backend", "artifacts")

    train_models(raw_path, art_dir)
