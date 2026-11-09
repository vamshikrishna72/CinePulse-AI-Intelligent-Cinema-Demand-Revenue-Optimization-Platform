"""
CinePulse AI - Model Service (Singleton Provider)
"""

import os
from typing import Optional
from backend.app.core.config import ARTIFACTS_DIR
from backend.ml.predict import CinePulsePredictor

_predictor_instance: Optional[CinePulsePredictor] = None


def get_predictor() -> CinePulsePredictor:
    """Singleton getter for the CinePulse ML Predictor."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = CinePulsePredictor(ARTIFACTS_DIR)
    return _predictor_instance
