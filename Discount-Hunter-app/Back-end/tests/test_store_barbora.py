import pathlib
from app.scrapers.store_barbora import BarboraScraper


def test_barbora_parsing():
    path = pathlib.Path(__file__).parent / "fixtures" / "barbora_sample.html"
    html = path.read_text(encoding="utf-8")
    scraper = BarboraScraper()
    items = scraper._parse_html(html, base_url="https://www.barbora.lt")
    assert items, "No items parsed from Barbora sample"
    assert any("pieno" in (i.get("title") or "").lower() for i in items)
