import asyncio
from datetime import datetime
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app import schemas
from app.services.scraping import scrape_all_stores
from app.services.price_utils import sanitize_prices, add_price_statistics
from app.state import job_store
from app.services.ocr import ocr_from_file
from app.services.auth import register_user, login_user, get_user_by_token
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


# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@app.post("/api/auth/register", response_model=schemas.AuthResponse, tags=["auth"])
async def register(request: schemas.RegisterRequest) -> schemas.AuthResponse:
    """Register a new user."""
    try:
        user_data = register_user(
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            password=request.password,
        )
        return schemas.AuthResponse(**user_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/login", response_model=schemas.AuthResponse, tags=["auth"])
async def login(request: schemas.LoginRequest) -> schemas.AuthResponse:
    """Login a user."""
    try:
        user_data = login_user(email=request.email, password=request.password)
        return schemas.AuthResponse(**user_data)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.get("/api/auth/me", response_model=dict, tags=["auth"])
async def get_current_user(token: str = Query(...)) -> dict:
    """Get current user from token."""
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


# ============================================================================
# SCRAPING ENDPOINTS
# ============================================================================

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
        # Filter out results with very low confidence (likely irrelevant)
        filtered = [r for r in results if r.get('confidence', 0) >= 0.15 or r.get('price') is None]  # Lowered from 0.3 to 0.15
        # Sanitize prices to remove outliers and invalid data
        sanitized = sanitize_prices(filtered)
        # Add statistics
        stats = add_price_statistics(sanitized)
        # Sort by confidence (highest first) then price (lowest first)
        sanitized.sort(key=lambda x: (-(x.get('confidence') or 0), x.get('price') or float('inf')))
    except Exception as exc:
        await job_store.update_job(job_id, status="failed", error=str(exc))
        return

    await job_store.update_job(job_id, status="completed", data=sanitized)


@app.post("/api/ocr", response_model=OCRResponse, tags=["ocr"])
async def upload_and_ocr(file: UploadFile = File(...)) -> OCRResponse:
    """Accept an uploaded image and return a best-effort product name.

    Falls back to a mocked product name when no OCR provider key is configured.
    """
    try:
        print(f"[OCR] Received file: {file.filename}, content_type: {file.content_type}")
        product_name = await ocr_from_file(file)
        print(f"[OCR] Successfully extracted: {product_name}")
    except Exception as exc:
        print(f"[OCR] ERROR: {type(exc).__name__}: {str(exc)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))

    return OCRResponse(productName=product_name)

