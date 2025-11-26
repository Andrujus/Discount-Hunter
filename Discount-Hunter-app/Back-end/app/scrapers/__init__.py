from typing import List, Dict
from .store_barbora import BarboraScraper
from .store_rimi import RimiScraper
from .store_lidl import LidlScraper

SCRAPERS = [
    BarboraScraper(),
    RimiScraper(),
    LidlScraper(),
]


async def search_all(query: str) -> List[Dict]:
    """Run each scraper and collect normalized results.

    Each scraper is expected to implement an async `search` method.
    """
    results = []
    for scraper in SCRAPERS:
        try:
            items = await scraper.search(query)
            if items:
                results.extend(items)
        except Exception as exc:
            # Don't fail the whole pipeline for a single store
            print(f"Error scraping {scraper.name}: {exc}")
    return results
