# Discount-Hunter Startup Guide

This document shows a clear, step-by-step plan for:

- First-time setup (what to run once on your machine)
- Every other launch (fast startup using the included launcher)
- Manual commands and troubleshooting if you need to debug services

Paths in examples are relative to the repository root. If you opened this
project at a different path, adjust the `cd` commands accordingly.

---

## Quick Commands (Recommended)

### One-line startup (PowerShell)

Open PowerShell at the repo root and run:

```powershell
cd C:\path\to\your\repo\Discount-Hunter
.\start_all.ps1
```

### One-line startup (Command Prompt)

```batch
cd C:\path\to\your\repo\Discount-Hunter
start_all.bat
```

The launcher will stop existing `python`/`node` processes, start the backend
and frontend in separate windows, and perform a quick health check.

---

## First time (do these once)

1. Backend: create a virtual environment and install Python deps

```powershell
cd Discount-Hunter-app\Back-end
python -m venv .venv
. .\.venv\Scripts\Activate
pip install -r requirements.txt
pip install python-multipart
```

Notes:
- Use the same Python interpreter you intend to run the server with.
- `python-multipart` is required by FastAPI for multipart/form-data (file uploads).

2. Frontend: install Node packages

```powershell
cd Discount-Hunter-app\Front-end
npm install
```

3. Add backend environment variables (API keys)

Create `Discount-Hunter-app\Back-end\.env` and add:

```text
SCRAPINGBEE_API_KEY=your-scrapingbee-key
OCR_SPACE_API_KEY=your-ocr-space-key
```

Replace values with real keys from the providers (OCR key is optional but recommended).

---

## Every other launch (fast)

From the repository root run the launcher (PowerShell):

```powershell
cd C:\path\to\your\repo\Discount-Hunter
.\start_all.ps1
```

This opens two windows (backend and frontend). Leave them open to keep services
running. If you prefer separate control, see manual startup below.

If PowerShell blocks running scripts, allow it for this session and re-run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
.\start_all.ps1
```

---

## Manual startup (for debugging)

Run backend and frontend in separate terminals to see logs directly.

Backend (foreground — shows logs):

```powershell
cd Discount-Hunter-app\Back-end
. .\.venv\Scripts\Activate
python server_foreground.py
```

Frontend (Expo web):

```powershell
cd Discount-Hunter-app\Front-end
$env:EXPO_NO_TELEMETRY = '1'
npx expo start --web
```

If Expo does not start or shows errors, try clearing cache and restarting:

```powershell
npx expo start --web --clear
```

---

## Verify services are running

Backend health check:

```powershell
curl http://127.0.0.1:3000/healthz
```

Expect HTTP 200 and JSON like `{"status":"ok","timestamp":"..."}`.

Frontend check:

Open `http://localhost:8081` in a browser (Expo web preview).

Or check via curl:

```powershell
curl http://localhost:8081
```

---

## Stop services

- Press Ctrl+C in each terminal window, or
- Close the backend/frontend windows opened by the launcher, or
- Forcefully kill processes:

```powershell
Get-Process -Name python,node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Troubleshooting (common issues)

- Frontend doesn't load (site can't be reached):
    - Ensure `npm install` completed in `Discount-Hunter-app\Front-end`.
    - Verify `node` and `npx` are available in your PATH.
    - Start Expo manually in a terminal to capture logs.

- Backend doesn't start or crashes on import:
    - Activate `.venv` and run `python server_foreground.py` to see errors.
    - If FastAPI reports missing multipart support: `pip install python-multipart`.
    - Ensure `Discount-Hunter-app\Back-end\.env` exists if you rely on API keys.

- Port already in use:
    - Kill the occupying process or change the port.
    - To kill:

```powershell
Get-Process -Name python,node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## File locations (quick reference)

- `start_all.ps1` — PowerShell launcher (recommended)
- `start_all.bat` — CMD launcher
- `Discount-Hunter-app\Back-end\server_foreground.py` — Backend runner (uses Uvicorn)
- `Discount-Hunter-app\Back-end\.env` — Backend config (API keys)
- `Discount-Hunter-app\Front-end\package.json` — Frontend dependencies / scripts

---

If something still fails, run the backend and frontend in foreground terminals and paste the error output here — I can diagnose further.

Done — happy hacking! 🚀
