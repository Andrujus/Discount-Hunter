import asyncio
from collections.abc import MutableMapping
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional


@dataclass
class JobRecord:
    job_id: str
    status: str = "queued"
    data: Optional[list[dict[str, Any]]] = None
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)


class InMemoryJobStore(MutableMapping[str, JobRecord]):
    """Simplistic in-memory store for scraping jobs."""

    def __init__(self) -> None:
        self._jobs: dict[str, JobRecord] = {}
        self._lock = asyncio.Lock()

    def __getitem__(self, key: str) -> JobRecord:
        return self._jobs[key]

    def __setitem__(self, key: str, value: JobRecord) -> None:
        self._jobs[key] = value

    def __delitem__(self, key: str) -> None:
        del self._jobs[key]

    def __iter__(self):
        return iter(self._jobs)

    def __len__(self) -> int:
        return len(self._jobs)

    async def create_job(self, job_id: str) -> JobRecord:
        async with self._lock:
            record = JobRecord(job_id=job_id)
            self._jobs[job_id] = record
            return record

    async def update_job(
        self,
        job_id: str,
        *,
        status: Optional[str] = None,
        data: Optional[list[dict[str, Any]]] = None,
        error: Optional[str] = None,
    ) -> JobRecord:
        async with self._lock:
            record = self._jobs[job_id]
            if status:
                record.status = status
            if data is not None:
                record.data = data
            if error is not None:
                record.error = error
            record.updated_at = datetime.utcnow()
            return record

    async def get_record(self, job_id: str) -> JobRecord | None:
        async with self._lock:
            return self._jobs.get(job_id)


job_store = InMemoryJobStore()

