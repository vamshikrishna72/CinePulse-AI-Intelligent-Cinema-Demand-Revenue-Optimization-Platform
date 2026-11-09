"""
CinePulse AI - Data Validation & Cinema Reference Metadata
"""

from typing import Any, Dict
from fastapi import APIRouter
from backend.app.schemas.show import ShowPredictionInput, ValidationResponse
from backend.ml.data_generator import MOVIES_CATALOG, SCREENS
from backend.ml.features import GENRE_LIST, TIME_OF_DAY_LIST, SCREEN_TYPE_LIST

router = APIRouter(prefix="/data", tags=["Data"])


@router.post("/validate", response_model=ValidationResponse)
def validate_show_input(payload: ShowPredictionInput):
    """
    Validate input constraints before inference.
    Checks price bounds, capacity sanity, and popularity ranges.
    """
    errors = []
    if payload.screen_capacity <= 0:
        errors.append("Screen capacity must be strictly greater than 0.")
    if payload.ticket_price <= 0:
        errors.append("Ticket price must be positive.")
    if not (1.0 <= payload.movie_popularity <= 10.0):
        errors.append("Movie popularity indicator must be between 1.0 and 10.0.")

    if errors:
        return ValidationResponse(
            valid=False,
            message="Input data validation failed.",
            errors=errors,
        )

    return ValidationResponse(
        valid=True,
        message="Show parameters successfully validated.",
        sanitized_input=payload.model_dump(),
    )


@router.get("/metadata")
def get_cinema_metadata():
    """Returns cinema catalog: active movies, screens, genres, and slots."""
    return {
        "movies": [
            {
                "id": m["movie_id"],
                "title": m["title"],
                "genre": m["genre"],
                "popularity": m["popularity"],
                "decay_rate": m["decay_rate"],
                "poster_url": m.get("poster_url", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80"),
            }
            for m in MOVIES_CATALOG
        ],
        "screens": SCREENS,
        "genres": GENRE_LIST,
        "time_slots": TIME_OF_DAY_LIST,
        "screen_types": SCREEN_TYPE_LIST,
    }

