"""
CinePulse AI - Model Evaluation & Residual Diagnostics
Generates diagnostic plots:
1. Predictions vs Actuals (with 45° line)
2. Residual Error Distribution
3. Baseline vs Candidates Performance Comparison
4. Top Feature Importances
"""

import json
import os
import sys

# Ensure project root is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns


def generate_evaluation_diagnostics(artifacts_dir: str, reports_dir: str):
    os.makedirs(reports_dir, exist_ok=True)
    plots_dir = os.path.join(reports_dir, "eval_plots")
    os.makedirs(plots_dir, exist_ok=True)

    metrics_file = os.path.join(artifacts_dir, "metrics.json")
    feat_file = os.path.join(artifacts_dir, "feature_importance.json")
    preds_file = os.path.join(artifacts_dir, "test_predictions.csv")

    with open(metrics_file, "r") as f:
        metrics = json.load(f)

    with open(feat_file, "r") as f:
        feat_data = json.load(f)

    df_preds = pd.read_csv(preds_file)

    # Style setup
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")

    # 1. Prediction vs Actual Scatter Plot
    plt.figure(figsize=(8, 6))
    plt.scatter(
        df_preds["tickets_sold"],
        df_preds["champ_pred"],
        alpha=0.6,
        color="#241018",
        edgecolors="none",
        s=35,
        label="Test Shows"
    )
    max_val = max(df_preds["tickets_sold"].max(), df_preds["champ_pred"].max()) + 15
    plt.plot([0, max_val], [0, max_val], color="#D8B46A", linestyle="--", linewidth=2.2, label="Perfect Forecast (y = x)")
    plt.title(f"XGBoost Champion Model: Predicted vs Actual Tickets Sold", fontsize=12, fontweight="bold", color="#241018")
    plt.xlabel("Actual Tickets Sold", fontsize=11)
    plt.ylabel("Predicted Tickets Sold", fontsize=11)
    plt.xlim(0, max_val)
    plt.ylim(0, max_val)
    plt.legend(frameon=True)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "prediction_vs_actual.png"), dpi=200)
    plt.close()

    # 2. Residual Distribution Plot
    residuals = df_preds["champ_error"]
    res_mean = residuals.mean()
    res_std = residuals.std()

    plt.figure(figsize=(9, 5))
    sns.histplot(residuals, kde=True, color="#B66B7B", bins=30)
    plt.axvline(0, color="#17171D", linestyle="-", linewidth=1.5, label="Zero Bias (Ideal)")
    plt.axvline(res_mean, color="#D8B46A", linestyle="--", linewidth=2, label=f"Mean Residual: {res_mean:.2f}")
    plt.title(f"Test Residual Error Distribution (Actual - Predicted) [Std: {res_std:.2f}]", fontsize=12, fontweight="bold", color="#241018")
    plt.xlabel("Prediction Error (Tickets)", fontsize=11)
    plt.ylabel("Frequency", fontsize=11)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "residual_distribution.png"), dpi=200)
    plt.close()

    # 3. Model Performance Comparison Bar Chart
    test_metrics = metrics["test"]
    models = ["Baseline", "Random Forest", "XGBoost"]
    mae_vals = [test_metrics["baseline"]["constrained_mae"], test_metrics["random_forest"]["constrained_mae"], test_metrics["xgboost"]["constrained_mae"]]
    wape_vals = [test_metrics["baseline"]["constrained_wape"], test_metrics["random_forest"]["constrained_wape"], test_metrics["xgboost"]["constrained_wape"]]

    x = np.arange(len(models))
    width = 0.35

    fig, ax1 = plt.subplots(figsize=(9, 5))
    ax2 = ax1.twinx()

    rects1 = ax1.bar(x - width/2, mae_vals, width, label="MAE (Tickets)", color="#241018")
    rects2 = ax2.bar(x + width/2, wape_vals, width, label="WAPE (%)", color="#D8B46A")

    ax1.set_ylabel("MAE (Tickets Sold)", color="#241018", fontsize=11)
    ax2.set_ylabel("WAPE (%)", color="#997010", fontsize=11)
    ax1.set_title("Held-out Test Performance: Baseline vs Candidate ML Models", fontsize=12, fontweight="bold", color="#241018")
    ax1.set_xticks(x)
    ax1.set_xticklabels(models, fontsize=11)

    # Annotate bars
    for rect in rects1:
        h = rect.get_height()
        ax1.annotate(f"{h:.1f}", xy=(rect.get_x() + rect.get_width()/2, h), xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=10)

    for rect in rects2:
        h = rect.get_height()
        ax2.annotate(f"{h:.1f}%", xy=(rect.get_x() + rect.get_width()/2, h), xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=10)

    fig.tight_layout()
    plt.savefig(os.path.join(plots_dir, "model_comparison_bar.png"), dpi=200)
    plt.close()

    # 4. Top Feature Importances (XGBoost)
    xgb_feats = list(feat_data["xgboost"].items())[:12]
    f_names = [f[0] for f in reversed(xgb_feats)]
    f_scores = [f[1] for f in reversed(xgb_feats)]

    plt.figure(figsize=(10, 6))
    plt.barh(f_names, f_scores, color="#D8B46A", edgecolor="#241018")
    plt.title("XGBoost Champion Model: Top 12 Feature Importances", fontsize=12, fontweight="bold", color="#241018")
    plt.xlabel("Relative Feature Importance (Gain)", fontsize=11)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "feature_importance_bar.png"), dpi=200)
    plt.close()

    print(f"Generated 4 evaluation diagnostic plots in {plots_dir}")


if __name__ == "__main__":
    art_path = os.path.join(PROJECT_ROOT, "backend", "artifacts")
    rep_path = os.path.join(PROJECT_ROOT, "reports")
    generate_evaluation_diagnostics(art_path, rep_path)

