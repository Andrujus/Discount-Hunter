import asyncio
from datetime import datetime
from uuid import uuid4

from fastapi import FastAPI, HTTPException

from app import schemas
from app.services.scraping import scrape_all_stores
from app.state import job_store

app = FastAPI(title="Discount Hunter API")


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

