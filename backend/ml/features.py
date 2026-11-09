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

# High-resolution curated cinema movie poster and backdrop imagery
MOVIE_POSTERS: Dict[str, str] = {
    "Quantum Horizon": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    "Apex Velocity": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
    "Shadows of Kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80",
    "Laughter Therapy": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
    "The Haunted Abbey": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&auto=format&fit=crop&q=80",
    "Kingdom of Ice & Wonder": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
    "Midnight Protocol": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
    "Letters from Verona": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop&q=80",
    "Cosmic Odyssey II": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
    "Undercover Rogue": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    "The Last Symphony": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80",
    "Feline Adventures 3D": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80",
    "Spectral Whispers": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    "Neon Syndicate": "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80",
}

GENRE_POSTERS: Dict[str, str] = {
    "Sci-Fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    "Action": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
    "Drama": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80",
    "Comedy": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
    "Horror": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&auto=format&fit=crop&q=80",
    "Animation": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
    "Romance": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop&q=80",
    "Thriller": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
}


def get_movie_poster(movie_title: str, genre: str = "Action") -> str:
    """Retrieve verified high-resolution poster artwork for movie or fallback to genre."""
    if movie_title in MOVIE_POSTERS:
        return MOVIE_POSTERS[movie_title]
    for k, v in MOVIE_POSTERS.items():
        if k.lower() in movie_title.lower() or movie_title.lower() in k.lower():
            return v
    return GENRE_POSTERS.get(genre, GENRE_POSTERS["Sci-Fi"])



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
