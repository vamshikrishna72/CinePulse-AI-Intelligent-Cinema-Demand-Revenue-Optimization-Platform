"""
CinePulse AI - Analytics & Aggregation Service
Extracts operational time-series, genre comparisons, screen utilization,
and dashboard KPI summaries.
"""

import os
from typing import Any, Dict, List
import numpy as np
import pandas as pd

from backend.app.core.config import ARTIFACTS_DIR, RAW_DATA_PATH
from backend.app.schemas.show import DashboardSummary, ScreenUtilizationItem


class AnalyticsService:
    def __init__(self):
        self.predictions_path = os.path.join(ARTIFACTS_DIR, "test_predictions.csv")
        self.raw_data_path = RAW_DATA_PATH
        self._load_datasets()

    def _load_datasets(self):
        if os.path.exists(self.predictions_path):
            self.test_df = pd.read_csv(self.predictions_path)
        else:
            self.test_df = pd.DataFrame()

        if os.path.exists(self.raw_data_path):
            self.raw_df = pd.read_csv(self.raw_data_path)
        else:
            self.raw_df = pd.DataFrame()

    def get_dashboard_summary(self) -> DashboardSummary:
        self._load_datasets()
        df = self.test_df if not self.test_df.empty else self.raw_df
        if df.empty:
            raise RuntimeError("No show records available.")

        pred_col = "champ_pred" if "champ_pred" in df.columns else "tickets_sold"
        
        total_shows = len(df)
        total_tickets = int(df[pred_col].sum())
        total_rev = float((df[pred_col] * df["ticket_price"]).sum())
        avg_occ = float((df[pred_col] / df["screen_capacity"]).mean() * 100.0)

        # Categorization
        occ_series = df[pred_col] / df["screen_capacity"]
        high_cnt = int((occ_series > 0.75).sum())
        mod_cnt = int(((occ_series >= 0.40) & (occ_series <= 0.75)).sum())
        low_cnt = int((occ_series < 0.40).sum())

        # Screen utilization breakdown
        screen_items: List[ScreenUtilizationItem] = []
        for s_id, s_group in df.groupby("screen_id"):
            s_type = s_group["screen_type"].iloc[0]
            cap = int(s_group["screen_capacity"].iloc[0])
            s_shows = len(s_group)
            s_avg_occ = round(float((s_group[pred_col] / cap).mean() * 100.0), 1)
            s_rev = round(float((s_group[pred_col] * s_group["ticket_price"]).sum()), 2)

            screen_items.append(
                ScreenUtilizationItem(
                    screen_id=s_id,
                    screen_type=s_type,
                    capacity=cap,
                    total_shows=s_shows,
                    avg_occupancy_pct=s_avg_occ,
                    total_revenue=s_rev,
                )
            )

        screen_items.sort(key=lambda x: x.screen_id)

        # Recent upcoming shows
        recent_records = (
            df.sort_values(by="show_datetime", ascending=False)
            .head(20)
            .to_dict(orient="records")
        )

        date_range = {
            "start": str(df["show_date"].min()),
            "end": str(df["show_date"].max()),
        }

        return DashboardSummary(
            total_shows=total_shows,
            total_predicted_tickets=total_tickets,
            average_occupancy_pct=round(avg_occ, 1),
            total_projected_revenue=round(total_rev, 2),
            high_demand_shows_count=high_cnt,
            moderate_demand_shows_count=mod_cnt,
            low_demand_shows_count=low_cnt,
            screen_utilization=screen_items,
            recent_shows=recent_records,
            date_range=date_range,
        )

    def get_demand_analytics(self) -> Dict[str, Any]:
        self._load_datasets()
        df = self.test_df if not self.test_df.empty else self.raw_df
        pred_col = "champ_pred" if "champ_pred" in df.columns else "tickets_sold"

        # 1. Daily demand aggregation (time series)
        daily_group = df.groupby("show_date").agg(
            actual_tickets=("tickets_sold", "sum"),
            predicted_tickets=(pred_col, "sum"),
            shows_count=("show_id", "count"),
            avg_occupancy=("occupancy_rate", lambda x: round(float(x.mean() * 100.0), 1)),
            total_revenue=("revenue", "sum"),
        ).reset_index()

        daily_series = daily_group.to_dict(orient="records")

        # 2. Genre-wise demand performance
        genre_group = df.groupby("genre").agg(
            shows_count=("show_id", "count"),
            avg_occupancy=("occupancy_rate", lambda x: round(float(x.mean() * 100.0), 1)),
            total_tickets=("tickets_sold", "sum"),
            predicted_tickets=(pred_col, "sum"),
            avg_price=("ticket_price", lambda x: round(float(x.mean()), 1)),
        ).reset_index()

        genre_group.sort_values(by="avg_occupancy", ascending=False, inplace=True)
        genre_series = genre_group.to_dict(orient="records")

        # 3. Weekday vs Weekend by Showtime Period
        tod_order = ["Morning", "Matinee", "Evening", "Night"]
        tod_patterns = []
        for period in tod_order:
            sub = df[df["time_of_day_category"] == period]
            if not sub.empty:
                wd = sub[sub["is_weekend"] == 0]
                we = sub[sub["is_weekend"] == 1]
                tod_patterns.append({
                    "period": period,
                    "weekday_occupancy": round(float(wd["occupancy_rate"].mean() * 100.0), 1) if not wd.empty else 0.0,
                    "weekend_occupancy": round(float(we["occupancy_rate"].mean() * 100.0), 1) if not we.empty else 0.0,
                    "weekday_avg_tickets": round(float(wd[pred_col].mean()), 1) if not wd.empty else 0.0,
                    "weekend_avg_tickets": round(float(we[pred_col].mean()), 1) if not we.empty else 0.0,
                })

        # 4. Demand Distribution counts
        demand_dist = {
            "Low Demand (<40%)": int((df["occupancy_rate"] < 0.40).sum()),
            "Moderate Demand (40-75%)": int(((df["occupancy_rate"] >= 0.40) & (df["occupancy_rate"] <= 0.75)).sum()),
            "High Demand (>75%)": int((df["occupancy_rate"] > 0.75).sum()),
        }

        return {
            "daily_trends": daily_series,
            "genre_performance": genre_series,
            "time_of_day_patterns": tod_patterns,
            "demand_distribution": demand_dist,
        }

