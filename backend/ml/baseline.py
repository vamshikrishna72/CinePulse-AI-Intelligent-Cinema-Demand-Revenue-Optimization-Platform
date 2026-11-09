"""
CinePulse AI - Capacity-Adjusted Historical Baseline Model
"""

import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, RegressorMixin
from backend.ml.features import GENRE_PRIORS


class CapacityAdjustedHistoricalBaseline(BaseEstimator, RegressorMixin):
    """
    Naive Domain Baseline Model:
    Calculates expected tickets based on screen capacity multiplied by
    the 24h-prior historical movie occupancy rate (or genre prior if cold-start).
    """

    def __init__(self):
        self.genre_priors_ = GENRE_PRIORS
        self.global_mean_occ_ = 0.50

    def fit(self, X: pd.DataFrame, y: pd.Series = None):
        if "occupancy_rate" in X.columns:
            self.global_mean_occ_ = float(X["occupancy_rate"].mean())
        return self

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        preds = []
        for _, row in X.iterrows():
            cap = row.get("screen_capacity", 250)
            hist_mov = row.get("historical_movie_demand", None)
            hist_gen = row.get("historical_genre_demand", None)
            genre = row.get("genre", "Action")

            if pd.notnull(hist_mov) and hist_mov > 0:
                expected_occ = hist_mov
            elif pd.notnull(hist_gen) and hist_gen > 0:
                expected_occ = hist_gen
            else:
                expected_occ = self.genre_priors_.get(genre, self.global_mean_occ_)

            pred_tickets = cap * expected_occ
            preds.append(pred_tickets)

        return np.array(preds)

