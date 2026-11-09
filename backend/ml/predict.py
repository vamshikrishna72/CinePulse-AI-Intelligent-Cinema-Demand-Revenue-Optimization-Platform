"""
CinePulse AI - Inference & Prediction Engine
Loads serialized model artifacts, validates constraints,
runs actual inference, bounds predictions, and attaches SHAP explainability.
"""

import json
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from typing import Any, Dict, List, Optional
import joblib
import numpy as np
import pandas as pd

from backend.ml.explain import CinePulseExplainer
from backend.ml.features import (
    ALL_MODEL_FEATURES,
    engineer_show_features,
)


class CinePulsePredictor:
    """
    Production-grade inference handler for show-level ticket demand forecasting.
    """

    def __init__(self, artifacts_dir: Optional[str] = None):
        if artifacts_dir is None:
            artifacts_dir = os.path.join(PROJECT_ROOT, "backend", "artifacts")

        self.artifacts_dir = artifacts_dir
        self.preprocessor = joblib.load(os.path.join(artifacts_dir, "preprocessor.joblib"))
        self.model = joblib.load(os.path.join(artifacts_dir, "champion_model.joblib"))
        self.baseline_model = joblib.load(os.path.join(artifacts_dir, "baseline_model.joblib"))

        # Load metrics for residual uncertainty estimation
        metrics_path = os.path.join(artifacts_dir, "metrics.json")
        with open(metrics_path, "r") as f:
            self.metrics_data = json.load(f)

        self.explainer = CinePulseExplainer(artifacts_dir)

        # Standard errors for prediction intervals
        seg_metrics = self.metrics_data.get("test_segmented_analysis", {})
        self.cold_start_rmse = seg_metrics.get("cold_start_shows", {}).get("constrained_rmse", 32.2)
        self.mature_rmse = seg_metrics.get("mature_shows", {}).get("constrained_rmse", 19.4)

    def predict_single_show(self, raw_input: Dict[str, Any], include_explanation: bool = True) -> Dict[str, Any]:
        """
        Run end-to-end inference for a single show.
        """
        # 1. Feature engineering & validation
        engineered = engineer_show_features(raw_input)
        capacity = int(engineered.get("screen_capacity", 250))
        price = float(engineered.get("ticket_price", 280.0))
        is_cold = bool(engineered.get("is_cold_start", False))

        # Convert to single-row dataframe
        df_row = pd.DataFrame([engineered])[ALL_MODEL_FEATURES]

        # 2. Transform through fitted preprocessor
        X_proc = self.preprocessor.transform(df_row)

        # 3. Model inference
        raw_pred_val = float(self.model.predict(X_proc)[0])

        # Baseline comparison inference
        baseline_pred_val = float(self.baseline_model.predict(pd.DataFrame([engineered]))[0])
        baseline_constrained = int(round(np.clip(baseline_pred_val, 0, capacity)))

        # 4. Operational capacity bounding
        constrained_tickets = int(round(np.clip(raw_pred_val, 0, capacity)))
        occupancy_rate = round(constrained_tickets / capacity, 4) if capacity > 0 else 0.0
        empty_seats = max(0, capacity - constrained_tickets)
        estimated_revenue = round(constrained_tickets * price, 2)

        # 5. Demand classification
        if occupancy_rate < 0.40:
            demand_category = "Low Demand"
        elif occupancy_rate <= 0.75:
            demand_category = "Moderate Demand"
        else:
            demand_category = "High Demand"

        # 6. Uncertainty Prediction Interval (90% interval, Z=1.645)
        sigma = self.cold_start_rmse if is_cold else self.mature_rmse
        lower_bound = int(max(0, round(constrained_tickets - 1.645 * sigma)))
        upper_bound = int(min(capacity, round(constrained_tickets + 1.645 * sigma)))

        # 7. Explanation
        explanation_data = None
        if include_explanation:
            explanation_data = self.explainer.explain_instance(X_proc, engineered)

        return {
            "movie_title": engineered.get("movie_title", "Untitled Movie"),
            "genre": engineered.get("genre", "Unknown"),
            "show_date": engineered.get("show_date"),
            "show_time": engineered.get("show_time"),
            "screen_id": engineered.get("screen_id", "Screen-1"),
            "screen_type": engineered.get("screen_type"),
            "screen_capacity": capacity,
            "ticket_price": price,
            "is_cold_start": is_cold,
            "predicted_tickets_sold": constrained_tickets,
            "raw_model_prediction": round(raw_pred_val, 2),
            "baseline_predicted_tickets": baseline_constrained,
            "predicted_occupancy_rate": occupancy_rate,
            "predicted_occupancy_percentage": round(occupancy_rate * 100.0, 1),
            "estimated_empty_seats": empty_seats,
            "estimated_ticket_revenue": estimated_revenue,
            "demand_category": demand_category,
            "confidence_interval_90": {
                "lower_tickets": lower_bound,
                "upper_tickets": upper_bound,
                "lower_occupancy_pct": round((lower_bound / capacity) * 100.0, 1),
                "upper_occupancy_pct": round((upper_bound / capacity) * 100.0, 1),
                "uncertainty_level": "High (Cold-Start Release)" if is_cold else "Normal (Mature Screening)",
                "residual_std": round(sigma, 2),
            },
            "explanation": explanation_data,
        }

    def batch_predict(self, shows_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Run batch inference over a list of shows."""
        return [self.predict_single_show(s, include_explanation=False) for s in shows_list]
