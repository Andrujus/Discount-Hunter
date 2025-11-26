from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from .base import StoreScraper
from .scrapingbee import scrapingbee_get
from urllib.parse import urljoin
import re


class LidlScraper(StoreScraper):
    name = "Lidl"
    SEARCH_URL = "https://www.lidl.lt/c/search?q={query}"

    async def search(self, query: str) -> List[Dict[str, Optional[str]]]:
        url = self.SEARCH_URL.format(query=query)
        html = await scrapingbee_get(url, render_js=True, params={"wait": "2000"})
        return self._parse_html(html, base_url=url)

    def _parse_html(self, html: str, base_url: str = "") -> List[Dict[str, Optional[str]]]:
        soup = BeautifulSoup(html, "lxml")
        items = []
        cards = soup.select("div[class*='product'], div[class*='product-card'], li")
        for card in cards[:30]:
            title_elem = card.select_one(".product-title, .title, h3, h2")
            price_elem = card.select_one(".price, .product-price, .final-price")
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
