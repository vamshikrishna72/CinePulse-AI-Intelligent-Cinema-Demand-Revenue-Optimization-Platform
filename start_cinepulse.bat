@echo off
TITLE CinePulse AI - Launch System
echo ======================================================================
echo           CinePulse AI - Cinema Demand Forecasting Platform           
echo ======================================================================
echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000...
start "CinePulse AI - Backend" cmd /k "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting React + Vite Frontend on http://localhost:5173...
start "CinePulse AI - Frontend" cmd /k "npm --prefix frontend run dev"

echo.
echo ======================================================================
echo   Both services are starting!
echo   Frontend: http://localhost:5173
echo   Backend Swagger Docs: http://localhost:8000/docs
echo ======================================================================
timeout /t 5 >nul
start http://localhost:5173
