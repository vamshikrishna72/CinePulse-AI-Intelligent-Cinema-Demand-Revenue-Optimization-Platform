"""
CinePulse AI - Production FastAPI Application
Intelligent Cinema Demand & Revenue Optimization Platform
"""

import sys
import os

# Ensure project root is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import APP_NAME, APP_VERSION, CORS_ORIGINS
from backend.app.services.model_service import get_predictor
from backend.app.api import (
    health,
    predict,
    simulate,
    dashboard,
    models,
    analytics,
    recommendations,
    data,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eagerly initialize and verify model artifact loading on startup
    print(f"[{APP_NAME}] Initializing inference models and preprocessors...")
    try:
        predictor = get_predictor()
        print(f"[{APP_NAME}] Champion Model ({predictor.metrics_data.get('champion_model')}) loaded successfully.")
    except Exception as e:
        print(f"[{APP_NAME}] Error loading model artifacts: {e}")
    yield
    print(f"[{APP_NAME}] Application shutdown.")


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Intelligent Cinema Demand & Revenue Optimization Platform - Show-Level Forecasting API",
    lifespan=lifespan,
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def root():
    return {
        "platform": APP_NAME,
        "version": APP_VERSION,
        "docs_url": "/docs",
        "health_check": "/health",
        "status": "Operational",
    }


# Mount Routers
app.include_router(health.router)
app.include_router(predict.router, prefix="/api")
app.include_router(simulate.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(data.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

