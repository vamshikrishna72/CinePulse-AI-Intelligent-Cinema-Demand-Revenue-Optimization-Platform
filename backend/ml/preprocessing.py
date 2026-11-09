"""
CinePulse AI - Preprocessing Pipeline
Chronological fit-only transformation ensuring zero data leakage.
"""

from typing import List, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer

from backend.ml.features import (
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
    ALL_MODEL_FEATURES,
    TARGET_VARIABLE,
)


class CinemaPreprocessor(BaseEstimator, TransformerMixin):
    """
    Leakage-safe Preprocessor for CinePulse show records.
    - Fits OneHotEncoder & Simple Imputer strictly on training split.
    - Extracts interpretable feature names for SHAP explainability.
    """

    def __init__(self):
        self.encoder = OneHotEncoder(
            handle_unknown="ignore",
            sparse_output=False,
        )
        self.categorical_features = CATEGORICAL_FEATURES
        self.numerical_features = NUMERICAL_FEATURES
        self.feature_names_: List[str] = []
        self.num_medians_: dict = {}
        self.is_fitted = False

    def fit(self, X: pd.DataFrame, y=None):
        X_df = X.copy()

        # Compute median imputations strictly from training set
        for col in self.numerical_features:
            if col in X_df.columns:
                self.num_medians_[col] = float(X_df[col].median(skipna=True))
            else:
                self.num_medians_[col] = 0.0

        # Fit categorical encoder
        cat_df = X_df[self.categorical_features].fillna("Unknown")
        self.encoder.fit(cat_df)

        # Generate output feature names
        encoded_cat_names = list(self.encoder.get_feature_names_out(self.categorical_features))
        self.feature_names_ = encoded_cat_names + self.numerical_features
        self.is_fitted = True
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("CinemaPreprocessor must be fitted before transform.")

        X_df = X.copy()

        # Transform categoricals
        cat_df = X_df[self.categorical_features].fillna("Unknown")
        encoded_cats = self.encoder.transform(cat_df)

        # Impute numerical features using training medians
        num_vals = []
        for col in self.numerical_features:
            if col in X_df.columns:
                series = X_df[col].fillna(self.num_medians_.get(col, 0.0)).to_numpy(dtype=float)
            else:
                series = np.full(len(X_df), self.num_medians_.get(col, 0.0), dtype=float)
            num_vals.append(series.reshape(-1, 1))

        encoded_nums = np.hstack(num_vals)

        # Full feature matrix
        return np.hstack([encoded_cats, encoded_nums])

    def get_feature_names_out(self) -> List[str]:
        return list(self.feature_names_)


def split_processed_data(
    df: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series, pd.DataFrame, pd.Series]:
    """
    Split dataframe into chronologically partitioned train, val, and test sets.
    """
    train_df = df[df["split"] == "train"].copy()
    val_df = df[df["split"] == "val"].copy()
    test_df = df[df["split"] == "test"].copy()

    X_train = train_df[ALL_MODEL_FEATURES]
    y_train = train_df[TARGET_VARIABLE]

    X_val = val_df[ALL_MODEL_FEATURES]
    y_val = val_df[TARGET_VARIABLE]

    X_test = test_df[ALL_MODEL_FEATURES]
    y_test = test_df[TARGET_VARIABLE]

    return X_train, y_train, X_val, y_val, X_test, y_test

