import asyncio
import re
from typing import Any, Optional, Tuple, List
from urllib.parse import quote_plus

import httpx
from bs4 import BeautifulSoup

from app.config import get_settings


# Multiple price patterns for better matching across different store formats
PRICE_PATTERNS = [
    re.compile(r'"price"[:\s]*"?(\d+[.,]\d{2})"?', re.IGNORECASE),  # JSON: "price":"12.34"
    re.compile(r'data-price[="\s]+(\d+[.,]\d{2})', re.IGNORECASE),  # data-price="12.34"
    re.compile(r'class="[^"]*price[^"]*"[^>]*>(\d+[.,]\d{2})', re.IGNORECASE),  # <span class="price">12.34
    re.compile(r'€\s*(\d+[.,]\d{2})'),  # €12.34
    re.compile(r'(\d+[.,]\d{2})\s*€'),  # 12.34€
    re.compile(r'(\d+[.,]\d{2})\s*EUR', re.IGNORECASE),  # 12.34 EUR
    re.compile(r'price[\"\':>\s]+(\d+[.,]\d{2})', re.IGNORECASE),  # Various price patterns
    re.compile(r'\b(\d+[.,]\d{2})\s*(?=\D|$)'),  # Any decimal number as fallback
]


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
        "render_js": "true",
        "premium_proxy": "true",
        "wait": "2000",
        "block_resources": "false"
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
    
    # Use structured HTML parsing to find product cards
    price, confidence = extract_price_from_product_cards(html, query)
    
    return {
        "store": store["name"],
        "price": price,
        "currency": "€",
        "confidence": round(confidence, 2),
        "originalPrice": None,
        "discountPercent": None,
        "productUrl": target_url,
    }


def extract_price_from_product_cards(html: str, query: str) -> Tuple[Optional[float], float]:
    """Extract price from product cards in HTML by finding products matching the query.
    
    Returns:
        Tuple of (price, confidence) where confidence is 0.0-1.0
    """
    try:
        soup = BeautifulSoup(html, 'lxml')
    except:
        soup = BeautifulSoup(html, 'html.parser')
    
    query_terms = [term.lower() for term in query.split() if len(term) > 2]
    
    # Common product card selectors across Lithuanian stores
    product_selectors = [
        'div[class*="product"]',
        'article[class*="product"]',
        'div[class*="item"]',
        'li[class*="product"]',
        'div[data-testid*="product"]',
    ]
    
    # Price selectors - prioritize unit price over per-kg price
    unit_price_selectors = [
        '[class*="unit-price"]',
        '[class*="final-price"]',
        '[class*="current-price"]',
        '[class*="sale-price"]',
        '[class*="price"][class*="main"]',
    ]
    
    per_kg_exclude_patterns = [
        r'/\s*kg',
        r'€\s*/\s*kg',
        r'kaina\s*už\s*kg',
        r'per\s*kg',
        r'\d+[.,]\d{2}\s*€\s*/\s*kg',
    ]
    
    candidate_products = []
    
    # Find all potential product containers
    for selector in product_selectors:
        products = soup.select(selector)
        for product in products[:20]:  # Limit to first 20
            product_text = product.get_text().lower()
            
            # Check if product matches query terms
            matches = sum(1 for term in query_terms if term in product_text)
            relevance = matches / len(query_terms) if query_terms else 0
            
            if relevance < 0.2:  # Lowered from 0.3 to 0.2 (20% match)
                continue
            
            # Look for unit price elements first
            found_price = False
            for price_selector in unit_price_selectors:
                price_elements = product.select(price_selector)
                for elem in price_elements:
                    price_text = elem.get_text()
                    
                    # Skip if this looks like a per-kg price
                    is_per_kg = any(re.search(pattern, price_text, re.IGNORECASE) for pattern in per_kg_exclude_patterns)
                    if is_per_kg:
                        continue
                    
                    # Extract price
                    price_match = re.search(r'(\d+)[.,](\d{2})', price_text)
                    if price_match:
                        try:
                            price = float(f"{price_match.group(1)}.{price_match.group(2)}")
                            # Reasonable price range for grocery items (not per-kg)
                            if 0.10 <= price <= 25.00:  # Expanded from 50 to 25
                                candidate_products.append((price, relevance, product_text[:100]))
                                found_price = True
                                break
                        except:
                            continue
                if found_price:
                    break
            
            # If no unit price found, try any price element but filter out high prices
            if not found_price:
                all_prices = re.findall(r'(\d+)[.,](\d{2})\s*€', product.get_text())
                for price_parts in all_prices:
                    try:
                        price = float(f"{price_parts[0]}.{price_parts[1]}")
                        # Filter: typical grocery items are under €20
                        if 0.10 <= price <= 20.00:  # Expanded from 10 to 20
                            candidate_products.append((price, relevance * 0.8, product_text[:100]))
                            break
                    except:
                        continue
    
    if candidate_products:
        # Sort by relevance (best match first), then by lower price
        candidate_products.sort(key=lambda x: (-x[1], x[0]))
        best_price, best_relevance, _ = candidate_products[0]
        confidence = min(best_relevance, 0.9)
        return best_price, confidence
    
    # Fallback to regex-based extraction if structured parsing fails
    return extract_price(html)


def extract_price(html: str) -> Tuple[Optional[float], float]:
    """Fallback: Extract price from HTML with confidence score using regex.
    
    Returns:
        Tuple of (price, confidence) where confidence is 0.0-1.0
    """
    cleaned_html = html.replace("\xa0", " ").replace("&nbsp;", " ")
    
    # Try patterns in order of reliability
    all_prices = []
    
    for i, pattern in enumerate(PRICE_PATTERNS):
        matches = pattern.finditer(cleaned_html)
        for match in matches:
            # Calculate confidence based on pattern priority
            confidence = 0.5 - (i * 0.05)  # Lower confidence for fallback
            
            raw = match.group(1) if match.groups() else match.group(0)
            raw = raw.replace(",", ".")
            try:
                price = round(float(raw), 2)
                if 0.01 <= price <= 9999.99:
                    all_prices.append((price, confidence, match.start()))
            except ValueError:
                continue
    
    if not all_prices:
        return None, 0.0
    
    # Sort by position and return first
    all_prices.sort(key=lambda x: x[2])
    return all_prices[0][0], all_prices[0][1]
    """Extract price from HTML with confidence score.
    
    Returns:
        Tuple of (price, confidence) where confidence is 0.0-1.0
    """
    cleaned_html = html.replace("\xa0", " ").replace("&nbsp;", " ")
    
    # Try patterns in order of reliability
    all_prices = []
    
    for i, pattern in enumerate(PRICE_PATTERNS):
        matches = pattern.finditer(cleaned_html)
        for match in matches:
            # Calculate confidence based on pattern priority
            confidence = 1.0 - (i * 0.1)
            
            raw = match.group(1) if match.groups() else match.group(0)
            raw = raw.replace(",", ".")
            try:
                price = round(float(raw), 2)
                if 0.01 <= price <= 9999.99:
                    # Store price with its position in HTML
                    all_prices.append((price, confidence, match.start()))
            except ValueError:
                continue
    
    if not all_prices:
        return None, 0.0
    
    # If we have multiple prices, prefer those appearing earlier (usually more relevant)
    # Sort by position (earlier = better) and confidence
    all_prices.sort(key=lambda x: (x[2], -x[1]))
    
    # Get unique prices (remove duplicates)
    seen_prices = set()
    unique_prices = []
    for price, conf, pos in all_prices:
        if price not in seen_prices:
            seen_prices.add(price)
            unique_prices.append((price, conf))
    
    if unique_prices:
        # Return the first unique price (most likely to be correct)
        return unique_prices[0][0], unique_prices[0][1]
    
    return None, 0.0


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
                    "confidence": 0.0,
                    "productUrl": store["search_url"].format(
                        query=quote_plus(query)
                    ),
                    "error": str(result),
                }
            )
        else:
            payload.append(result)
    return payload

