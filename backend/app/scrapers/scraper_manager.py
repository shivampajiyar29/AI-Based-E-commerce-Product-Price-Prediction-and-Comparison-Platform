"""
PriceSense — Scraper Manager
=============================
Coordinates scraping across Amazon, Flipkart, Meesho, Myntra.
Uses BeautifulSoup + Requests with rotating user agents and delays.

NOTE: Web scraping must comply with each site's Terms of Service.
      For production, use official partner APIs where available
      (e.g. Amazon Product Advertising API, Flipkart Affiliate API).
"""

import time
import random
from typing import List, Dict

from app.scrapers.amazon import AmazonScraper
from app.scrapers.flipkart import FlipkartScraper
from app.scrapers.meesho import MeeshoScraper
from app.scrapers.myntra import MyntraScraper
from app.config import settings


class ScraperManager:
    def __init__(self):
        self.scrapers = {
            "amazon":   AmazonScraper(),
            "flipkart": FlipkartScraper(),
            "meesho":   MeeshoScraper(),
            "myntra":   MyntraScraper(),
        }

    def search_all_platforms(self, query: str) -> List[Dict]:
        """
        Searches all platforms for the given query.
        Returns a unified list of products with aggregated data.
        """
        all_results: Dict[str, List[Dict]] = {}

        for platform, scraper in self.scrapers.items():
            try:
                results = scraper.search(query)
                all_results[platform] = results
            except Exception as e:
                print(f"[ScraperManager] {platform} failed: {e}")
                all_results[platform] = []
            # Polite delay between requests
            time.sleep(settings.SCRAPER_DELAY_SECONDS + random.uniform(0, 1))

        return self._merge_results(all_results, query)

    def _merge_results(self, platform_data: Dict[str, List], query: str) -> List[Dict]:
        """
        Groups products by name and creates a unified record with
        prices from all platforms.
        """
        merged: Dict[str, Dict] = {}

        for platform, items in platform_data.items():
            for item in items:
                key = self._normalize_name(item["name"])
                if key not in merged:
                    merged[key] = {
                        "id": abs(hash(key)) % 100000,
                        "name": item["name"],
                        "brand": item.get("brand", "Unknown"),
                        "category": item.get("category", "General"),
                        "image_url": item.get("image_url"),
                        "platforms": {},
                    }
                merged[key]["platforms"][platform] = {
                    "price": item["price"],
                    "original_price": item.get("original_price"),
                    "discount": item.get("discount_percent", 0),
                    "rating": item.get("rating", 0),
                    "reviews": item.get("review_count", 0),
                    "url": item.get("url"),
                }

        results = []
        for key, product in merged.items():
            platforms = product["platforms"]
            if not platforms:
                continue
            prices = {p: d["price"] for p, d in platforms.items()}
            best_platform = min(prices, key=prices.get)
            product["lowest_price"] = prices[best_platform]
            product["best_platform"] = best_platform
            results.append(product)

        return results[:10]

    @staticmethod
    def _normalize_name(name: str) -> str:
        return name.lower().strip()[:60]
