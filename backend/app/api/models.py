"""
CinePulse AI - Model Performance & Explainability Endpoints
"""

import json
import os
from fastapi import APIRouter, HTTPException
from backend.app.core.config import ARTIFACTS_DIR

router = APIRouter(prefix="/models", tags=["Model Intelligence"])


@router.get("/metrics")
def get_model_metrics():
    """
    Retrieve held-out test evaluation benchmarks:
    Baseline vs Random Forest vs XGBoost (MAE, RMSE, WAPE),
    plus segmented analysis (low, moderate, high demand, cold-start).
    """
    metrics_path = os.path.join(ARTIFACTS_DIR, "metrics.json")
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="Metrics artifact not found.")

    with open(metrics_path, "r") as f:
        metrics = json.load(f)

    return metrics


@router.get("/explain")
def get_model_global_explainability():
    """
    Retrieve global feature importance rankings and model architecture metadata.
    """
    feat_path = os.path.join(ARTIFACTS_DIR, "feature_importance.json")
    if not os.path.exists(feat_path):
        raise HTTPException(status_code=404, detail="Feature importance artifact not found.")

    with open(feat_path, "r") as f:
        feat_data = json.load(f)

    return feat_data
