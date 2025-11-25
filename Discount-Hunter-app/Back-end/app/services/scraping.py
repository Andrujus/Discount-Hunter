import asyncio
import re
from typing import Any
from urllib.parse import quote_plus

import httpx

from app.config import get_settings


PRICE_REGEX = re.compile(r"(?:€|\b)\s*(\d+[.,]\d{2})")


class ScrapingBeeError(RuntimeError):
    """Raised when ScrapingBee returns an error response."""


async def fetch_store_snapshot(
    client: httpx.AsyncClient, *, store: dict[str, str], query: str
) -> dict[str, Any]:
    """Fetch a single store page through ScrapingBee and derive a price."""
    settings = get_settings()
    if not settings.scrapingbee_api_key:
        raise ScrapingBeeError("SCRAPINGBEE_API_KEY is not configured")

    encoded_query = quote_plus(query)
    target_url = store["search_url"].format(query=encoded_query)

    params = {
        "api_key": settings.scrapingbee_api_key,
        "url": target_url,
        "render_js": "false",
    }

    response = await client.get(
        "https://app.scrapingbee.com/api/v1/",
        params=params,
        timeout=settings.request_timeout_seconds,
    )

    if response.is_error:
        raise ScrapingBeeError(
            f"ScrapingBee error for {store['name']}: {response.status_code}"
        )

    html = response.text
    price = extract_price(html)

    return {
        "store": store["name"],
        "price": price,
        "currency": "€",
        "originalPrice": None,
        "discountPercent": None,
        "productUrl": target_url,
    }


def extract_price(html: str) -> float | None:
    """Best-effort search for the first price-like token in HTML."""
    match = PRICE_REGEX.search(html.replace("\xa0", " "))
    if not match:
        return None

    raw = match.group(1).replace(",", ".")
    try:
        return round(float(raw), 2)
    except ValueError:
        return None


async def scrape_all_stores(query: str) -> list[dict[str, Any]]:
    """Scrape every configured store concurrently."""
    settings = get_settings()
    async with httpx.AsyncClient(follow_redirects=True) as client:
        tasks = [
            fetch_store_snapshot(client, store=store, query=query)
            for store in settings.stores
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    payload: list[dict[str, Any]] = []
    for store, result in zip(settings.stores, results, strict=False):
        if isinstance(result, Exception):
            payload.append(
                {
                    "store": store["name"],
                    "price": None,
                    "currency": "€",
                    "productUrl": store["search_url"].format(
                        query=quote_plus(query)
                    ),
                    "error": str(result),
                }
            )
        else:
            payload.append(result)
    return payload

