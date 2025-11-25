from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    scrapingbee_api_key: str = Field(
        default="",
        validation_alias="SCRAPINGBEE_API_KEY",
        description="API key for ScrapingBee",
    )
    request_timeout_seconds: float = Field(
        default=30.0,
        ge=1.0,
        description="Timeout for outbound HTTP calls to ScrapingBee",
    )
    stores: list[dict[str, str]] = Field(
        default_factory=lambda: [
            {
                "name": "Maxima",
                "search_url": "https://www.barbora.lt/paieska?q={query}",
            },
            {
                "name": "Rimi",
                "search_url": "https://www.rimi.lt/e-parduotuve/lt/paieska?query={query}",
            },
            {
                "name": "Lidl",
                "search_url": "https://www.lidl.lt/c/search?q={query}",
            },
        ],
        description="List of store descriptors the scraper should target",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


    # Optional OCR provider key (OCR.space)
    ocr_space_api_key: str = Field(
        default="",
        validation_alias="OCR_SPACE_API_KEY",
        description="API key for OCR.space (optional, falls back to mock)",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()

