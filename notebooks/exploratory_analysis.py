"""
CinePulse AI - Exploratory Data Analysis & Leakage Verification
Generates comprehensive distribution statistics, checks for temporal leakage,
and creates visualization artifacts for technical report.
"""

import json
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns


def run_eda(data_path: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    plots_dir = os.path.join(output_dir, "eda_plots")
    os.makedirs(plots_dir, exist_ok=True)

    df = pd.read_csv(data_path)
    df["show_datetime"] = pd.to_datetime(df["show_datetime"])

    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    # 1. Basic Data Quality Checks
    null_counts = df.isnull().sum().to_dict()
    duplicate_count = int(df.duplicated(subset=["show_id"]).sum())
    
    # 2. Chronological Split Integrity Check
    train_dates = df[df["split"] == "train"]["show_datetime"]
    val_dates = df[df["split"] == "val"]["show_datetime"]
    test_dates = df[df["split"] == "test"]["show_datetime"]

    split_check = {
        "train_min": str(train_dates.min()),
        "train_max": str(train_dates.max()),
        "val_min": str(val_dates.min()),
        "val_max": str(val_dates.max()),
        "test_min": str(test_dates.min()),
        "test_max": str(test_dates.max()),
        "train_val_leakage": bool(train_dates.max() >= val_dates.min()),
        "val_test_leakage": bool(val_dates.max() >= test_dates.min()),
    }

    # 3. Descriptive Stats
    demand_stats = {
        "tickets_sold_mean": float(df["tickets_sold"].mean()),
        "tickets_sold_std": float(df["tickets_sold"].std()),
        "tickets_sold_min": int(df["tickets_sold"].min()),
        "tickets_sold_max": int(df["tickets_sold"].max()),
        "occupancy_rate_mean": float(df["occupancy_rate"].mean()),
        "revenue_mean": float(df["revenue"].mean()),
        "cold_start_count": int(df["is_cold_start"].sum()),
        "cold_start_pct": float(df["is_cold_start"].mean() * 100),
    }

    # Grouped stats
    weekend_stats = df.groupby("is_weekend")["occupancy_rate"].mean().to_dict()
    tod_stats = df.groupby("time_of_day_category")["occupancy_rate"].mean().to_dict()
    genre_stats = df.groupby("genre")["occupancy_rate"].mean().to_dict()
    screen_stats = df.groupby("screen_id")[["screen_capacity", "tickets_sold", "occupancy_rate"]].mean().to_dict()

    eda_summary = {
        "total_records": len(df),
        "columns": list(df.columns),
        "duplicates": duplicate_count,
        "null_counts": {k: int(v) for k, v in null_counts.items() if v > 0},
        "chronological_splits": split_check,
        "demand_statistics": demand_stats,
        "weekend_occupancy": weekend_stats,
        "time_of_day_occupancy": tod_stats,
        "genre_occupancy": genre_stats,
    }

    summary_file = os.path.join(output_dir, "eda_summary.json")
    with open(summary_file, "w") as f:
        json.dump(eda_summary, f, indent=2)
    print(f"Saved EDA summary metrics to {summary_file}")

    # Generate Visualizations with CinePulse Brand Aesthetic
    # Palette: Burgundy #241018, Gold #D8B46A, Rose #B66B7B, Charcoal #17171D
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    
    # Plot 1: Target Variable Distribution (Tickets Sold)
    plt.figure(figsize=(9, 5))
    sns.histplot(df["tickets_sold"], kde=True, color="#B66B7B", bins=30)
    plt.axvline(df["tickets_sold"].mean(), color="#D8B46A", linestyle="--", linewidth=2, label=f'Mean: {df["tickets_sold"].mean():.1f}')
    plt.title("Distribution of Tickets Sold (Show-Level Target Variable)", fontsize=13, fontweight="bold", color="#241018")
    plt.xlabel("Tickets Sold per Show", fontsize=11)
    plt.ylabel("Show Count", fontsize=11)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "target_distribution.png"), dpi=200)
    plt.close()

    # Plot 2: Occupancy by Showtime Period & Weekend
    plt.figure(figsize=(10, 5))
    sns.barplot(
        data=df,
        x="time_of_day_category",
        y="occupancy_rate",
        hue="is_weekend",
        palette=["#89858C", "#D8B46A"],
        order=["Morning", "Matinee", "Evening", "Night"]
    )
    plt.title("Mean Occupancy Rate by Showtime Period & Weekend Status", fontsize=13, fontweight="bold", color="#241018")
    plt.xlabel("Showtime Period", fontsize=11)
    plt.ylabel("Occupancy Rate (0.0 to 1.0)", fontsize=11)
    plt.ylim(0, 1.0)
    plt.legend(title="Weekend (1=Fri-Sun)", labels=["Weekday", "Weekend"])
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "occupancy_by_tod_weekend.png"), dpi=200)
    plt.close()

    # Plot 3: Genre Demand Boxplots
    plt.figure(figsize=(10, 5))
    sns.boxplot(
        data=df,
        x="genre",
        y="occupancy_rate",
        palette="Reds",
        order=df.groupby("genre")["occupancy_rate"].median().sort_values(ascending=False).index
    )
    plt.title("Show Occupancy Rate Distribution by Movie Genre", fontsize=13, fontweight="bold", color="#241018")
    plt.xlabel("Genre", fontsize=11)
    plt.ylabel("Occupancy Rate", fontsize=11)
    plt.xticks(rotation=25)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "occupancy_by_genre.png"), dpi=200)
    plt.close()

    # Plot 4: Chronological Timeline of Tickets Sold
    plt.figure(figsize=(12, 5))
    plt.plot(df["show_datetime"], df["tickets_sold"], alpha=0.35, color="#89858C", label="Show Actuals")
    # 7-day rolling average
    rolling_avg = df.set_index("show_datetime")["tickets_sold"].rolling("7D").mean()
    plt.plot(rolling_avg.index, rolling_avg.values, color="#241018", linewidth=2.2, label="7-Day Rolling Trend")
    plt.axvline(val_dates.min(), color="#D8B46A", linestyle="--", linewidth=1.8, label="Train / Val Split")
    plt.axvline(test_dates.min(), color="#B66B7B", linestyle="--", linewidth=1.8, label="Val / Test Split")
    plt.title("Chronological Ticket Sales & Leakage-Free Validation Splits", fontsize=13, fontweight="bold", color="#241018")
    plt.xlabel("Show Date", fontsize=11)
    plt.ylabel("Tickets Sold", fontsize=11)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, "chronological_split_timeline.png"), dpi=200)
    plt.close()

    print(f"Generated 4 EDA plots in {plots_dir}")
    return eda_summary


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, ".."))
    raw_path = os.path.join(project_root, "data", "raw", "cinema_shows_synthetic.csv")
    rep_dir = os.path.join(project_root, "reports")
    run_eda(raw_path, rep_dir)

