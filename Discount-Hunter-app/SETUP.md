# Discount-Hunter

A full-stack React Native + FastAPI application for discovering product prices across Lithuanian stores by scanning product images with OCR.

---

## 🚀 Quick Start (One Command)

### Windows PowerShell

```powershell
cd ..
.\start_all.ps1
```

This will:
1. Stop any running processes
2. Start Backend on `http://127.0.0.1:3000`
3. Start Frontend on `http://localhost:8081`
4. Verify both services are running
5. Display service status and environment info

### Windows Command Prompt (cmd)

```batch
cd ..
start_all.bat
```

---

## 🟢 Launch Instructions

### First time launching

Follow these steps once to prepare your machine and the project:

**Prerequisites:**
- Install official Python from [python.org](https://www.python.org/downloads/) (3.11 or 3.12 recommended)
  - ⚠️ **Important:** Do not use MSYS64/MinGW Python - it lacks pre-built wheels for required packages
  - Verify with: `python --version` (should show official Python, e.g., `Python 3.12.3`)

- Backend (one-time):

```powershell
cd Discount-Hunter-app/Back-end
python -m venv .venv
. .\.venv\Scripts\Activate
pip install -r requirements.txt
```

> **Note:** `python-multipart` is already included in `requirements.txt`, no need to install separately.

- Frontend (one-time):

```powershell
cd C:\Users\justa\Documents\GitHub\Discount-Hunter\Discount-Hunter-app\Front-end
npm install
```

- Create a `.env` file for backend API keys (copy values from your provider):

```text
SCRAPINGBEE_API_KEY=your-scrapingbee-key
OCR_SPACE_API_KEY=your-ocr-space-key
```

### Every other launching

After the initial setup, use the launcher to start both services quickly.

- From the repository root (PowerShell):

```powershell
cd C:\Users\justa\Documents\GitHub\Discount-Hunter
.\start_all.ps1
```

This opens two windows (backend and frontend). Keep them open to keep services running.

- Or start components individually (if you prefer separate terminals):

Backend (foreground):
```powershell
cd C:\Users\justa\Documents\GitHub\Discount-Hunter\Discount-Hunter-app\Back-end
. .\.venv\Scripts\Activate
python server_foreground.py
```

Frontend (Expo web):
```powershell
cd C:\Users\justa\Documents\GitHub\Discount-Hunter\Discount-Hunter-app\Front-end
$env:EXPO_NO_TELEMETRY = '1'
npx expo start --web
```

If PowerShell blocks running `start_all.ps1`, allow the script for this session and try again:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
.\start_all.ps1
```


## 📋 Manual Startup

### Backend Setup (First Time Only)

**Prerequisites:**
- Install official Python from [python.org](https://www.python.org/downloads/) (3.11 or 3.12 recommended)
- ⚠️ **Do not use MSYS64/MinGW Python** - it requires C compilers to build packages like Pillow and lxml

```powershell
cd Discount-Hunter\Back-end

# Create virtual environment (using official Python)
python -m venv .venv

# Activate it
.venv\Scripts\activate

# Install dependencies (all packages now install from pre-built wheels)
pip install -r requirements.txt
```

**Troubleshooting:**
- If packages freeze during installation, ensure you're using official Python, not MSYS64 Python
- Check Python version: `python --version` should show official distribution (e.g., `Python 3.12.3`)
- If issues persist, delete `.venv` folder and recreate with official Python

### Backend - Start Server

```powershell
cd Discount-Hunter\Back-end
python server_foreground.py
```

**Backend runs on:** `http://127.0.0.1:3000`

### Frontend Setup (First Time Only)

```powershell
cd Discount-Hunter\Front-end
npm install
```

### Frontend - Start Web Preview

```powershell
cd Discount-Hunter\Front-end
$env:EXPO_NO_TELEMETRY = '1'
npx expo start --web
```

**Frontend runs on:** `http://localhost:8081`

---

## ⚙️ Environment Configuration

Create `.env` files with the required API keys:

### Back-end/.env

```env
SCRAPINGBEE_API_KEY=your-scrapingbee-key
OCR_SPACE_API_KEY=your-ocr-space-key
```

**Get API Keys:**
- **ScrapingBee**: https://www.scrapingbee.com (required for price scraping)
- **OCR.Space**: https://ocr.space/ocrapi (optional, free tier available)

---

## 📚 API Endpoints

### Health Check
- `GET /healthz` → `{ "status": "ok", "timestamp": "..." }`

### OCR (Product Recognition)
- `POST /api/ocr` (multipart form-data with `file`)
- Returns: `{ "productName": "detected product name" }`

### Scrape (Price Discovery)
- `POST /api/scrape` (JSON: `{"query": "product name"}`)
- Returns: `{ "jobId": "job-uuid" }`

### Job Status (Polling)
- `GET /api/scrape/{jobId}`
- Returns: `{ "status": "running|completed|failed", "data": [...], "error": null }`

---

## 🏗️ Project Structure

```
Discount-Hunter/
├── Front-end/                   # React Native (Expo)
│   ├── app/
│   │   ├── index.tsx            # Onboarding screen
│   │   ├── home.tsx             # Home with camera
│   │   ├── scanning.tsx         # Image capture & OCR upload
│   │   ├── results.tsx          # Display store prices
│   │   └── settings.tsx         # Store selection
│   └── package.json
│
├── Back-end/                    # FastAPI
│   ├── app/
│   │   ├── main.py              # API routes
│   │   ├── config.py            # Settings (API keys, stores)
│   │   ├── schemas.py           # Pydantic models
│   │   ├── state.py             # In-memory job store
│   │   └── services/
│   │       ├── ocr.py           # OCR.Space integration
│   │       └── scraping.py      # ScrapingBee integration
│   ├── requirements.txt         # Python dependencies
│   └── server_foreground.py     # Foreground server runner
│
├── start_all.bat                # Windows CMD launcher
├── start_all.ps1                # Windows PowerShell launcher
└── README.md                    # This file
```

---

## 🔄 Workflow

1. **User** opens frontend at `http://localhost:8081`
2. **User** clicks camera button to capture product image
3. **Frontend** uploads image to `POST /api/ocr`
4. **Backend** calls OCR.Space API to extract product name
5. **Backend** returns product name to frontend
6. **Frontend** sends product name to `POST /api/scrape`
7. **Backend** creates scraping job, returns job ID
8. **Frontend** polls `GET /api/scrape/{jobId}` until completion
9. **Backend** concurrently scrapes Maxima, Rimi, Lidl for prices
10. **Frontend** displays prices from all stores

---

## ✅ Tested Features

- ✅ OCR product recognition (Maggi Saucy Noodles → €400.60 at Rimi)
- ✅ Concurrent price scraping across 3 Lithuanian stores
- ✅ Job-based async scraping with polling
- ✅ Multipart image upload
- ✅ Web preview (Expo)
- ✅ Camera capture (native app)
- ✅ Store selection & settings

---

## 🛠️ Troubleshooting

### Backend won't start
```powershell
# Ensure PYTHONPATH is set
$env:PYTHONPATH = "."
python server_foreground.py
```

### Port already in use
```powershell
# Kill existing processes
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Frontend not loading
```powershell
# Clear Metro cache and restart
cd Front-end
npx expo start --web --clear
```

### API connection issues
- Verify backend is running: `curl http://127.0.0.1:3000/healthz`
- Check frontend uses correct backend URL in `scanning.tsx` and `results.tsx`
- Ensure firewall allows localhost connections

---

## 📝 Notes

- **Job Store**: In-memory (lost on restart)
- **Price Extraction**: Regex-based (may vary by store layout)
- **OCR Fallback**: Mock product name if API key not configured
- **Stores**: Maxima (Rimi.lt), Rimi (Barbora.lt), Lidl (site:lidl.lt)
