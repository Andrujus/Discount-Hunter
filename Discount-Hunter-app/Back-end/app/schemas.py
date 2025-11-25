from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, constr


class ScrapeRequest(BaseModel):
    query: constr(strip_whitespace=True, min_length=2, max_length=120) = Field(
        ..., description="Product name or keywords to search for"
    )


class ScrapeTriggerResponse(BaseModel):
    jobId: str = Field(..., description="Identifier for the scraping job")


class StoreResult(BaseModel):
    store: str
    price: Optional[float] = Field(default=None, description="Current price, if parsed")
    currency: Optional[str] = Field(default="€")
    originalPrice: Optional[float] = Field(default=None)
    discountPercent: Optional[float] = Field(default=None)
    productUrl: Optional[str] = Field(default=None)
    lastUpdated: datetime = Field(default_factory=datetime.utcnow)


class JobStatusResponse(BaseModel):
    status: Literal["queued", "running", "completed", "failed"]
    data: Optional[list[StoreResult]] = None
    error: Optional[str] = None


class OCRResponse(BaseModel):
    productName: Optional[str] = None

