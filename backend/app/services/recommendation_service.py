"""
CinePulse AI - Smart Operational Recommendations Service
Consumes real model predictions and emits actionable, rule-governed recommendations.
"""

import os
from typing import List
import pandas as pd

from backend.app.core.config import ARTIFACTS_DIR
from backend.app.schemas.show import RecommendationItem


class RecommendationService:
    def __init__(self):
        self.predictions_path = os.path.join(ARTIFACTS_DIR, "test_predictions.csv")
        self._load_data()

    def _load_data(self):
        if os.path.exists(self.predictions_path):
            self.df = pd.read_csv(self.predictions_path)
        else:
            self.df = pd.DataFrame()

    def generate_recommendations(self) -> List[RecommendationItem]:
        if self.df.empty:
            self._load_data()
            if self.df.empty:
                return []

        recommendations: List[RecommendationItem] = []
        rec_id = 1

        # Sort by show_datetime to prioritize upcoming shows
        sorted_df = self.df.sort_values(by="show_datetime", ascending=False).head(120)

        for _, row in sorted_df.iterrows():
            pred_tickets = int(row["champ_pred"])
            cap = int(row["screen_capacity"])
            occ_pct = round((pred_tickets / cap) * 100.0, 1)
            is_cold = bool(row["is_cold_start"])
            m_title = str(row["movie_title"])
            s_id = str(row["screen_id"])
            s_time = str(row["show_time"])
            s_date = str(row["show_date"])
            show_id = str(row["show_id"])
            price = float(row["ticket_price"])

            # 1. High Occupancy in Smaller Screen -> Upsize Screen
            if occ_pct >= 75.0 and cap <= 180 and len([r for r in recommendations if r.type == "screen_reallocation"]) < 4:
                unmet_demand_est = int(round(cap * 0.25))
                rev_impact = unmet_demand_est * price
                recommendations.append(
                    RecommendationItem(
                        id=f"REC-{rec_id:04d}",
                        type="screen_reallocation",
                        priority="high",
                        title=f"Capacity Saturation Alert: '{m_title}' on {s_id}",
                        description=(
                            f"Model predicts {pred_tickets}/{cap} seats ({occ_pct}% occupancy) for {m_title} on {s_date} at {s_time}. "
                            f"Seating is close to saturation, risking spillover and lost box-office revenue."
                        ),
                        suggested_action=f"Reallocate '{m_title}' from {s_id} ({cap} seats) to Screen-1 (350 seats) or Screen-2 (250 seats).",
                        affected_show_id=show_id,
                        movie_title=m_title,
                        screen_id=s_id,
                        show_time=s_time,
                        predicted_occupancy_pct=occ_pct,
                        expected_revenue_impact=f"+₹{rev_impact:,.0f} potential spillover capture",
                    )
                )
                rec_id += 1

            # 2. Low Occupancy in Large Audi -> Downsize Screen
            elif occ_pct <= 22.0 and cap >= 250 and len([r for r in recommendations if r.type == "screen_reallocation"]) < 4:
                cost_savings = 3500.0
                recommendations.append(
                    RecommendationItem(
                        id=f"REC-{rec_id:04d}",
                        type="screen_reallocation",
                        priority="medium",
                        title=f"Underutilized Premium Screen: '{m_title}' on {s_id}",
                        description=(
                            f"Only {pred_tickets}/{cap} seats ({occ_pct}% occupancy) forecast for {m_title} on {s_date} at {s_time}. "
                            f"Operating a {cap}-seat large auditorium for low demand results in HVAC and projection inefficiency."
                        ),
                        suggested_action=f"Shift screening to Screen-3 (180 seats) or Screen-4 (120 seats); release {s_id} for higher-demand titles.",
                        affected_show_id=show_id,
                        movie_title=m_title,
                        screen_id=s_id,
                        show_time=s_time,
                        predicted_occupancy_pct=occ_pct,
                        expected_revenue_impact=f"~₹{cost_savings:,.0f} energy & operations optimization",
                    )
                )
                rec_id += 1

            # 3. Heavy Audience Rush -> Staffing Reinforcement
            if pred_tickets >= 160 and occ_pct >= 65.0 and len([r for r in recommendations if r.type == "staffing"]) < 3:
                recommendations.append(
                    RecommendationItem(
                        id=f"REC-{rec_id:04d}",
                        type="staffing",
                        priority="high",
                        title=f"Staffing Reinforcement Required: {m_title} ({s_time})",
                        description=(
                            f"High attendance forecast ({pred_tickets} patrons, {occ_pct}% occupancy) creates acute concession "
                            f"and entry turnstile congestion 20-30 minutes before showtime."
                        ),
                        suggested_action="Deploy +2 F&B concession attendants and +1 ticket usher between T-45m and T+10m.",
                        affected_show_id=show_id,
                        movie_title=m_title,
                        screen_id=s_id,
                        show_time=s_time,
                        predicted_occupancy_pct=occ_pct,
                        expected_revenue_impact="Reduces concession queues and accelerates F&B transaction velocity",
                    )
                )
                rec_id += 1

            # 4. Cold-Start Watch -> Tracking Protocol
            if is_cold and len([r for r in recommendations if r.type == "cold_start_watch"]) < 3:
                recommendations.append(
                    RecommendationItem(
                        id=f"REC-{rec_id:04d}",
                        type="cold_start_watch",
                        priority="medium",
                        title=f"New Release Tracking Protocol: '{m_title}'",
                        description=(
                            f"Newly released title with <= 3 days screening history. Model is currently relying on genre prior anchor "
                            f"with wider prediction variance (±32.2 tickets)."
                        ),
                        suggested_action="Perform mandatory pre-booking velocity review at T-12h and T-4h before locking auditorium allocations.",
                        affected_show_id=show_id,
                        movie_title=m_title,
                        screen_id=s_id,
                        show_time=s_time,
                        predicted_occupancy_pct=occ_pct,
                        expected_revenue_impact="Protects against misallocating major screens during opening weekend volatility",
                    )
                )
                rec_id += 1

            # 5. Low Demand Weekday Promotion
            if occ_pct <= 25.0 and not row["is_weekend"] and len([r for r in recommendations if r.type == "pricing_promo"]) < 3:
                recommendations.append(
                    RecommendationItem(
                        id=f"REC-{rec_id:04d}",
                        type="pricing_promo",
                        priority="low",
                        title=f"Weekday Matinee Demand Stimulation: '{m_title}'",
                        description=(
                            f"Soft demand expected ({pred_tickets} tickets, {occ_pct}%) on weekday {s_date}. "
                            f"Historical elasticity indicates sensitivity to mid-week price concessions."
                        ),
                        suggested_action="Activate online 20% bundle discount (Popcorn + Ticket combo) or loyalty member credits.",
                        affected_show_id=show_id,
                        movie_title=m_title,
                        screen_id=s_id,
                        show_time=s_time,
                        predicted_occupancy_pct=occ_pct,
                        expected_revenue_impact="+15-20% incremental attendance uplift",
                    )
                )
                rec_id += 1

            if len(recommendations) >= 12:
                break

        return recommendations
