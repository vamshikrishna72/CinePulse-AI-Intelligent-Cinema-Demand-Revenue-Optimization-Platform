# CinePulse AI: Dataset Schema & Data Dictionary

**Dataset File:** `data/raw/cinema_shows_synthetic.csv`  
**Total Records:** 2,880 rows  
**Total Columns:** 31  
**Operating Horizon:** 180 calendar days (2024-01-01 to 2024-06-28)  
**Prediction Unit:** One individual cinema show  
**Target Variable:** `tickets_sold`  
**Forecast Horizon:** Strict 24 Hours before show starts ($T - 24\text{h}$)  
**Provenance:** Programmatically synthesized microeconomic multiplex transactions (`is_synthetic = True`). Zero customer personal data (PII).

---

## 1. Column-by-Column Schema Dictionary

| Column Name | Data Type | Role | Physical Range / Domain | Temporal Availability | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `show_id` | String | Identifier | `SHW-000001` to `SHW-002880` | Pre-scheduled ($T-24\text{h}$) | Unique alphanumeric transaction identifier for the scheduled screening. |
| `show_datetime` | Datetime | Index / Split | `2024-01-01 10:15:00` to `2024-06-28 22:45:00` | Pre-scheduled ($T-24\text{h}$) | Precise timestamp when the screening commences. |
| `show_date` | Date (YYYY-MM-DD) | Temporal Feature | `2024-01-01` to `2024-06-28` | Pre-scheduled ($T-24\text{h}$) | Calendar date of the show. Used for chronological ordering. |
| `show_time` | Time (HH:MM) | Temporal Feature | `10:15`, `13:30`, `16:45`, `19:45`, `22:45` | Pre-scheduled ($T-24\text{h}$) | 24-hour start time of screening. |
| `day_of_week` | Integer | Predictive Feature | `0` (Monday) to `6` (Sunday) | Pre-scheduled ($T-24\text{h}$) | Day of week integer index. |
| `is_weekend` | Binary Flag | Predictive Feature | `0` or `1` | Pre-scheduled ($T-24\text{h}$) | `1` if screening falls on Friday, Saturday, or Sunday; else `0`. |
| `is_holiday` | Binary Flag | Predictive Feature | `0` or `1` | Pre-scheduled ($T-24\text{h}$) | `1` for public holiday or major festival dates. |
| `time_of_day_category` | Categorical | Predictive Feature | `Morning`, `Matinee`, `Evening`, `Night` | Pre-scheduled ($T-24\text{h}$) | Binned showtime category: Morning (<12:00), Matinee (12:00-16:30), Evening (16:30-21:00), Night (>21:00). |
| `screen_id` | Categorical | Physical Feature | `Screen-1`, `Screen-2`, `Screen-3`, `Screen-4` | Pre-scheduled ($T-24\text{h}$) | Auditorium identifier within the multiplex. |
| `screen_type` | Categorical | Physical Feature | `IMAX / Premium Large Format`, `Standard Dolby Atmos`, `Standard Audi`, `Boutique / VIP` | Pre-scheduled ($T-24\text{h}$) | Projection and audio technology tier of the auditorium. |
| `screen_capacity` | Integer | Physical Constraint | `120`, `180`, `250`, `350` | Pre-scheduled ($T-24\text{h}$) | Total physical seating capacity of the auditorium. Acts as strict upper bound for `tickets_sold`. |
| `ticket_price` | Float (INR ₹) | Economic Feature | `₹149.50` to `₹595.00` | Pre-scheduled ($T-24\text{h}$) | Base admission ticket price for this screening slot and screen type. |
| `movie_id` | String | Metadata | `MOV-001` to `MOV-014` | Pre-scheduled ($T-24\text{h}$) | Unique identifier of the motion picture being screened. |
| `movie_title` | String | Metadata | e.g. "Quantum Horizon", "Apex Velocity" | Pre-scheduled ($T-24\text{h}$) | Official theatrical release title. |
| `genre` | Categorical | Predictive Feature | `Sci-Fi`, `Action`, `Drama`, `Comedy`, `Horror`, `Animation`, `Romance`, `Thriller` | Pre-scheduled ($T-24\text{h}$) | Primary narrative genre. |
| `release_date` | Date (YYYY-MM-DD) | Temporal Feature | `2024-01-01` to `2024-06-15` | Pre-scheduled ($T-24\text{h}$) | Official theatrical premiere date. |
| `days_since_release` | Integer | Predictive Feature | `0` to `42` | Pre-scheduled ($T-24\text{h}$) | Elapsed calendar days between theatrical release and show date ($\ge 0$). Governs lifecycle decay. |
| `movie_popularity` | Float | Predictive Feature | `5.9` to `9.4` | Known at $T-24\text{h}$ | Pre-release audience buzz and star power rating (1.0 to 10.0 scale). |
| `decay_rate` | Float | Internal Parameter | `0.022` to `0.055` | Pre-configured | Exponential decay parameter governing post-opening momentum erosion. |
| `tickets_sold` | **Integer** | **PRIMARY TARGET** | `0` to `screen_capacity` | **EXCLUDED AT INFERENCE** (Actual target) | Total admissions tickets sold. Must be strictly bounded $0 \le \text{tickets\_sold} \le \text{screen\_capacity}$. |
| `occupancy_rate` | Float | Derived Metric | `0.0` to `1.0` | Derived from Target | Actual occupancy fraction ($\text{tickets\_sold} / \text{screen\_capacity}$). Used for operational categorization. |
| `revenue` | Float (INR ₹) | Derived Metric | `₹0.00` to `₹133,000.00` | Derived from Target | Total box-office admissions gross ($\text{tickets\_sold} \times \text{ticket\_price}$). |
| `empty_seats` | Integer | Derived Metric | `0` to `screen_capacity` | Derived from Target | Physical unoccupied seats ($\text{screen\_capacity} - \text{tickets\_sold}$). |
| `historical_movie_demand`| Float | Lag Feature (Safe) | `0.05` to `0.98` | Concluded shows prior to $T-24\text{h}$ | Trailing mean occupancy rate of this movie from completed shows. Cold-start fallback = genre prior. |
| `historical_genre_demand`| Float | Lag Feature (Safe) | `0.35` to `0.75` | Concluded shows prior to $T-24\text{h}$ | Trailing 25-show rolling average occupancy of films within the same genre across the cinema. |
| `previous_show_occupancy`| Float | Lag Feature (Safe) | `0.05` to `0.98` | Concluded shows prior to $T-24\text{h}$ | Occupancy rate of the immediately preceding screening in this auditorium. |
| `is_cold_start` | Binary Flag | Categorical Feature | `0` or `1` | Computed at $T-24\text{h}$ | `1` if $\text{days\_since\_release} \le 3$ or $\text{historical\_shows\_count} < 3$; else `0`. |
| `historical_shows_count` | Integer | Lag Feature (Safe) | `0` to `92` | Concluded shows prior to $T-24\text{h}$ | Number of prior shows recorded for this movie before the 24-hour cutoff timestamp. |
| `demand_category` | Categorical | Derived Operational Tag| `Low Demand`, `Moderate Demand`, `High Demand` | Derived from Occupancy | `Low Demand` (<40%), `Moderate Demand` (40-75%), `High Demand` (>75%). |
| `is_synthetic` | Boolean | Ethical Compliance | `True` | Constant | Explicit transparency label confirming data is programmatically generated. |
| `split` | Categorical | Validation Partition | `train`, `val`, `test` | Chronological Boundary | `train` (70%, Days 0-125), `val` (15%, Days 126-152), `test` (15%, Days 153-179). |

---

## 2. Temporal Leakage Safeguards

To maintain scientific validity:
1. **Target Isolation:** `tickets_sold`, `occupancy_rate`, `revenue`, and `empty_seats` for show $i$ are strictly prohibited from entering feature vectors for show $i$.
2. **24-Hour Lookahead Curtain:** Shows concluding within 24 hours of target showtime $T_i$ are excluded from `historical_movie_demand`, `historical_genre_demand`, and `previous_show_occupancy`.
3. **Partition Disjointness:** Train end timestamp (`2024-05-04 22:45`) is strictly earlier than Validation start timestamp (`2024-05-05 10:15`), which is strictly earlier than Test start timestamp (`2024-06-02 10:15`).
