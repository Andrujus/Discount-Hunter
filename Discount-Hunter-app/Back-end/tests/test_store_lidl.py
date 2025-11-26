import pathlib
from app.scrapers.store_lidl import LidlScraper


def test_lidl_parsing():
    path = pathlib.Path(__file__).parent / "fixtures" / "lidl_sample.html"
    html = path.read_text(encoding="utf-8")
    scraper = LidlScraper()
    items = scraper._parse_html(html, base_url="https://www.lidl.lt")
    assert items, "No items parsed from Lidl sample"
    assert any("sriuba" in (i.get("title") or "").lower() for i in items)
