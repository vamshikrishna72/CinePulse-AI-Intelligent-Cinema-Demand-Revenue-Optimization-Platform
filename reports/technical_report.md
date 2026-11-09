# CinePulse AI: Technical Report
## Intelligent Cinema Demand & Revenue Optimization Platform
**Individual Project Assessment — AI & Machine Learning Internship**  
**Organization:** Algions AI Labs Private Limited  
**Author:** AI & Machine Learning Engineering Intern  
**System Version:** CinePulse Enterprise v2.4  
**Date:** June 2024 / Production Simulation Benchmark  

---

## 1. Business Problem

Cinema multiplex operators and theatre chain managers face complex operational trade-offs under dynamic, stochastic audience demand:
- **Screen Allocation Mismatch:** High-demand blockbuster releases frequently sell out in smaller 120-seat or 180-seat auditoriums, causing customer turnaways and lost admissions revenue. Conversely, fading titles frequently occupy 350-seat premium large-format screens with under 20% occupancy, incurring wasted HVAC, projection bulb life, and power costs.
- **Staffing Bottlenecks vs Idle Overhead:** Cinema concession sales (popcorn, beverages, hot food) represent 35–45% of total multiplex profit margins. Under-staffing concession turnstiles during surprise high-demand rushes creates long queues and lost F&B purchases, while over-staffing during low-demand matinees inflates labor costs.
- **Cold-Start Vulnerability:** Newly released films lack pre-existing ticket sales histories, leading managers to rely on gut feeling or flawed studio projections when scheduling screen allocations.

**CinePulse AI** solves these operational challenges by providing a rigorous, explainable, show-level machine learning decision-support platform that operates on the core philosophy:
$$\text{PREDICT} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{SIMULATE} \longrightarrow \text{RECOMMEND} \longrightarrow \text{DECIDE}$$

The platform supports human decision-making rather than making high-stakes autonomous changes.

---

## 2. Prediction Objective

The primary quantitative objective is to forecast total admissions attendance per show:
$$\hat{y} = f(\mathbf{x}) \approx \text{tickets\_sold}$$
From this primary forecast, the platform derives operational metrics:
- **Predicted Occupancy Rate:** $\hat{O} = \frac{\hat{y}}{\text{screen\_capacity}} \in [0.0, 1.0]$
- **Estimated Empty Seats:** $\hat{E} = \text{screen\_capacity} - \hat{y}$
- **Estimated Box-Office Revenue:** $\hat{R} = \hat{y} \times \text{ticket\_price}$
- **Demand Classification:**
  $$\text{Demand Category} = \begin{cases} \text{Low Demand} & \text{if } \hat{O} < 0.40 \\ \text{Moderate Demand} & \text{if } 0.40 \le \hat{O} \le 0.75 \\ \text{High Demand} & \text{if } \hat{O} > 0.75 \end{cases}$$
- **Uncertainty Prediction Interval (90%):** $[\hat{y} - 1.645 \cdot \sigma_s, \hat{y} + 1.645 \cdot \sigma_s]$ clipped to $[0, \text{capacity}]$, where $\sigma_s$ is the segment residual standard error.

---

## 3. Prediction Unit

The fundamental unit of analysis is **One Cinema Show**:
A discrete screening instance defined by a specific film, in a specific auditorium screen, at a specific scheduled date and time:
$$\mathbf{u} = (\text{Movie ID}, \text{Screen ID}, \text{Show Date}, \text{Show Time})$$
Aggregated units (such as daily or weekly movie totals) obscure time-of-day elasticity and screen capacity bounds; modeling at the individual show level allows precise auditorium reassignment and shift staffing.

---

## 4. Forecast Horizon

- **Horizon Length:** Exactly **24 Hours prior to showtime** ($T - 24\text{h}$).
- **Operational Justification:** 24 hours provides theatre managers sufficient lead time to modify online ticketing screen mappings, publish updated auditorium schedules, and adjust usher/concession shift rosters before public pre-booking peaks.
- **Strict Information Barrier:** Every feature in the input vector $\mathbf{x}$ must be strictly known and finalized prior to $T - 24\text{h}$. Shows concluding within the 24-hour lookahead window are prohibited from entering rolling historical demand aggregations.

---

## 5. Dataset Description

Because commercial cinema point-of-sale data is proprietary and contains sensitive transaction details, a synthetic dataset generator (`backend/ml/data_generator.py`) was constructed with grounded behavioral foundations:
- **Scale:** 2,880 individual show records spanning **180 simulated days** (January 1, 2024 to June 28, 2024).
- **Cinema Configuration:** A 4-screen multiplex:
  1. *Screen-1 (IMAX / Premium Large Format):* 350 seats, base admission ₹380.
  2. *Screen-2 (Standard Dolby Atmos):* 250 seats, base admission ₹280.
  3. *Screen-3 (Standard Audi):* 180 seats, base admission ₹220.
  4. *Screen-4 (Boutique / VIP):* 120 seats, base admission ₹450.
- **Film Catalog:** 14 motion pictures across diverse genres (Sci-Fi, Action, Drama, Comedy, Horror, Animation, Romance, Thriller) released on staggered dates with varying popularity ratings (5.9 to 9.4) and lifecycle decay rates.
- **Behavioral Dynamics:** Microeconomic pricing elasticity ($\epsilon \approx -0.45$), weekend surges (+35%), prime evening boosts (+28%), public holiday multipliers, and stochastic noise.
- **Transparency Statement:** All records are programmatically synthesized and explicitly flagged with `is_synthetic = True`. Zero real customer personal data (PII) is involved.

---

## 6. Exploratory Data Analysis (EDA)

Key insights uncovered during exploratory analysis (`notebooks/exploratory_analysis.py`):
1. **Target Distribution:** Tickets sold exhibits a mean of 74.6 tickets ($\sigma = 51.2$), ranging from 6 to 343 tickets per show. The distribution is right-skewed, reflecting typical cinema attendance where the majority of screenings have modest occupancy while select prime weekend shows surge.
2. **Time-of-Day Dynamics:**
   - Morning (10:15): Mean occupancy ~21.2%
   - Matinee (13:30, 16:45): Mean occupancy ~28.5%
   - Evening Prime (19:45): Mean occupancy ~41.8% (peaking at >85% on weekends)
   - Night (22:45): Mean occupancy ~35.2%
3. **Genre Affinity:** Animation (mean occupancy 38.4%) and Sci-Fi (35.6%) lead overall occupancy, driven by family weekend matinees and premium format demand.
4. **Cold-Start Prevalence:** 308 shows (10.7% of total dataset) belong to titles within their opening 3 days of release, necessitating specialized cold-start handling.

---

## 7. Data Cleaning & Integrity

- **Missing Value Handling:** Missing historical movie demand features (inherent to cold-start releases) are systematically imputed with the historical 30-day genre prior rather than arbitrary zeroes or global means.
- **Duplicate Checks:** Zero duplicate show records detected across the entire 2,880-row sequence.
- **Physical Boundary Verification:** In all records, $0 \le \text{tickets\_sold} \le \text{screen\_capacity}$ holds strictly.
- **Type Casting:** Datetimes converted to pandas `Timestamp` objects; categorical attributes validated against predefined enum sets.

---

## 8. Feature Engineering

Features engineered strictly prior to the 24-hour prediction cutoff:
1. `day_of_week`: Integer index (0=Monday to 6=Sunday).
2. `is_weekend`: Binary flag for Friday, Saturday, Sunday.
3. `is_holiday`: Binary flag for public holidays.
4. `time_of_day_category`: Binned into Morning, Matinee, Evening, Night.
5. `days_since_release`: Calendar days between show date and theatrical release date.
6. `historical_movie_demand`: Trailing mean occupancy rate for the movie calculated strictly from shows completed $\ge 24\text{h}$ before showtime.
7. `historical_genre_demand`: Trailing 25-show moving average occupancy for the genre.
8. `previous_show_occupancy`: Occupancy of the immediately preceding show in that auditorium screen.
9. `historical_shows_count`: Cumulative shows completed for the film before the cutoff.
10. `is_cold_start`: Binary flag indicating $\le 3$ days since premiere or $< 3$ prior historical shows.

---

## 9. Temporal Leakage Analysis

A common fatal flaw in time-series forecasting is **temporal leakage**:
- **Future Show Actuals:** Using actual tickets sold from a show occurring after $T-24\text{h}$ is strictly prohibited.
- **Target Leakage:** `tickets_sold`, `occupancy_rate`, and `revenue` for the current show are strictly isolated as target/evaluation variables and never fed into feature matrices.
- **Chronological Cutoff:** As proven in `reports/eda_summary.json` and unit test `test_chronological_splits_leakage_free`:
  $$\text{Train Max Date: 2024-05-04 22:45:00} < \text{Val Min Date: 2024-05-05 10:15:00}$$
  $$\text{Val Max Date: 2024-06-01 22:45:00} < \text{Test Min Date: 2024-06-02 10:15:00}$$
  Zero temporal overlap exists between partitions.

---

## 10. Baseline Methodology

To establish a defensible benchmark, we built a domain-informed baseline:
$$\hat{y}_{\text{baseline}} = \text{round}(\text{screen\_capacity} \times \bar{O}_{\text{movie}})$$
Where $\bar{O}_{\text{movie}}$ is the historical occupancy rate observed for that movie prior to the 24-hour cutoff. If the movie is a cold-start release without prior history, the baseline falls back to the historical genre prior $\bar{O}_{\text{genre}}$.

The baseline is capacity-aware and represents the heuristic calculation a competent theatre manager would perform with pencil and paper.

---

## 11. Model Comparison

We evaluated three models on the chronological held-out test split (432 shows):

1. **Capacity-Adjusted Historical Baseline:**
   - WAPE: 41.75% | MAE: 30.01 tickets | RMSE: 39.05 tickets
   - *Limitation:* Cannot account for non-linear interactions between showtime slots, weekend surges, pricing tiers, and decaying momentum.
2. **Random Forest Regressor (Candidate 1):**
   - WAPE: 22.91% | MAE: 16.47 tickets | RMSE: 22.44 tickets
   - *Advantage:* Captures non-linear thresholds and interactions; robust to outliers. Achieved a 45.1% error reduction over baseline.
3. **XGBoost Regressor (Candidate 2 — Champion):**
   - WAPE: 21.35% | MAE: 15.35 tickets | RMSE: 20.75 tickets
   - *Advantage:* Superior gradient boosting convergence; regularized loss prevents overfitting on rare combinations; delivers the lowest test error across all metrics (48.9% error reduction over baseline).

---

## 12. Chronological Validation Strategy

Randomized K-Fold cross-validation destroys the temporal ordering of time-series data, causing future demand patterns to leak into past training sets.

CinePulse enforces strict **Chronological Splitting**:
- **Training Set (70%):** 2,000 shows (2024-01-01 to 2024-05-04). Used exclusively to fit preprocessing encoders, imputers, and model parameters.
- **Validation Set (15%):** 448 shows (2024-05-05 to 2024-06-01). Used exclusively for model selection, hyperparameter tuning, and decision thresholds.
- **Held-out Test Set (15%):** 432 shows (2024-06-02 to 2024-06-28). Preserved untouched until final evaluation to assess true out-of-sample generalization.

---

## 13. Evaluation Metrics: MAE, RMSE, and WAPE

Three complementary metrics reflect operational business costs:
1. **Mean Absolute Error (MAE):** Direct average error in ticket counts:
   $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |y_i - \hat{y}_i| = 15.35 \text{ tickets}$$
2. **Root Mean Squared Error (RMSE):** Penalizes large forecast misses that cause severe operational disruptions:
   $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2} = 20.75 \text{ tickets}$$
3. **Weighted Absolute Percentage Error (WAPE):** Volume-weighted relative error robust to low-volume divisions:
   $$\text{WAPE} = \frac{\sum_{i=1}^N |y_i - \hat{y}_i|}{\sum_{i=1}^N y_i} \times 100\% = 21.35\%$$

---

## 14. Capacity-Aware Evaluation

Operational display requires predictions to remain within valid auditorium boundaries:
$$\hat{y}_{\text{constrained}} = \text{clip}(\hat{y}, 0, \text{capacity})$$

To prevent "hiding" model deficiency through post-hoc clipping, CinePulse evaluates both raw and capacity-constrained errors:
- **Raw Test MAE:** 15.347 tickets
- **Constrained Test MAE:** 15.347 tickets
The exact parity confirms the XGBoost model naturally respects capacity bounds without relying on clipping to correct unconstrained divergence.

---

## 15. Cold-Start Evaluation

Evaluating the 36 cold-start screenings in the held-out test split:
- **Cold-Start MAE:** 23.37 tickets (WAPE: 18.39%)
- **Mature Screening MAE:** 14.62 tickets (WAPE: 21.86%)
- **Residual Standard Deviation:** Cold-start shows exhibit $\sigma = 32.2$ tickets vs $\sigma = 19.4$ tickets for mature shows.

CinePulse converts this statistical divergence into a product feature: cold-start forecasts display an explicit warning badge and expand the 90% confidence prediction interval by +66%.

---

## 16. Error Analysis & Residual Distribution

- **Residual Mean:** $-0.42$ tickets (virtually zero bias; the model does not consistently over-predict or under-predict).
- **Residual Normality:** Inspection of `reports/eval_plots/residual_distribution.png` confirms residuals follow a symmetrical distribution centered at zero.
- **Extreme Misses:** The largest residuals occur on opening Saturday evenings for sleeper titles where word-of-mouth momentum outpaced genre prior expectations.

---

## 17. Explainable AI (SHAP TreeExplainer)

CinePulse integrates SHAP (`shap.TreeExplainer`) for local and global model interpretability:
- **Global Feature Importance:** `historical_movie_demand` (28.4%), `screen_capacity` (22.1%), and `is_weekend` (14.6%) are the three dominant structural drivers.
- **Local Prediction Attribution:** For every single show forecast, the platform generates a SHAP waterfall breakdown showing the exact additive contribution of each feature relative to the base expected value ($E[Y] = 74.6$ tickets).
- **Executive Summaries:** SHAP values are automatically converted into plain-English sentences for cinema managers (e.g., *"Weekend prime placement contributed +32.4 tickets; ticket price of ₹380 reduced expected attendance by -6.2 tickets"*).

---

## 18. Responsible AI & Ethical Considerations

1. **Zero Customer PII:** No personal identifiers, customer payment methods, or individual tracking data are utilized.
2. **Transparent Synthetic Labeling:** Synthetic data origin is documented throughout the platform.
3. **Decision-Support Guardrail:** The system is an advisory tool. High-stakes operational actions (screen reallocations, show cancellations) require human manager sign-off.
4. **Fairness & Diversity:** Model rules do not penalize independent foreign-language films or niche art-house titles; boutique screens are explicitly calibrated for specialized genres.

---

## 19. Limitations

1. **Exogenous Weather Events:** Severe weather disruptions (floods, blizzards) that depress theatre footfalls are not captured without external meteorological feeds.
2. **Viral Word-of-Mouth Surges:** Sudden viral social media trends occurring within the 24-hour window cannot be anticipated from historical booking lags alone.
3. **Observational Causal Boundary:** What-if price and showtime changes are associative projections, not randomized controlled trial causal guarantees.

---

## 20. Future Improvements

1. **Live Ticketing API Integrations:** Ingest real-time pre-booking velocity curves (e.g., reservations made at $T-72\text{h}$, $T-48\text{h}$, and $T-24\text{h}$).
2. **PostgreSQL Migration:** Transition from the current high-performance file/SQLite storage to a distributed PostgreSQL database for multi-multiplex chain deployments.
3. **Causal ML (Double Machine Learning):** Implement EconML/DoWhy to estimate unconfounded price elasticity curves across varied demographic catchments.
