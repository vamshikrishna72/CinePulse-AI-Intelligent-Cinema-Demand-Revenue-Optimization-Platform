"""
CinePulse AI - Real-time Inference Endpoint
"""

from fastapi import APIRouter, HTTPException
from backend.app.schemas.show import ShowPredictionInput, ShowPredictionOutput
from backend.app.services.model_service import get_predictor

router = APIRouter(prefix="/predict", tags=["Forecasting"])


@router.post("", response_model=ShowPredictionOutput)
def predict_show_demand(payload: ShowPredictionInput):
    """
    Execute real model inference for a single cinema screening.
    Applies capacity bounds, computes 90% prediction intervals,
    and returns localized SHAP feature attribution.
    """
    try:
        predictor = get_predictor()
        input_dict = payload.model_dump()
        result = predictor.predict_single_show(input_dict, include_explanation=True)
        return ShowPredictionOutput(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

