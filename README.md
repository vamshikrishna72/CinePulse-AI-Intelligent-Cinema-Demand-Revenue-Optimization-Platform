# CinePulse AI – Intelligent Cinema Demand & Revenue Optimization Platform

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.3-cyan.svg)](https://react.dev/)
[![XGBoost](https://img.shields.io/badge/XGBoost-Champion%20Model-gold.svg)](https://xgboost.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/SHAP-TreeExplainer-purple.svg)](https://shap.readthedocs.io/)
[![Tests](https://img.shields.io/badge/Pytest-14%20Passed%20(100%25)-brightgreen.svg)]()

> **Algions AI Labs Private Limited — AI & Machine Learning Individual Project Assessment**  
> **Assigned Problem Domain:** Cinema Ticket Demand Forecasting  
> **Core Product Philosophy:** PREDICT → UNDERSTAND → SIMULATE → RECOMMEND → DECIDE

---

## 1. Product Vision & Executive Overview

**CinePulse AI** is an enterprise-grade decision-support platform designed for cinema owners, theatre general managers, and multiplex chain operators to forecast audience demand at the **individual show level**.

Unlike basic academic machine learning exercises, CinePulse AI bridges cutting-edge gradient-boosted regression with **local SHAP explainability**, an interactive **What-If Counterfactual Simulator**, specialized **Cold-Start Intelligence** for newly released films, and **rule-governed operational recommendations** for auditorium screen reallocations and concession staffing.

### Key Capabilities
- **Individual Show Forecasts:** Forecasts `tickets_sold`, occupancy percentage, estimated empty seats, and box-office revenue at a strict **24-hour lookahead horizon ($T - 24\text{h}$)**.
- **Explainable AI (SHAP):** Decomposes every single prediction using `TreeExplainer` Shapley attributions, translating complex non-linear feature interactions into plain-English managerial insights.
- **What-If Scenario Simulator:** Allows operators to adjust showtimes, ticket prices, auditorium screens, and day-of-week timing, recalculating forecasts using the actual production model with explicit **causal governance**.
- **Cold-Start Release Intelligence:** Transparently detects unreleased films ($\le 3$ days since release or $< 3$ historical shows), injects genre-prior anchors, and expands prediction intervals by +66% ($\sigma = 32.2$ tickets) to communicate opening volatility.
- **Strict Leakage-Free Chronological Splitting:** 70% Train, 15% Validation, 15% Test chronologically disjoint with zero temporal lookahead leakage.

---

## 2. Model Performance Leaderboard

Evaluated on the **held-out chronological test set (N = 432 shows)** from **June 2, 2024 to June 28, 2024**, untouched during all exploratory data analysis and model hyperparameter tuning:

| Model Architecture | Constrained WAPE (%) | Constrained MAE (Tickets) | Constrained RMSE (Tickets) | Raw MAE (Tickets) | Relative WAPE Gain vs Baseline | Production Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **XGBoost Regressor (Champion)** | **21.35%** | **15.35** | **20.75** | **15.35** | **-48.86%** | **Active Production Champion** |
| **Random Forest Regressor** | 22.91% | 16.47 | 22.44 | 16.47 | -45.13% | Candidate Benchmark |
| **Capacity-Adjusted Baseline** | 41.75% | 30.01 | 39.05 | 30.01 | 0.00% (Ref) | Naive Domain Heuristic |

*Note: Raw MAE and Constrained MAE converge exactly to 15.347 tickets on the test set, demonstrating that the XGBoost model respects auditorium physical boundaries without relying on post-hoc clipping to conceal model deficiency.*

---

## 3. Technology Stack & Architecture

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│               CinePulse AI System Architecture Overview                │
└────────────────────────────────────────────────────────────────────────┘

  [ Synthetic Show Generator ] ────> 2,880 Multi-Screen Shows (180 Days)
               │
               ▼
  [ Chronological Splitting ] ─────> Train (70%) | Val (15%) | Test (15%)
               │
               ▼
  [ Preprocessing Pipeline ]  ─────> OneHotEncoder + Median Imputer (Train Fit Only)
               │
               ▼
  [ Model Training Suite ]    ─────> Baseline vs Random Forest vs XGBoost
               │
               ▼
  [ Saved Model Artifacts ]   ─────> champion_model.joblib, preprocessor.joblib, metrics.json
               │
               ▼
  [ FastAPI Backend Engine ]  ─────> REST Endpoints (/predict, /simulate, /dashboard, /recommendations)
               │
               ▼
  [ React 19 Frontend SaaS ]  ─────> Cinematic Burgundy & Champagne Gold Design System
```

### Technology Matrix
- **Machine Learning & Data Science:** Python 3.13, Scikit-learn 1.8.0, XGBoost 3.2.0, SHAP 0.54.1, Pandas 2.3.3, NumPy 2.4.6, Joblib 1.5.2
- **Backend API Server:** FastAPI 0.136.1, Uvicorn 0.46.0, Pydantic v2, Pytest 9.2.0
- **Frontend Enterprise Application:** React 19.3, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons
- **Design System:** Cinematic Luxury Palette (`#241018` Burgundy, `#D8B46A` Champagne Gold, `#17171D` Charcoal, `#F6F0E8` Warm Ivory, `#B66B7B` Muted Rose)

---

## 4. Repository Structure

```
CinePulse-AI/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI initialization, CORS & router mounting
│   │   ├── core/config.py           # App settings, paths, CORS configurations
│   │   ├── schemas/show.py          # Pydantic request & response schemas
│   │   ├── services/
│   │   │   ├── model_service.py     # Singleton provider for predictor
│   │   │   ├── simulator_service.py # What-If counterfactual logic & causal advice
│   │   │   ├── recommendation_service.py # Operational rules engine
│   │   │   └── analytics_service.py # Dashboard KPI & time-series aggregations
│   │   └── api/
│   │       ├── health.py            # /health system diagnostic endpoint
│   │       ├── predict.py           # /api/predict single show inference
│   │       ├── simulate.py          # /api/simulate counterfactual scenario endpoint
│   │       ├── dashboard.py         # /api/dashboard/summary multiplex KPI endpoint
│   │       ├── models.py            # /api/models/metrics & /api/models/explain
│   │       ├── analytics.py         # /api/analytics/demand time-series trends
│   │       ├── recommendations.py   # /api/recommendations operational feed
│   │       └── data.py              # /api/data/validate & /api/data/metadata
│   ├── ml/
│   │   ├── data_generator.py        # 2,880-show synthetic dataset generator
│   │   ├── features.py              # Feature schemas & 24h cutoff derivation
│   │   ├── preprocessing.py         # Leakage-safe CinemaPreprocessor pipeline
│   │   ├── baseline.py              # CapacityAdjustedHistoricalBaseline class
│   │   ├── train.py                 # Chronological model training & selection
│   │   ├── evaluate.py              # Residual diagnostic plots generator
│   │   ├── predict.py               # Single & batch inference engine
│   │   └── explain.py               # SHAP TreeExplainer & narrative generator
│   ├── artifacts/                   # Serialized model .joblib, metrics.json, predictions
│   ├── tests/                       # 14 Pytest automated integration tests
│   └── requirements.txt
├── frontend/                        # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/              # Navbar, Sidebar, MetricCard, OccupancyGauge
│   │   ├── pages/                   # 8 Interactive Page Views
│   │   ├── services/api.ts          # REST API client connecting to FastAPI
│   │   └── types/api.ts             # TypeScript interface definitions
│   ├── package.json
│   └── vite.config.ts
├── data/
│   └── raw/cinema_shows_synthetic.csv # 2,880 synthetic cinema show transactions
├── notebooks/
│   └── exploratory_analysis.py      # Reproducible EDA and leakage verification script
├── reports/
│   ├── technical_report.md          # 20-point comprehensive engineering report
│   ├── model_evaluation.md         # Detailed benchmark report
│   ├── eda_summary.json             # Programmatic EDA output metrics
│   ├── eda_plots/                   # 4 EDA distribution and timeline figures
│   └── eval_plots/                  # 4 Model diagnostic figures (residual, actual vs pred)
├── README.md                        # Primary documentation & reproduction guide
├── .env.example
└── .gitignore
```

---

## 5. Step-by-Step Installation & Reproduction

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js v18+ and npm v9+ (tested on Node v22)

### Step 1: Clone & Configure Environment
```bash
# Clone the repository
git clone https://github.com/algions-ai/cinepulse-ai.git
cd CinePulse-AI

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python backend dependencies
pip install -r backend/requirements.txt
```

### Step 2: Reproduce Synthetic Dataset Generation
Generates 2,880 show records across 180 operating days with zero temporal leakage:
```bash
python backend/ml/data_generator.py
```
*Output: `data/raw/cinema_shows_synthetic.csv` generated.*

### Step 3: Run Exploratory Data Analysis & Leakage Check
Executes data quality audits and produces visual figures in `reports/eda_plots/`:
```bash
python notebooks/exploratory_analysis.py
```

### Step 4: Train Baseline & Candidate ML Models
Fits the preprocessor strictly on the 70% training split, compares Baseline vs Random Forest vs XGBoost on the validation split, and evaluates the champion on the untouched test split:
```bash
python backend/ml/train.py
```
*Output: Serialized models and `metrics.json` saved to `backend/artifacts/`.*

### Step 5: Generate Model Diagnostics & Evaluation Plots
Generates residual distribution, actual vs predicted scatter, and feature importance charts in `reports/eval_plots/`:
```bash
python backend/ml/evaluate.py
```

### Step 6: Run Automated Integration Tests
Executes the full automated test suite covering dataset constraints, leakage protection, model inference, and API endpoints:
```bash
python -m pytest backend/tests -v
```
*Result: 14 passed in ~6.2s.*

### Step 7: Launch the FastAPI Backend Server
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Diagnostic: `http://localhost:8000/health`

### Step 8: Launch the React Frontend Application
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
- Frontend UI: `http://localhost:5173`

---

## 6. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check, model load status, memory usage |
| `GET` | `/api/dashboard/summary` | Multiplex KPIs, screen utilization, recent show board |
| `POST` | `/api/predict` | Single show inference, capacity bounding, 90% CI & local SHAP |
| `POST` | `/api/simulate` | Paired counterfactual What-If simulation with causal advisory |
| `GET` | `/api/models/metrics` | Held-out test benchmark metrics & segmented error analysis |
| `GET` | `/api/models/explain` | Global feature importance rankings (XGBoost relative gain) |
| `GET` | `/api/analytics/demand` | Daily trends, genre performance, weekday vs weekend patterns |
| `GET` | `/api/recommendations` | Rule-governed operational suggestions (reallocation, staffing) |
| `POST` | `/api/data/validate` | Schema boundary and data integrity validation |
| `GET` | `/api/data/metadata` | Multiplex catalog (movies, screens, genres, base pricing) |

### Example Inference Request
```json
POST /api/predict
Content-Type: application/json

{
  "movie_title": "Quantum Horizon",
  "genre": "Sci-Fi",
  "release_date": "2024-06-01",
  "show_date": "2024-06-15",
  "show_time": "19:45",
  "screen_id": "Screen-1",
  "screen_type": "IMAX / Premium Large Format",
  "screen_capacity": 350,
  "ticket_price": 380.0,
  "movie_popularity": 8.8,
  "days_since_release": 14,
  "is_weekend": 1,
  "historical_movie_demand": 0.65
}
```

### Example Inference Response
```json
{
  "movie_title": "Quantum Horizon",
  "genre": "Sci-Fi",
  "show_date": "2024-06-15",
  "show_time": "19:45",
  "screen_id": "Screen-1",
  "screen_type": "IMAX / Premium Large Format",
  "screen_capacity": 350,
  "ticket_price": 380.0,
  "is_cold_start": false,
  "predicted_tickets_sold": 193,
  "raw_model_prediction": 193.2,
  "baseline_predicted_tickets": 162,
  "predicted_occupancy_rate": 0.5514,
  "predicted_occupancy_percentage": 55.1,
  "estimated_empty_seats": 157,
  "estimated_ticket_revenue": 73340.0,
  "demand_category": "Moderate Demand",
  "confidence_interval_90": {
    "lower_tickets": 161,
    "upper_tickets": 225,
    "lower_occupancy_pct": 46.0,
    "upper_occupancy_pct": 64.3,
    "uncertainty_level": "Normal (Mature Screening)",
    "residual_std": 19.38
  },
  "explanation": {
    "base_expected_value": 74.65,
    "top_contributions": [
      { "feature": "historical_movie_demand", "shap_value": 42.1, "direction": "positive" },
      { "feature": "time_of_day_category_Evening", "shap_value": 28.4, "direction": "positive" },
      { "feature": "is_weekend", "shap_value": 24.6, "direction": "positive" },
      { "feature": "ticket_price", "shap_value": -7.2, "direction": "negative" }
    ],
    "executive_explanation": "Demand is strongly supported by historical_movie_demand (+42.1 tickets), time_of_day_category_Evening (+28.4 tickets). Demand is tempered by ticket_price (-7.2 tickets). Weekend prime placement generates a significant positive uplift."
  }
}
```

---

## 7. 3–5 Minute Video Demonstration Walkthrough Script

Use this structured walkthrough for the submission demonstration video:

1. **Minute 0:00 – 0:45: Business Framing & Control Center Overview**
   - Introduce CinePulse AI as an intelligent decision-support tool for multiplex managers.
   - Highlight the 24-hour prediction horizon ($T - 24\text{h}$) and strict temporal leakage protection.
   - Showcase the **Multiplex Control Center**: live active shows, total forecast admissions, and screen utilization breakdown across the 4 auditoriums.

2. **Minute 0:45 – 1:45: Show-Level Demand Forecasting with Actual ML Inference**
   - Navigate to the **Demand Forecasting** module.
   - Load the *"Weekend Prime Blockbuster (IMAX)"* preset.
   - Demonstrate the actual XGBoost model inference returning 193 tickets (55.1% occupancy) and ₹73,340 box office.
   - Showcase the **90% Confidence Interval** (161 to 225 tickets) and explain why point predictions alone are inadequate for operations.
   - Walk through the **Local SHAP Feature Waterfall**, explaining how evening showtime (+28.4 tickets) and weekend surge (+24.6 tickets) offset ticket price elasticity (-7.2 tickets).

3. **Minute 1:45 – 2:45: The What-If Counterfactual Simulator**
   - Switch to the **What-If Simulator**.
   - Show a baseline matinee screening in Audi 3 (180 seats) yielding soft demand.
   - Counterfactually adjust the showtime to 19:45 (Evening Prime) and upsize the auditorium to Audi 1 (350 seats).
   - Click *Simulate Counterfactual Scenario* to trigger dual model inference.
   - Highlight the resulting delta: +55 tickets, +₹28,600 revenue, +18.2% occupancy.
   - Emphasize the **Causal Governance Callout**: explain that this is a statistical associative forecast under historical conditions, advising managers to pair it with pre-booking velocity.

4. **Minute 2:45 – 3:30: Cold-Start Release Intelligence**
   - Navigate to **Cold-Start Intelligence**.
   - Show how the system detects new movies with $\le 3$ days of screening history.
   - Run the comparison between an unreleased Day 1 title and a Day 15 mature title.
   - Show how the model automatically injects the genre prior and expands the prediction interval by +66% ($\sigma = 32.2$ tickets) to communicate opening weekend volatility.

5. **Minute 3:30 – 4:30: Model Intelligence Leaderboard & Operational Recommendations**
   - Navigate to **Model Intelligence**.
   - Present the held-out test leaderboard: Baseline (41.75% WAPE) vs Random Forest (22.91%) vs XGBoost (21.35%).
   - Demonstrate the 48.9% error reduction and explain the non-overlapping chronological split.
   - Open **Smart Recommendations**: showcase automated alerts for screen reallocation and concession staffing reinforcement.

---

## 8. Responsible AI, Privacy & Ethical Compliance

- **Zero Personally Identifiable Information (PII):** CinePulse operates purely on aggregate show-level ticketing counts. No customer names, phone numbers, email addresses, or payment tokens are ingested or stored.
- **Transparent Synthetic Data Provenance:** All 2,880 screening records are generated programmatically via microeconomic structural equations and explicitly labeled with `is_synthetic = True`.
- **Human-in-the-Loop Decision Boundary:** The system strictly advises cinema operators. High-stakes actions (reallocating auditoriums or cancelling screenings) require managerial human review and cannot be executed automatically.
- **Honest Uncertainty Communication:** All point forecasts are accompanied by statistically sound 90% confidence prediction intervals derived from test segment residuals.

---

## 9. Submission Declaration & Authorship

- **Candidate Assignment:** Cinema Ticket Demand Forecasting
- **Internship Role:** AI & Machine Learning Intern
- **Company:** Algions AI Labs Private Limited
- **Declaration:** All machine learning pipelines, feature engineering routines, API endpoints, and frontend user interfaces in this repository were designed and implemented specifically for this assessment. Zero hardcoded predictions or fake API mocks were used.

