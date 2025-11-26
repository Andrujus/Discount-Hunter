from typing import List, Dict
import unicodedata
import re


def normalize_title(title: str) -> str:
    if not title:
        return ""
    t = title.lower()
    t = unicodedata.normalize("NFKD", t)
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return " ".join(t.split())


def normalize_results(items: List[Dict]) -> List[Dict]:
    for item in items:
        item["normalized_title"] = normalize_title(item.get("title") or "")
    # Optionally deduplicate by normalized_title + size
    # Keep as-is for now; callers can sort by unit_price or price
    return items
