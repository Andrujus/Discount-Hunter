from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, constr, EmailStr, field_validator


# Auth Schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    userId: int
    email: str
    firstName: str
    lastName: str
    token: str


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
    confidence: Optional[float] = Field(default=0.0, description="Price extraction confidence (0-1)")
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

