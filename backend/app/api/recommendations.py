"""
CinePulse AI - Operational Recommendations Endpoint
"""

from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.schemas.show import RecommendationItem
from backend.app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])
recommendation_service = RecommendationService()


@router.get("", response_model=List[RecommendationItem])
def get_operational_recommendations():
    """
    Retrieve rule-governed operational suggestions:
    Screen reallocations, staffing alerts, pricing adjustments, and cold-start protocols.
    """
    try:
        return recommendation_service.generate_recommendations()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation engine error: {str(e)}")
