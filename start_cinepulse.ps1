# CinePulse AI - Unified Launch Script for PowerShell
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "          CinePulse AI - Cinema Demand Forecasting Platform           " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "  Both services launched in separate windows!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend Swagger Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Yellow

Start-Sleep -Seconds 4
Start-Process "http://localhost:5173"

