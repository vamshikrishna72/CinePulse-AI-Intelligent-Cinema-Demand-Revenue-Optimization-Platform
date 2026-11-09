"""
CinePulse AI - Health & System Status Endpoint
"""

import sys
import psutil
from fastapi import APIRouter
from backend.app.core.config import APP_NAME, APP_VERSION
from backend.app.services.model_service import get_predictor

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health_status():
    """System health check, versioning, and runtime diagnostics."""
    predictor = get_predictor()
    mem = psutil.virtual_memory()

    return {
        "status": "healthy",
        "service": APP_NAME,
        "version": APP_VERSION,
        "model_loaded": predictor.model is not None,
        "champion_model": predictor.metrics_data.get("champion_model", "xgboost"),
        "python_version": sys.version.split()[0],
        "system_memory_used_pct": mem.percent,
        "mode": "production_inference",
    }

