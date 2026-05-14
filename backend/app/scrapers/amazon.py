"""
Amazon Scraper
==============
Scrapes Amazon India search results using BeautifulSoup.
For production use the Amazon Product Advertising API instead.
"""

import re
import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from app.scrapers.base import BaseScraper


class AmazonScraper(BaseScraper):
    BASE_URL = "https://www.amazon.in/s"

    def search(self, query: str) -> List[Dict]:
        params = {"k": query, "ref": "nb_sb_noss"}
        try:
            resp = self.session.get(self.BASE_URL, params=params, timeout=10)
            resp.raise_for_status()
        except Exception as e:
            print(f"[AmazonScraper] Request failed: {e}")
            return self._mock_results(query)

        soup = BeautifulSoup(resp.text, "lxml")
        items = soup.select("div[data-component-type='s-search-result']")
        results = []

        for item in items[:8]:
            try:
                name_el = item.select_one("h2 span")
                price_whole = item.select_one("span.a-price-whole")
                original_el = item.select_one("span.a-text-price span.a-offscreen")
                rating_el = item.select_one("span.a-icon-alt")
                review_el = item.select_one("span.a-size-base.s-underline-text")
                img_el = item.select_one("img.s-image")
                link_el = item.select_one("a.a-link-normal.s-no-outline")

                if not name_el or not price_whole:
                    continue

                price = float(re.sub(r"[^\d.]", "", price_whole.text))
                original = None
                discount = 0.0
                if original_el:
                    original = float(re.sub(r"[^\d.]", "", original_el.text))
                    if original > price:
                        discount = round((original - price) / original * 100, 1)

                rating = 0.0
                if rating_el:
                    m = re.search(r"(\d+\.?\d*)", rating_el.text)
                    if m:
                        rating = float(m.group(1))

                reviews = 0
                if review_el:
                    reviews = int(re.sub(r"[^\d]", "", review_el.text) or 0)

                results.append({
                    "name": name_el.text.strip(),
                    "price": price,
                    "original_price": original,
                    "discount_percent": discount,
                    "rating": rating,
                    "review_count": reviews,
                    "image_url": img_el["src"] if img_el else None,
                    "url": "https://www.amazon.in" + link_el["href"] if link_el else None,
                    "brand": self._extract_brand(name_el.text),
                    "category": "General",
                })
            except Exception:
                continue

        return results if results else self._mock_results(query)

    def _mock_results(self, query: str) -> List[Dict]:
        """Fallback mock data when scraping is blocked."""
        return [
            {
                "name": f"{query} (Amazon listing)",
                "price": 72999.0,
                "original_price": 79900.0,
                "discount_percent": 8.6,
                "rating": 4.2,
                "review_count": 12400,
                "image_url": None,
                "url": f"https://www.amazon.in/s?k={query}",
                "brand": self._extract_brand(query),
                "category": "Electronics",
            }
        ]
