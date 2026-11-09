"""
CinePulse AI - Pydantic Request & Response Schemas
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class ShowPredictionInput(BaseModel):
    movie_title: str = Field(default="Quantum Horizon", description="Title of the motion picture")
    genre: str = Field(default="Sci-Fi", description="Primary film genre")
    release_date: Optional[str] = Field(default="2024-06-01", description="Film theatrical release date (YYYY-MM-DD)")
    show_date: str = Field(default="2024-06-15", description="Target show screening date (YYYY-MM-DD)")
    show_time: str = Field(default="19:45", description="Target screening start time (HH:MM)")
    screen_id: Optional[str] = Field(default="Screen-1", description="Screen identifier")
    screen_type: Optional[str] = Field(default="IMAX / Premium Large Format", description="Auditorium technology type")
    screen_capacity: int = Field(default=350, ge=10, le=1000, description="Total seating capacity")
    ticket_price: float = Field(default=380.0, ge=1.0, le=5000.0, description="Admission price per ticket")
    movie_popularity: float = Field(default=8.5, ge=1.0, le=10.0, description="Market buzz and star-power index (1.0 - 10.0)")
    days_since_release: Optional[int] = Field(default=None, ge=0, description="Elapsed days since theatrical premiere")
    day_of_week: Optional[int] = Field(default=None, ge=0, le=6, description="Day of week index (0=Monday, 6=Sunday)")
    is_weekend: Optional[int] = Field(default=None, ge=0, le=1, description="1 if Friday, Saturday, or Sunday")
    is_holiday: Optional[int] = Field(default=0, ge=0, le=1, description="1 for holiday / peak calendar date")
    historical_movie_demand: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Historical occupancy rate of movie prior to 24h cutoff")
    historical_genre_demand: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Historical occupancy rate of genre prior to 24h cutoff")
    previous_show_occupancy: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Occupancy rate of preceding show on this screen")
    historical_shows_count: Optional[int] = Field(default=None, ge=0, description="Number of prior shows for this movie")
    is_cold_start: Optional[bool] = Field(default=None, description="Explicit cold-start override")


class ConfidenceInterval(BaseModel):
    lower_tickets: int
    upper_tickets: int
    lower_occupancy_pct: float
    upper_occupancy_pct: float
    uncertainty_level: str
    residual_std: float


class ShapContribution(BaseModel):
    feature: str
    shap_value: float
    direction: str


class ExplanationPayload(BaseModel):
    base_expected_value: float
    top_contributions: List[ShapContribution]
    top_positive: List[ShapContribution]
    top_negative: List[ShapContribution]
    executive_explanation: str


class ShowPredictionOutput(BaseModel):
    movie_title: str
    genre: str
    show_date: str
    show_time: str
    screen_id: str
    screen_type: str
    screen_capacity: int
    ticket_price: float
    is_cold_start: bool
    predicted_tickets_sold: int
    raw_model_prediction: float
    baseline_predicted_tickets: int
    predicted_occupancy_rate: float
    predicted_occupancy_percentage: float
    estimated_empty_seats: int
    estimated_ticket_revenue: float
    demand_category: str
    confidence_interval_90: ConfidenceInterval
    explanation: Optional[ExplanationPayload] = None


class SimulationRequest(BaseModel):
    base_scenario: ShowPredictionInput
    simulated_scenario: ShowPredictionInput


class SimulationDelta(BaseModel):
    delta_tickets: int
    delta_revenue: float
    delta_occupancy_pct: float
    percentage_change_tickets: float
    percentage_change_revenue: float


class SimulationResponse(BaseModel):
    base_result: ShowPredictionOutput
    simulated_result: ShowPredictionOutput
    differences: SimulationDelta
    causal_disclaimer: str
    operational_takeaway: str


class ScreenUtilizationItem(BaseModel):
    screen_id: str
    screen_type: str
    capacity: int
    total_shows: int
    avg_occupancy_pct: float
    total_revenue: float


class DashboardSummary(BaseModel):
    total_shows: int
    total_predicted_tickets: int
    average_occupancy_pct: float
    total_projected_revenue: float
    high_demand_shows_count: int
    moderate_demand_shows_count: int
    low_demand_shows_count: int
    screen_utilization: List[ScreenUtilizationItem]
    recent_shows: List[Dict[str, Any]]
    date_range: Dict[str, str]


class RecommendationItem(BaseModel):
    id: str
    type: str
    priority: str
    title: str
    description: str
    suggested_action: str
    affected_show_id: Optional[str] = None
    movie_title: Optional[str] = None
    screen_id: Optional[str] = None
    show_time: Optional[str] = None
    predicted_occupancy_pct: Optional[float] = None
    expected_revenue_impact: Optional[str] = None


class ValidationResponse(BaseModel):
    valid: bool
    message: str
    sanitized_input: Optional[Dict[str, Any]] = None
    errors: Optional[List[str]] = None
