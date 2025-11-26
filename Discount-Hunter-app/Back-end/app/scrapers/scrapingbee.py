from typing import Optional
import httpx
from app.config import get_settings


async def scrapingbee_get(url: str, render_js: bool = False, params: Optional[dict] = None, timeout: float = 30.0) -> str:
    """Async wrapper around ScrapingBee API using httpx.AsyncClient.

    Reads the API key from `app.config.get_settings()` so `.env` values are honored.
    Returns the HTML text. Raises for HTTP errors when no key or request fails.
    """
    settings = get_settings()
    api_key = settings.scrapingbee_api_key
    if not api_key:
        raise RuntimeError("SCRAPINGBEE_API_KEY is not configured")

    base_params = {
        "api_key": api_key,
        "url": url,
        "render_js": "true" if render_js else "false",
    }
    if params:
        base_params.update(params)

    async with httpx.AsyncClient(follow_redirects=True, timeout=timeout) as client:
        resp = await client.get("https://app.scrapingbee.com/api/v1/", params=base_params)
        resp.raise_for_status()
        return resp.text
