# Start all 3 Nexora AI services in separate terminal windows on Windows

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "       Starting Nexora AI Platform        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$root = Split-Path -Parent $PSScriptRoot

# 1. Start Python FastAPI ML Service (Port 8000)
Write-Host "[1/3] Launching Python ML Service on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ml-service'; Write-Host '--- ML Service (8000) ---' -ForegroundColor Magenta; python -m uvicorn main:app --reload --port 8000"

# 2. Start Express Backend API (Port 3001)
Write-Host "[2/3] Launching Express API on http://localhost:3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; Write-Host '--- Backend API (3001) ---' -ForegroundColor Green; npm run dev"

# 3. Start Vite Frontend (Port 5173)
Write-Host "[3/3] Launching Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; Write-Host '--- Frontend Vite (5173) ---' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "All services initiated!" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "ML API:    http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "Demo Credentials: demo@nexora.ai / Password123!" -ForegroundColor Yellow

