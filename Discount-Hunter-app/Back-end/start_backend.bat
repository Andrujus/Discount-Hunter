@echo off
REM Discount Hunter Backend Launcher
REM Uses standard library HTTP server for maximum compatibility on Windows

cd /d "%~dp0"

REM Kill any existing Python processes
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak

REM Activate virtual environment and start server
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
)

echo Starting Discount Hunter Backend on http://127.0.0.1:3000...
echo Press CTRL+C to stop.
python.exe run_stdlib_server.py
