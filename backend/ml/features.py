"""
CinePulse AI - Feature Engineering and Schema Definitions
Forecast Horizon: 24 Hours before showtime.
Strict temporal leakage protection.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

CATEGORICAL_FEATURES = [
    "genre",
    "time_of_day_category",
    "screen_type",
]

NUMERICAL_FEATURES = [
    "screen_capacity",
    "ticket_price",
    "movie_popularity",
    "days_since_release",
    "day_of_week",
    "is_weekend",
    "is_holiday",
    "historical_movie_demand",
    "historical_genre_demand",
    "previous_show_occupancy",
    "historical_shows_count",
    "is_cold_start",
]

ALL_MODEL_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
TARGET_VARIABLE = "tickets_sold"

GENRE_LIST = [
    "Action",
    "Sci-Fi",
    "Drama",
    "Comedy",
    "Horror",
    "Animation",
    "Romance",
    "Thriller",
]

TIME_OF_DAY_LIST = ["Morning", "Matinee", "Evening", "Night"]

SCREEN_TYPE_LIST = [
    "IMAX / Premium Large Format",
    "Standard Dolby Atmos",
    "Standard Audi",
    "Boutique / VIP",
]

# Genre prior defaults for cold-start imputation
GENRE_PRIORS: Dict[str, float] = {
    "Sci-Fi": 0.58,
    "Action": 0.55,
    "Animation": 0.62,
    "Comedy": 0.48,
    "Drama": 0.42,
    "Horror": 0.50,
    "Thriller": 0.52,
    "Romance": 0.40,
}


def derive_time_of_day_category(show_time_str: str) -> str:
    """Classify 24-hour show time into standardized operational periods."""
    try:
        parts = show_time_str.split(":")
        hour = int(parts[0])
        minute = int(parts[1]) if len(parts) > 1 else 0
        dec_hour = hour + minute / 60.0

        if dec_hour < 12.0:
            return "Morning"
        elif dec_hour < 16.5:
            return "Matinee"
        elif dec_hour < 21.0:
            return "Evening"
        else:
            return "Night"
    except Exception:
        return "Matinee"


def engineer_show_features(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Derive temporal, cold-start, and pricing features from raw input payload.
    Ensures consistent inference transformations at prediction time.
    """
    feats = dict(input_data)

    # 1. Parse show date and release date
    show_date_str = feats.get("show_date", "2024-06-01")
    release_date_str = feats.get("release_date", show_date_str)
    show_time_str = feats.get("show_time", "19:45")

    try:
        s_date = datetime.strptime(show_date_str, "%Y-%m-%d")
    except Exception:
        s_date = datetime.now()

    try:
        r_date = datetime.strptime(release_date_str, "%Y-%m-%d")
    except Exception:
        r_date = s_date

    # 2. Derive temporal calendar attributes
    calc_day_of_week = s_date.weekday()
    calc_is_weekend = 1 if calc_day_of_week in [4, 5, 6] else 0
    calc_days_since_rel = max(0, (s_date - r_date).days)
    calc_time_of_day = derive_time_of_day_category(show_time_str)

    feats["day_of_week"] = calc_day_of_week if feats.get("day_of_week") is None else int(feats["day_of_week"])
    feats["is_weekend"] = calc_is_weekend if feats.get("is_weekend") is None else int(feats["is_weekend"])
    feats["days_since_release"] = calc_days_since_rel if feats.get("days_since_release") is None else int(feats["days_since_release"])
    feats["time_of_day_category"] = calc_time_of_day if feats.get("time_of_day_category") is None else str(feats["time_of_day_category"])
    feats["is_holiday"] = 0 if feats.get("is_holiday") is None else int(feats["is_holiday"])

    # 3. Screen type mapping fallback
    if feats.get("screen_type") is None:
        cap = int(feats.get("screen_capacity", 250))
        if cap >= 300:
            feats["screen_type"] = "IMAX / Premium Large Format"
        elif cap >= 200:
            feats["screen_type"] = "Standard Dolby Atmos"
        elif cap >= 150:
            feats["screen_type"] = "Standard Audi"
        else:
            feats["screen_type"] = "Boutique / VIP"

    # 4. Cold-start detection & prior imputation
    genre = str(feats.get("genre", "Action"))
    hist_shows = 0 if feats.get("historical_shows_count") is None else int(feats["historical_shows_count"])
    days_since_release = feats["days_since_release"]
    is_cold = 1 if (days_since_release <= 3 or hist_shows < 3 or feats.get("is_cold_start") is True) else 0
    feats["is_cold_start"] = is_cold
    feats["historical_shows_count"] = hist_shows

    genre_prior = GENRE_PRIORS.get(genre, 0.50)

    # Historical movie demand fallback
    if feats.get("historical_movie_demand") is None:
        feats["historical_movie_demand"] = genre_prior
    else:
        feats["historical_movie_demand"] = float(feats["historical_movie_demand"])

    # Historical genre demand fallback
    if feats.get("historical_genre_demand") is None:
        feats["historical_genre_demand"] = genre_prior
    else:
        feats["historical_genre_demand"] = float(feats["historical_genre_demand"])

    # Previous show occupancy fallback
    if feats.get("previous_show_occupancy") is None:
        feats["previous_show_occupancy"] = genre_prior
    else:
        feats["previous_show_occupancy"] = float(feats["previous_show_occupancy"])

    return feats
