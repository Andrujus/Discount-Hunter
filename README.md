Discount-Hunter
================

## Front-end preview

```
cd Discount-Hunter-app\Front-end
$env:EXPO_NO_TELEMETRY = '1'
npx expo start --web
```

## Back-end (FastAPI + ScrapingBee)

```
cd Discount-Hunter\Back-end
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set SCRAPINGBEE_API_KEY=your-key-here
set OCR_SPACE_API_KEY=your-ocr-space-key-or-leave-empty-for-dev
uvicorn app.main:app --reload
```

The API exposes:
- `POST /api/scrape` ➜ start a scraping job (`{"query": "product name"}`) and returns `{ "jobId": "..." }`
- `GET /api/scrape/{jobId}` ➜ poll job status until `completed` with store prices scraped via ScrapingBee.