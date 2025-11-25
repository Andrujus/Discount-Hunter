# Discount-Hunter Startup Guide

## Quick Commands

### One-Line Startup (Recommended)

**PowerShell:**
```powershell
cd Discount-Hunter; ..\start_all.ps1
```

**Command Prompt (cmd):**
```batch
cd Discount-Hunter & ..\start_all.bat
```

---

## What the Startup Scripts Do

Both `start_all.ps1` and `start_all.bat` perform these steps automatically:

1. ✅ Kill any existing Python/Node processes
2. ✅ Start Backend server on `http://127.0.0.1:3000`
3. ✅ Start Frontend (Expo) on `http://localhost:8081`
4. ✅ Verify both services are running
5. ✅ Display status and environment info

---

## Manual Startup (If Scripts Don't Work)

### Terminal 1: Backend

```powershell
cd Discount-Hunter\Back-end
python server_foreground.py
```

### Terminal 2: Frontend

```powershell
cd Discount-Hunter\Front-end
$env:EXPO_NO_TELEMETRY = '1'
npx expo start --web
```

---

## Verify Services Are Running

```powershell
# Backend health check
curl http://127.0.0.1:3000/healthz

# Frontend check
curl http://localhost:8081
```

Both should return HTTP 200.

---

## First Time Setup

### Backend (One-Time)

```powershell
cd Discount-Hunter\Back-end
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend (One-Time)

```powershell
cd Discount-Hunter\Front-end
npm install
```

---

## Environment Variables

Set in `Discount-Hunter/Back-end/.env`:

```env
SCRAPINGBEE_API_KEY=your-key
OCR_SPACE_API_KEY=your-key
```

Get free keys at:
- ScrapingBee: https://www.scrapingbee.com
- OCR.Space: https://ocr.space/ocrapi

---

## Stop Services

- **Close the backend/frontend windows**, or
- **Press Ctrl+C in each terminal**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Port already in use" | Kill Python: `Get-Process python \| Stop-Process -Force` |
| Backend won't start | Check `.env` exists, PYTHONPATH set |
| Frontend won't load | Clear cache: `npx expo start --web --clear` |
| OCR not working | Add OCR_SPACE_API_KEY to `.env` |

---

## File Locations

| File | Purpose |
|------|---------|
| `start_all.ps1` | PowerShell launcher (recommended) |
| `start_all.bat` | Command Prompt launcher |
| `Discount-Hunter/Back-end/server_foreground.py` | Backend runner |
| `Discount-Hunter/Back-end/.env` | Backend config (API keys) |
| `Discount-Hunter/README.md` | Full documentation |

---

## Architecture

```
Browser (http://localhost:8081)
    ↓
Expo Frontend (Scanning, OCR upload, Results display)
    ↓
FastAPI Backend (http://127.0.0.1:3000)
    ↓
External APIs:
    ├─ OCR.Space (Product name extraction)
    └─ ScrapingBee (Store price scraping)
```

---

Done! 🚀
