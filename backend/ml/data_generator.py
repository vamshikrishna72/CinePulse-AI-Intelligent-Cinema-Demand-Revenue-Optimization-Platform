"""
CinePulse AI - Synthetic Cinema Ticket Demand Dataset Generator
Strictly synthetic show-level transactional generator with zero temporal leakage.
Simulates a multi-screen cinema multiplex over a multi-month period.
"""

import os
import random
from bisect import bisect_right
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

# Set global random seeds for full reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# Screen configurations in CinePulse Multiplex
SCREENS = [
    {"screen_id": "Screen-1", "screen_type": "IMAX / Premium Large Format", "capacity": 350, "base_price": 380.0},
    {"screen_id": "Screen-2", "screen_type": "Standard Dolby Atmos", "capacity": 250, "base_price": 280.0},
    {"screen_id": "Screen-3", "screen_type": "Standard Audi", "capacity": 180, "base_price": 220.0},
    {"screen_id": "Screen-4", "screen_type": "Boutique / VIP", "capacity": 120, "base_price": 450.0},
]

# Showtime slots throughout the day
SHOW_SLOTS = [
    {"time": "10:15", "period": "Morning"},
    {"time": "13:30", "period": "Matinee"},
    {"time": "16:45", "period": "Matinee"},
    {"time": "19:45", "period": "Evening"},
    {"time": "22:45", "period": "Night"},
]

# Movie Catalog with diverse release dates, genres, and popularity scores
MOVIES_CATALOG = [
    {
        "movie_id": "MOV-001",
        "title": "Quantum Horizon",
        "genre": "Sci-Fi",
        "release_offset_days": 0,
        "popularity": 8.8,
        "decay_rate": 0.035,
        "price_premium": 1.15,
    },
    {
        "movie_id": "MOV-002",
        "title": "Apex Velocity",
        "genre": "Action",
        "release_offset_days": 10,
        "popularity": 7.9,
        "decay_rate": 0.045,
        "price_premium": 1.10,
    },
    {
        "movie_id": "MOV-003",
        "title": "Shadows of Kyoto",
        "genre": "Drama",
        "release_offset_days": 20,
        "popularity": 6.8,
        "decay_rate": 0.025,
        "price_premium": 0.95,
    },
    {
        "movie_id": "MOV-004",
        "title": "Laughter Therapy",
        "genre": "Comedy",
        "release_offset_days": 35,
        "popularity": 7.2,
        "decay_rate": 0.040,
        "price_premium": 1.00,
    },
    {
        "movie_id": "MOV-005",
        "title": "The Haunted Abbey",
        "genre": "Horror",
        "release_offset_days": 48,
        "popularity": 6.5,
        "decay_rate": 0.055,
        "price_premium": 1.00,
    },
    {
        "movie_id": "MOV-006",
        "title": "Kingdom of Ice & Wonder",
        "genre": "Animation",
        "release_offset_days": 60,
        "popularity": 9.1,
        "decay_rate": 0.030,
        "price_premium": 1.20,
    },
    {
        "movie_id": "MOV-007",
        "title": "Midnight Protocol",
        "genre": "Thriller",
        "release_offset_days": 75,
        "popularity": 7.5,
        "decay_rate": 0.040,
        "price_premium": 1.05,
    },
    {
        "movie_id": "MOV-008",
        "title": "Letters from Verona",
        "genre": "Romance",
        "release_offset_days": 90,
        "popularity": 6.2,
        "decay_rate": 0.035,
        "price_premium": 0.95,
    },
    {
        "movie_id": "MOV-009",
        "title": "Cosmic Odyssey II",
        "genre": "Sci-Fi",
        "release_offset_days": 105,
        "popularity": 9.4,
        "decay_rate": 0.032,
        "price_premium": 1.25,
    },
    {
        "movie_id": "MOV-010",
        "title": "Undercover Rogue",
        "genre": "Action",
        "release_offset_days": 120,
        "popularity": 7.4,
        "decay_rate": 0.048,
        "price_premium": 1.05,
    },
    {
        "movie_id": "MOV-011",
        "title": "The Last Symphony",
        "genre": "Drama",
        "release_offset_days": 135,
        "popularity": 5.9,
        "decay_rate": 0.022,
        "price_premium": 0.90,
    },
    {
        "movie_id": "MOV-012",
        "title": "Feline Adventures 3D",
        "genre": "Animation",
        "release_offset_days": 145,
        "popularity": 8.0,
        "decay_rate": 0.038,
        "price_premium": 1.10,
    },
    {
        "movie_id": "MOV-013",
        "title": "Spectral Whispers",
        "genre": "Horror",
        "release_offset_days": 155,
        "popularity": 6.9,
        "decay_rate": 0.050,
        "price_premium": 1.00,
    },
    {
        "movie_id": "MOV-014",
        "title": "Neon Syndicate",
        "genre": "Thriller",
        "release_offset_days": 165,
        "popularity": 8.2,
        "decay_rate": 0.038,
        "price_premium": 1.15,
    },
]

HOLIDAY_OFFSETS = {1, 15, 26, 45, 68, 88, 104, 121, 134, 160}

GENRE_PRIORS = {
    "Sci-Fi": 0.58,
    "Action": 0.55,
    "Animation": 0.62,
    "Comedy": 0.48,
    "Drama": 0.42,
    "Horror": 0.50,
    "Thriller": 0.52,
    "Romance": 0.40,
}


def generate_cinema_dataset(
    start_date_str: str = "2024-01-01",
    num_days: int = 180,
    shows_per_day_screen: int = 4,
    output_path: Optional[str] = None,
) -> pd.DataFrame:
    """
    Generate synthetic show-level cinema booking dataset with realistic dynamics:
    - Zero temporal leakage: historical features use only shows finished >= 24h prior.
    - Fast O(N) running pointer lookup for chronological cutoff.
    - Capacity constraints: tickets_sold bounded strictly by [0, screen_capacity].
    - Cold-start flags for shows with <= 3 days since release or no prior history.
    """
    random.seed(RANDOM_SEED)
    np.random.seed(RANDOM_SEED)

    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    
    movies = []
    for m in MOVIES_CATALOG:
        m_copy = dict(m)
        m_copy["release_date"] = start_date + timedelta(days=m["release_offset_days"])
        movies.append(m_copy)

    raw_shows = []
    show_counter = 1

    for day_idx in range(num_days):
        current_date = start_date + timedelta(days=day_idx)
        date_str = current_date.strftime("%Y-%m-%d")
        day_of_week = current_date.weekday()
        is_weekend = 1 if day_of_week in [4, 5, 6] else 0
        is_holiday = 1 if day_idx in HOLIDAY_OFFSETS else 0

        active_movies = [
            m for m in movies
            if 0 <= (current_date - m["release_date"]).days <= 42
        ]

        if not active_movies:
            active_movies = [movies[0]]

        for screen in SCREENS:
            selected_slots = random.sample(SHOW_SLOTS, k=min(shows_per_day_screen, len(SHOW_SLOTS)))
            selected_slots.sort(key=lambda s: s["time"])

            for slot in selected_slots:
                if screen["screen_id"] == "Screen-1":
                    sorted_movies = sorted(active_movies, key=lambda m: m["popularity"], reverse=True)
                    movie = sorted_movies[0] if random.random() < 0.8 else random.choice(active_movies)
                elif screen["screen_id"] == "Screen-4":
                    preferred = [m for m in active_movies if m["genre"] in ["Drama", "Romance", "Thriller"]]
                    movie = random.choice(preferred) if preferred and random.random() < 0.7 else random.choice(active_movies)
                else:
                    movie = random.choice(active_movies)

                days_since_release = (current_date - movie["release_date"]).days
                show_datetime = datetime.combine(
                    current_date.date(),
                    datetime.strptime(slot["time"], "%H:%M").time(),
                )

                price_mult = 1.0
                if is_weekend:
                    price_mult += 0.15
                if slot["period"] == "Evening":
                    price_mult += 0.10
                elif slot["period"] == "Morning":
                    price_mult -= 0.15

                ticket_price = round(screen["base_price"] * movie["price_premium"] * price_mult, 2)

                raw_shows.append({
                    "show_id": f"SHW-{show_counter:06d}",
                    "show_datetime": show_datetime,
                    "show_date": date_str,
                    "show_time": slot["time"],
                    "day_of_week": day_of_week,
                    "is_weekend": is_weekend,
                    "is_holiday": is_holiday,
                    "time_of_day_category": slot["period"],
                    "screen_id": screen["screen_id"],
                    "screen_type": screen["screen_type"],
                    "screen_capacity": screen["capacity"],
                    "ticket_price": ticket_price,
                    "movie_id": movie["movie_id"],
                    "movie_title": movie["title"],
                    "genre": movie["genre"],
                    "release_date": movie["release_date"].strftime("%Y-%m-%d"),
                    "days_since_release": days_since_release,
                    "movie_popularity": movie["popularity"],
                    "decay_rate": movie["decay_rate"],
                })
                show_counter += 1

    df_shows = pd.DataFrame(raw_shows)
    df_shows.sort_values(by="show_datetime", inplace=True)
    df_shows.reset_index(drop=True, inplace=True)

    tickets_sold_list = []
    occupancy_rate_list = []

    for _, row in df_shows.iterrows():
        cap = row["screen_capacity"]
        pop = row["movie_popularity"]
        days = max(0, row["days_since_release"])
        decay = row["decay_rate"]
        period = row["time_of_day_category"]
        is_wknd = row["is_weekend"]
        is_hol = row["is_holiday"]
        genre = row["genre"]
        price = row["ticket_price"]

        base_occ = GENRE_PRIORS.get(genre, 0.50)
        pop_factor = 1.0 + (pop - 7.0) * 0.08
        lifecycle_factor = max(0.35, np.exp(-decay * days))

        day_factor = 1.0
        if is_wknd:
            day_factor += 0.35
            if genre in ["Animation", "Sci-Fi", "Action"]:
                day_factor += 0.10
        if is_hol:
            day_factor += 0.28

        tod_mult = {
            "Morning": 0.65,
            "Matinee": 0.88,
            "Evening": 1.28,
            "Night": 1.08,
        }.get(period, 1.0)

        price_factor = (price / 280.0) ** (-0.45)
        expected_occ = base_occ * pop_factor * lifecycle_factor * day_factor * tod_mult * price_factor

        shock = np.random.normal(0, 0.075)
        simulated_occ = float(np.clip(expected_occ + shock, 0.05, 0.98))

        tickets = int(round(simulated_occ * cap))
        tickets = max(0, min(cap, tickets))
        actual_occ = round(tickets / cap, 4)

        tickets_sold_list.append(tickets)
        occupancy_rate_list.append(actual_occ)

    df_shows["tickets_sold"] = tickets_sold_list
    df_shows["occupancy_rate"] = occupancy_rate_list
    df_shows["revenue"] = (df_shows["tickets_sold"] * df_shows["ticket_price"]).round(2)
    df_shows["empty_seats"] = df_shows["screen_capacity"] - df_shows["tickets_sold"]

    # Fast indexed running pointer
    datetimes = df_shows["show_datetime"].tolist()
    movie_ids = df_shows["movie_id"].tolist()
    genres = df_shows["genre"].tolist()
    screen_ids = df_shows["screen_id"].tolist()
    occupancies = df_shows["occupancy_rate"].tolist()
    days_since_rels = df_shows["days_since_release"].tolist()

    movie_occ_sums: Dict[str, float] = {}
    movie_occ_counts: Dict[str, int] = {}
    genre_occ_history: Dict[str, List[float]] = {}
    screen_last_occ: Dict[str, float] = {}

    historical_movie_demand = []
    historical_genre_demand = []
    previous_show_occupancy = []
    is_cold_start_list = []
    show_counts_list = []

    past_pointer = 0
    num_total = len(df_shows)

    for i in range(num_total):
        current_dt = datetimes[i]
        cutoff_dt = current_dt - timedelta(hours=24)

        while past_pointer < num_total and datetimes[past_pointer] <= cutoff_dt:
            p_movie = movie_ids[past_pointer]
            p_genre = genres[past_pointer]
            p_screen = screen_ids[past_pointer]
            p_occ = occupancies[past_pointer]

            movie_occ_sums[p_movie] = movie_occ_sums.get(p_movie, 0.0) + p_occ
            movie_occ_counts[p_movie] = movie_occ_counts.get(p_movie, 0) + 1

            if p_genre not in genre_occ_history:
                genre_occ_history[p_genre] = []
            genre_occ_history[p_genre].append(p_occ)

            screen_last_occ[p_screen] = p_occ
            past_pointer += 1

        m_id = movie_ids[i]
        m_cnt = movie_occ_counts.get(m_id, 0)
        show_counts_list.append(m_cnt)

        is_cold = 1 if (days_since_rels[i] <= 3 or m_cnt < 3) else 0
        is_cold_start_list.append(is_cold)

        if m_cnt >= 1:
            h_mov_occ = round(movie_occ_sums[m_id] / m_cnt, 4)
        else:
            h_mov_occ = round(GENRE_PRIORS.get(genres[i], 0.50), 4)
        historical_movie_demand.append(h_mov_occ)

        g_hist = genre_occ_history.get(genres[i], [])
        if g_hist:
            trailing = g_hist[-25:]
            h_gen_occ = round(sum(trailing) / len(trailing), 4)
        else:
            h_gen_occ = round(GENRE_PRIORS.get(genres[i], 0.50), 4)
        historical_genre_demand.append(h_gen_occ)

        prev_occ = screen_last_occ.get(screen_ids[i], occupancies[i])
        previous_show_occupancy.append(round(prev_occ, 4))

    df_shows["historical_movie_demand"] = historical_movie_demand
    df_shows["historical_genre_demand"] = historical_genre_demand
    df_shows["previous_show_occupancy"] = previous_show_occupancy
    df_shows["is_cold_start"] = is_cold_start_list
    df_shows["historical_shows_count"] = show_counts_list

    def categorize_demand(occ: float) -> str:
        if occ < 0.40:
            return "Low Demand"
        elif occ <= 0.75:
            return "Moderate Demand"
        else:
            return "High Demand"

    df_shows["demand_category"] = df_shows["occupancy_rate"].apply(categorize_demand)
    df_shows["is_synthetic"] = True

    # Chronological dataset splitting strictly by date boundaries (zero overlap)
    # 70% Train (~126 days), 15% Validation (~27 days), 15% Test (~27 days)
    train_cutoff_day = int(num_days * 0.70)
    val_cutoff_day = int(num_days * 0.85)

    train_cutoff_date = (start_date + timedelta(days=train_cutoff_day)).strftime("%Y-%m-%d")
    val_cutoff_date = (start_date + timedelta(days=val_cutoff_day)).strftime("%Y-%m-%d")

    split_labels = []
    for _, r in df_shows.iterrows():
        s_date = r["show_date"]
        if s_date < train_cutoff_date:
            split_labels.append("train")
        elif s_date < val_cutoff_date:
            split_labels.append("val")
        else:
            split_labels.append("test")

    df_shows["split"] = split_labels

    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df_shows.to_csv(output_path, index=False)
        print(f"Dataset successfully saved to: {output_path} (Total records: {len(df_shows)})")

    return df_shows


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "../.."))
    raw_path = os.path.join(project_root, "data", "raw", "cinema_shows_synthetic.csv")
    df = generate_cinema_dataset(
        start_date_str="2024-01-01",
        num_days=180,
        shows_per_day_screen=4,
        output_path=raw_path,
    )
    print("\nDataset Summary:")
    print(f"Total shows: {len(df)}")
    print(f"Date range: {df['show_date'].min()} to {df['show_date'].max()}")
    print("Splits:", df['split'].value_counts().to_dict())
    print("Genres:", df['genre'].value_counts().to_dict())
    print("Demand categories:", df['demand_category'].value_counts().to_dict())
    print(f"Cold-start shows: {df['is_cold_start'].sum()} ({df['is_cold_start'].mean():.1%})")
    print(f"Average tickets sold: {df['tickets_sold'].mean():.1f} / Average occupancy: {df['occupancy_rate'].mean():.1%}")
