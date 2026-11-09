"""
CinePulse AI - Cinema Control Center Dashboard Endpoint
"""

from fastapi import APIRouter, HTTPException
from backend.app.schemas.show import DashboardSummary
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
analytics_service = AnalyticsService()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    """Retrieve operational multiplex KPIs, screen utilization, and upcoming shows."""
    try:
        return analytics_service.get_dashboard_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard summary error: {str(e)}")

