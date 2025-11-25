import asyncio
from datetime import datetime
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import schemas
from app.services.scraping import scrape_all_stores
from app.state import job_store
from app.services.ocr import ocr_from_file
from fastapi import File, UploadFile
from app.schemas import OCRResponse

app = FastAPI(title="Discount Hunter API")

# Allow CORS from the frontend host(s)
allowed_origins = [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:19006",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post(
    "/api/scrape",
    response_model=schemas.ScrapeTriggerResponse,
    tags=["scraping"],
)
async def start_scrape(request: schemas.ScrapeRequest) -> schemas.ScrapeTriggerResponse:
    job_id = str(uuid4())
    await job_store.create_job(job_id)

    asyncio.create_task(_run_scrape_job(job_id, request.query))

    return schemas.ScrapeTriggerResponse(jobId=job_id)


@app.get(
    "/api/scrape/{job_id}",
    response_model=schemas.JobStatusResponse,
    tags=["scraping"],
)
async def get_job_status(job_id: str) -> schemas.JobStatusResponse:
    record = await job_store.get_record(job_id)
    if not record:
        raise HTTPException(status_code=404, detail="Job not found")

    return schemas.JobStatusResponse(
        status=record.status,
        data=record.data,
        error=record.error,
    )


async def _run_scrape_job(job_id: str, query: str) -> None:
    await job_store.update_job(job_id, status="running")
    try:
        results = await scrape_all_stores(query)
    except Exception as exc:
        await job_store.update_job(job_id, status="failed", error=str(exc))
        return

    await job_store.update_job(job_id, status="completed", data=results)


@app.post("/api/ocr", response_model=OCRResponse, tags=["ocr"])
async def upload_and_ocr(file: UploadFile = File(...)) -> OCRResponse:
    """Accept an uploaded image and return a best-effort product name.

    Falls back to a mocked product name when no OCR provider key is configured.
    """
    try:
        product_name = await ocr_from_file(file)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return OCRResponse(productName=product_name)

