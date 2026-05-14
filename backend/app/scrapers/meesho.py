from typing import List, Dict
from app.scrapers.base import BaseScraper


class MeeshoScraper(BaseScraper):
    """
    Meesho does not expose a standard HTML search page — it is a React SPA.
    In production, use Meesho's seller/affiliate API or a headless browser
    (Playwright / Selenium) to render and scrape the JS-rendered pages.
    This stub returns realistic mock data for development.
    """

    def search(self, query: str) -> List[Dict]:
        print(f"[MeeshoScraper] SPA site — returning mock data for '{query}'")
        return self._mock_results(query)

    def _mock_results(self, query: str) -> List[Dict]:
        return [
            {
                "name": f"{query} (Meesho listing)",
                "price": 71500.0,
                "original_price": 99999.0,   # inflated MRP — likely fake discount
                "discount_percent": 28.5,
                "rating": 3.8,
                "review_count": 2100,
                "image_url": None,
                "url": f"https://meesho.com/search?q={query}",
                "brand": self._extract_brand(query),
                "category": "Electronics",
            }
        ]


class MyntraScraper(BaseScraper):
    """
    Myntra is also a React SPA. Same approach as Meesho.
    Use a headless browser or Myntra Partner API for production.
    """

    def search(self, query: str) -> List[Dict]:
        print(f"[MyntraScraper] SPA site — returning mock data for '{query}'")
        return self._mock_results(query)

    def _mock_results(self, query: str) -> List[Dict]:
        return [
            {
                "name": f"{query} (Myntra listing)",
                "price": 74500.0,
                "original_price": 79900.0,
                "discount_percent": 6.8,
                "rating": 4.1,
                "review_count": 5600,
                "image_url": None,
                "url": f"https://www.myntra.com/{query.replace(' ', '-')}",
                "brand": self._extract_brand(query),
                "category": "Electronics",
            }
        ]
