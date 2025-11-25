@echo off
REM Discount-Hunter - Complete Startup Script for Windows
REM This script starts both frontend and backend servers

echo ========================================
echo Discount-Hunter - Full Stack Startup
echo ========================================

REM Get the script directory
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0

REM Kill any existing Python processes
echo.
echo [1/4] Stopping any running processes...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak

REM Start Backend
echo.
echo [2/4] Starting Backend Server on port 3000...
cd /d "%SCRIPT_DIR%Discount-Hunter\Back-end"
start "Discount-Hunter Backend" python server_foreground.py

timeout /t 3 /nobreak

REM Start Frontend
echo.
echo [3/4] Starting Frontend on port 8081...
cd /d "%SCRIPT_DIR%Discount-Hunter\Front-end"
start "Discount-Hunter Frontend" cmd /c "set EXPO_NO_TELEMETRY=1 && npx expo start --web"

echo.
echo [4/4] Startup complete!
echo.
echo ========================================
echo Services running:
echo - Backend:  http://127.0.0.1:3000
echo - Frontend: http://localhost:8081
echo ========================================
echo.
echo Expo will open your browser automatically
echo.
echo Backend window: Minimize to keep running
echo Frontend window: Minimize to keep running
echo.
echo Press any key to exit this launcher...
pause >nul
