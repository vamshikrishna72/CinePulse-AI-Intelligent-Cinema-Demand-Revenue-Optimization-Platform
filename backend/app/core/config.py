"""
CinePulse AI - Backend Configuration
"""

import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
RAW_DATA_PATH = os.path.join(DATA_DIR, "raw", "cinema_shows_synthetic.csv")
ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, "backend", "artifacts")
REPORTS_DIR = os.path.join(PROJECT_ROOT, "reports")

APP_NAME = "CinePulse AI"
APP_VERSION = "2.4.0-enterprise"
API_PREFIX = "/api"

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*",
]

