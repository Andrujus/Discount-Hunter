from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from .base import StoreScraper
from .scrapingbee import scrapingbee_get
from urllib.parse import urljoin
import re


class RimiScraper(StoreScraper):
    name = "Rimi"
    SEARCH_URL = "https://www.rimi.lt/e-parduotuve/lt/paieska?query={query}"

    async def search(self, query: str) -> List[Dict[str, Optional[str]]]:
        url = self.SEARCH_URL.format(query=query)
        # Rimi can be dynamic; give extra wait
        html = await scrapingbee_get(url, render_js=True, params={"wait": "4000"})
        return self._parse_html(html, base_url=url)

    def _parse_html(self, html: str, base_url: str = "") -> List[Dict[str, Optional[str]]]:
        soup = BeautifulSoup(html, "lxml")
        items = []
        # Rimi search results often use product-tile or product-card classes
        cards = soup.select("div[class*='product'], div[class*='product-tile'], li[class*='product']")
        for card in cards[:30]:
            title_elem = card.select_one(".product-title, .title, h3, h2, [data-testid*='title']")
            price_elem = card.select_one(".price, .product-price, .final-price, [data-test*='price']")
            link_elem = card.select_one("a[href]")
            img_elem = card.select_one("img[src]")

            title = title_elem.get_text(strip=True) if title_elem else None
            price = None
            if price_elem:
                m = re.search(r"(\d+[.,]\d{2})", price_elem.get_text())
                if m:
                    price = float(m.group(1).replace(",", "."))

            url = urljoin(base_url, link_elem["href"]) if link_elem and link_elem.get("href") else base_url
            image = img_elem["src"] if img_elem and img_elem.get("src") else None

            if title and price:
                items.append({
                    "store": self.name,
                    "title": title,
                    "brand": None,
                    "size": None,
                    "unit_price": None,
                    "price": price,
                    "currency": "EUR",
                    "url": url,
                    "image_url": image,
                })

        return items
