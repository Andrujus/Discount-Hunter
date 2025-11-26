from abc import ABC, abstractmethod
from typing import List, Dict, Optional


class StoreScraper(ABC):
    """Abstract base for per-store scrapers.

    Implementations should provide a synchronous `search(query)` method
    that returns a list of normalized item dicts.
    """

    name: str = ""

    @abstractmethod
    def search(self, query: str) -> List[Dict[str, Optional[str]]]:
        """Return list of normalized items.

        Each item should include at least:
          - store, title, price, unit_price (optional), currency, url, image_url
        """
        ...
