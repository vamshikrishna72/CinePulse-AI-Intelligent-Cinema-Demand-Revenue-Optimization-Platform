"""
Integration tests for CinePulse AI REST API endpoints.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["champion_model"] == "xgboost"


def test_dashboard_summary_endpoint():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_shows"] > 0
    assert data["total_predicted_tickets"] > 0
    assert len(data["screen_utilization"]) == 4
    assert len(data["recent_shows"]) > 0


def test_predict_endpoint_success():
    payload = {
        "movie_title": "Quantum Horizon",
        "genre": "Sci-Fi",
        "show_date": "2024-06-15",
        "show_time": "19:45",
        "screen_capacity": 350,
        "ticket_price": 380,
        "movie_popularity": 8.8,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_tickets_sold"] > 0
    assert data["predicted_tickets_sold"] <= 350
    assert "confidence_interval_90" in data
    assert "explanation" in data


def test_simulate_endpoint():
    payload = {
        "base_scenario": {
            "movie_title": "Apex Velocity",
            "genre": "Action",
            "show_date": "2024-06-20",
            "show_time": "13:30",
            "screen_capacity": 180,
            "ticket_price": 220,
            "movie_popularity": 7.9,
        },
        "simulated_scenario": {
            "movie_title": "Apex Velocity",
            "genre": "Action",
            "show_date": "2024-06-20",
            "show_time": "19:45",
            "screen_capacity": 350,
            "ticket_price": 380,
            "movie_popularity": 7.9,
        },
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "differences" in data
    assert "causal_disclaimer" in data
    assert "operational_takeaway" in data


def test_model_metrics_and_explain_endpoints():
    m_resp = client.get("/api/models/metrics")
    assert m_resp.status_code == 200
    m_data = m_resp.json()
    assert "baseline" in m_data["test"]
    assert "random_forest" in m_data["test"]
    assert "xgboost" in m_data["test"]
    assert m_data["champion_model"] == "xgboost"

    e_resp = client.get("/api/models/explain")
    assert e_resp.status_code == 200
    e_data = e_resp.json()
    assert "xgboost" in e_data


def test_recommendations_endpoint():
    response = client.get("/api/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "suggested_action" in data[0]


def test_data_validation_endpoint():
    # Valid
    valid_resp = client.post("/api/data/validate", json={
        "movie_title": "Valid Movie",
        "genre": "Drama",
        "show_date": "2024-06-15",
        "show_time": "18:00",
        "screen_capacity": 200,
        "ticket_price": 250,
        "movie_popularity": 7.5,
    })
    assert valid_resp.status_code == 200
    assert valid_resp.json()["valid"] is True

    # Invalid (negative capacity)
    invalid_resp = client.post("/api/data/validate", json={
        "movie_title": "Invalid Movie",
        "genre": "Drama",
        "show_date": "2024-06-15",
        "show_time": "18:00",
        "screen_capacity": -50,
        "ticket_price": 250,
        "movie_popularity": 7.5,
    })
    # Pydantic schema will catch ge=10 or return 422
    assert invalid_resp.status_code == 422
