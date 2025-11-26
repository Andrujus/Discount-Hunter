import pathlib
from app.scrapers.store_rimi import RimiScraper


def test_rimi_parsing():
    path = pathlib.Path(__file__).parent / "fixtures" / "rimi_sample.html"
    html = path.read_text(encoding="utf-8")
    scraper = RimiScraper()
    items = scraper._parse_html(html, base_url="https://www.rimi.lt")
    assert items, "No items parsed from Rimi sample"
    assert any("maggi" in (i.get("title") or "").lower() for i in items)
