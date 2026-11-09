"""
Tests for CinePulse AI feature engineering and preprocessing pipeline.
"""

import os
import sys
import numpy as np
import pandas as pd
import pytest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.ml.features import (
    ALL_MODEL_FEATURES,
    engineer_show_features,
    derive_time_of_day_category,
)
from backend.ml.preprocessing import CinemaPreprocessor


def test_time_of_day_derivation():
    assert derive_time_of_day_category("10:15") == "Morning"
    assert derive_time_of_day_category("13:30") == "Matinee"
    assert derive_time_of_day_category("16:00") == "Matinee"
    assert derive_time_of_day_category("19:45") == "Evening"
    assert derive_time_of_day_category("22:30") == "Night"


def test_feature_engineering_cold_start():
    # Cold start show (opening day)
    raw = {
        "movie_title": "Apex Velocity",
        "genre": "Action",
        "release_date": "2024-06-15",
        "show_date": "2024-06-15",
        "show_time": "19:45",
        "screen_capacity": 250,
        "ticket_price": 300,
        "movie_popularity": 8.0,
    }
    feats = engineer_show_features(raw)
    assert feats["is_cold_start"] == 1
    assert feats["days_since_release"] == 0
    assert feats["historical_movie_demand"] > 0  # imputed genre prior
    assert feats["time_of_day_category"] == "Evening"


def test_preprocessor_fit_transform():
    sample_data = pd.DataFrame([
        {
            "screen_capacity": 350,
            "ticket_price": 380.0,
            "movie_popularity": 8.5,
            "days_since_release": 10,
            "day_of_week": 5,
            "is_weekend": 1,
            "is_holiday": 0,
            "historical_movie_demand": 0.65,
            "historical_genre_demand": 0.58,
            "previous_show_occupancy": 0.70,
            "historical_shows_count": 12,
            "is_cold_start": 0,
            "genre": "Sci-Fi",
            "time_of_day_category": "Evening",
            "screen_type": "IMAX / Premium Large Format",
        },
        {
            "screen_capacity": 180,
            "ticket_price": 220.0,
            "movie_popularity": 7.0,
            "days_since_release": 2,
            "day_of_week": 1,
            "is_weekend": 0,
            "is_holiday": 0,
            "historical_movie_demand": 0.45,
            "historical_genre_demand": 0.48,
            "previous_show_occupancy": 0.40,
            "historical_shows_count": 1,
            "is_cold_start": 1,
            "genre": "Comedy",
            "time_of_day_category": "Matinee",
            "screen_type": "Standard Audi",
        },
    ])

    preprocessor = CinemaPreprocessor()
    preprocessor.fit(sample_data)
    matrix = preprocessor.transform(sample_data)

    assert isinstance(matrix, np.ndarray)
    assert matrix.shape[0] == 2
    assert matrix.shape[1] == len(preprocessor.get_feature_names_out())

