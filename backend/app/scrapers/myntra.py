from typing import List, Dict
from app.scrapers.base import BaseScraper


class MyntraScraper(BaseScraper):
    """
    Myntra is a React SPA. Use a headless browser (Playwright/Selenium)
    or the Myntra Partner API for production scraping.
    This stub returns realistic mock data for development and testing.
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
