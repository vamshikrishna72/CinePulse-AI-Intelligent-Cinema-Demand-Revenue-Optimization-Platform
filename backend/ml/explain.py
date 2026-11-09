"""
CinePulse AI - SHAP Explainability Engine
Generates both mathematically rigorous Shapley feature attributions (SHAP)
and plain-English operational explanations for cinema managers.
"""

import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from typing import Any, Dict, List, Tuple
import joblib
import numpy as np
import pandas as pd
import shap


class CinePulseExplainer:
    """
    SHAP-based local and global explainability service.
    """

    def __init__(self, artifacts_dir: str):
        self.artifacts_dir = artifacts_dir
        self.preprocessor = joblib.load(os.path.join(artifacts_dir, "preprocessor.joblib"))
        self.model = joblib.load(os.path.join(artifacts_dir, "champion_model.joblib"))
        self.feature_names = self.preprocessor.get_feature_names_out()

        # Initialize SHAP TreeExplainer for XGBoost/Tree models
        try:
            self.explainer = shap.TreeExplainer(self.model)
            self.expected_value = float(self.explainer.expected_value) if np.isscalar(self.explainer.expected_value) else float(self.explainer.expected_value[0])
        except Exception as e:
            print(f"Warning: TreeExplainer fallback: {e}")
            self.explainer = None
            self.expected_value = 75.0

    def explain_instance(self, processed_feature_row: np.ndarray, raw_show_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compute local SHAP attributions for a single show prediction.
        Returns top positive, top negative factors, and human narrative.
        """
        if processed_feature_row.ndim == 1:
            row_2d = processed_feature_row.reshape(1, -1)
        else:
            row_2d = processed_feature_row

        if self.explainer is not None:
            shap_values = self.explainer.shap_values(row_2d)
            if isinstance(shap_values, list):
                shap_values = shap_values[0]
            vals = shap_values[0]
        else:
            # Heuristic fallback if explainer unavailable
            vals = np.zeros(len(self.feature_names))

        contributions = []
        for name, val in zip(self.feature_names, vals):
            contributions.append({
                "feature": name,
                "shap_value": round(float(val), 2),
                "direction": "positive" if val >= 0 else "negative",
            })

        # Sort by absolute magnitude
        contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

        top_positive = [c for c in contributions if c["shap_value"] > 0][:4]
        top_negative = [c for c in contributions if c["shap_value"] < 0][:4]

        # Generate Plain-Language Executive Summary
        narrative_parts = []
        is_cold = raw_show_dict.get("is_cold_start", False)
        genre = raw_show_dict.get("genre", "Movie")
        period = raw_show_dict.get("time_of_day_category", "Show")
        is_wknd = raw_show_dict.get("is_weekend", 0)

        if is_cold:
            narrative_parts.append(
                f"⚠️ COLD-START ADVISORY: This show for '{genre}' has limited screening history (<= 3 days since release). "
                f"Demand is anchored to genre priors ({genre}) with wider uncertainty bounds."
            )

        if top_positive:
            top_pos_feats = ", ".join([f"{c['feature']} (+{c['shap_value']:.1f} tickets)" for c in top_positive[:2]])
            narrative_parts.append(f"Demand is strongly supported by {top_pos_feats}.")

        if top_negative:
            top_neg_feats = ", ".join([f"{c['feature']} ({c['shap_value']:.1f} tickets)" for c in top_negative[:2]])
            narrative_parts.append(f"Demand is tempered by {top_neg_feats}.")

        if is_wknd:
            narrative_parts.append("Weekend prime placement generates a significant positive uplift.")

        narrative = " ".join(narrative_parts)

        return {
            "base_expected_value": round(self.expected_value, 2),
            "top_contributions": contributions[:8],
            "top_positive": top_positive,
            "top_negative": top_negative,
            "executive_explanation": narrative,
        }

