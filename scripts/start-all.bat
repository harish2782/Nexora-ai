@echo off
title Nexora AI Launcher
echo ==========================================
echo        Starting Nexora AI Platform        
echo ==========================================

start "Nexora ML Service (8000)" cmd /k "cd /d %~dp0..\ml-service && python -m uvicorn main:app --reload --port 8000"
start "Nexora Backend API (3001)" cmd /k "cd /d %~dp0..\backend && npm run dev"
start "Nexora Frontend (5173)" cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo.
echo Services launched in separate windows!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo ML API:   http://localhost:8000
echo.
pause

