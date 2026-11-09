"""
CinePulse AI - Operational Demand Analytics Endpoint
"""

from fastapi import APIRouter, HTTPException
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])
analytics_service = AnalyticsService()


@router.get("/demand")
def get_demand_analytics():
    """
    Retrieve aggregated time-series trends, genre-wise performance,
    and weekday vs weekend demand patterns.
    """
    try:
        return analytics_service.get_demand_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics query error: {str(e)}")
