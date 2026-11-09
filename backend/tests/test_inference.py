"""
Tests for CinePulse AI real model inference and capacity bounds enforcement.
"""

import os
import sys
import pytest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.ml.predict import CinePulsePredictor


@pytest.fixture(scope="module")
def predictor():
    artifacts_dir = os.path.join(PROJECT_ROOT, "backend", "artifacts")
    return CinePulsePredictor(artifacts_dir)


def test_single_show_inference(predictor):
    show_payload = {
        "movie_title": "Quantum Horizon",
        "genre": "Sci-Fi",
        "release_date": "2024-06-01",
        "show_date": "2024-06-15",
        "show_time": "19:45",
        "screen_id": "Screen-1",
        "screen_type": "IMAX / Premium Large Format",
        "screen_capacity": 350,
        "ticket_price": 380,
        "movie_popularity": 8.8,
        "days_since_release": 14,
        "historical_movie_demand": 0.65,
        "is_weekend": 1,
    }

    res = predictor.predict_single_show(show_payload, include_explanation=True)

    assert "predicted_tickets_sold" in res
    assert "predicted_occupancy_rate" in res
    assert "demand_category" in res
    assert "confidence_interval_90" in res
    assert "explanation" in res

    # Capacity bounds check
    assert 0 <= res["predicted_tickets_sold"] <= show_payload["screen_capacity"]
    assert 0.0 <= res["predicted_occupancy_rate"] <= 1.0
    assert res["estimated_empty_seats"] == show_payload["screen_capacity"] - res["predicted_tickets_sold"]

    # Confidence interval sanity check
    ci = res["confidence_interval_90"]
    assert 0 <= ci["lower_tickets"] <= ci["upper_tickets"] <= show_payload["screen_capacity"]

    # SHAP local attribution check
    exp = res["explanation"]
    assert exp is not None
    assert len(exp["top_contributions"]) > 0
    assert "executive_explanation" in exp


def test_capacity_constraint_edge_cases(predictor):
    # Extreme tiny capacity
    tiny_show = {
        "movie_title": "Blockbuster Extravaganza",
        "genre": "Action",
        "show_date": "2024-06-15",
        "show_time": "19:45",
        "screen_capacity": 25,  # very small capacity
        "ticket_price": 500,
        "movie_popularity": 10.0,
    }
    res = predictor.predict_single_show(tiny_show, include_explanation=False)
    assert 0 <= res["predicted_tickets_sold"] <= 25, "Prediction breached tiny capacity constraint!"
