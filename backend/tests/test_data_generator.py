"""
Tests for CinePulse AI synthetic data generator and leakage-free chronological splitting.
"""

import os
import sys
import pandas as pd
import pytest

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.ml.data_generator import generate_cinema_dataset


def test_dataset_generation_and_constraints(tmp_path):
    output_file = str(tmp_path / "test_shows.csv")
    df = generate_cinema_dataset(
        start_date_str="2024-01-01",
        num_days=30,  # fast test run
        shows_per_day_screen=3,
        output_path=output_file,
    )

    assert os.path.exists(output_file)
    assert len(df) > 100

    required_cols = [
        "show_id",
        "show_datetime",
        "show_date",
        "show_time",
        "screen_id",
        "screen_capacity",
        "ticket_price",
        "movie_title",
        "genre",
        "days_since_release",
        "movie_popularity",
        "tickets_sold",
        "occupancy_rate",
        "historical_movie_demand",
        "is_cold_start",
        "split",
    ]
    for col in required_cols:
        assert col in df.columns, f"Missing required column: {col}"

    # Strict capacity bounds test
    assert (df["tickets_sold"] >= 0).all(), "Negative tickets sold detected!"
    assert (df["tickets_sold"] <= df["screen_capacity"]).all(), "Tickets sold exceed screen capacity!"
    assert (df["occupancy_rate"] >= 0.0).all() and (df["occupancy_rate"] <= 1.0).all()


def test_chronological_splits_leakage_free():
    raw_path = os.path.join(PROJECT_ROOT, "data", "raw", "cinema_shows_synthetic.csv")
    if not os.path.exists(raw_path):
        pytest.skip("Full dataset not yet generated on disk.")

    df = pd.read_csv(raw_path)
    df["show_datetime"] = pd.to_datetime(df["show_datetime"])

    train_dates = df[df["split"] == "train"]["show_datetime"]
    val_dates = df[df["split"] == "val"]["show_datetime"]
    test_dates = df[df["split"] == "test"]["show_datetime"]

    # Verify strict time ordering without overlap
    assert train_dates.max() < val_dates.min(), "Leakage detected: train split overlaps into validation split!"
    assert val_dates.max() < test_dates.min(), "Leakage detected: validation split overlaps into test split!"

