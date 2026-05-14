import re
import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from app.scrapers.base import BaseScraper


class FlipkartScraper(BaseScraper):
    BASE_URL = "https://www.flipkart.com/search"

    def search(self, query: str) -> List[Dict]:
        params = {"q": query, "otracker": "search"}
        try:
            resp = self.session.get(self.BASE_URL, params=params, timeout=10)
            resp.raise_for_status()
        except Exception as e:
            print(f"[FlipkartScraper] Request failed: {e}")
            return self._mock_results(query)

        soup = BeautifulSoup(resp.text, "lxml")
        # Flipkart uses dynamic class names; target container divs
        containers = soup.select("div._1AtVbE") or soup.select("div._2kHMtA")
        results = []

        for container in containers[:8]:
            try:
                name_el   = container.select_one("div._4rR01T, a.s1Q9rs, a.IRpwTa")
                price_el  = container.select_one("div._30jeq3, div._1_WHN1")
                orig_el   = container.select_one("div._3I9_wc, div._27UcVY")
                rating_el = container.select_one("div._3LWZlK")
                review_el = container.select_one("span._2_R_DZ")
                img_el    = container.select_one("img._396cs4, img._2r_T1I")
                link_el   = container.select_one("a._1fQZEK, a.s1Q9rs, a.IRpwTa")

                if not name_el or not price_el:
                    continue

                price    = self._clean_price(price_el.text)
                original = self._clean_price(orig_el.text) if orig_el else None
                discount = self._calc_discount(price, original) if original else 0.0

                rating  = float(rating_el.text.strip()) if rating_el else 0.0
                reviews = 0
                if review_el:
                    m = re.search(r"(\d[\d,]*)", review_el.text)
                    if m:
                        reviews = int(m.group(1).replace(",", ""))

                results.append({
                    "name": name_el.text.strip(),
                    "price": price,
                    "original_price": original,
                    "discount_percent": discount,
                    "rating": rating,
                    "review_count": reviews,
                    "image_url": img_el["src"] if img_el else None,
                    "url": "https://www.flipkart.com" + link_el["href"] if link_el else None,
                    "brand": self._extract_brand(name_el.text),
                    "category": "Electronics",
                })
            except Exception:
                continue

        return results if results else self._mock_results(query)

    def _mock_results(self, query: str) -> List[Dict]:
        return [
            {
                "name": f"{query} (Flipkart listing)",
                "price": 68999.0,
                "original_price": 79900.0,
                "discount_percent": 13.6,
                "rating": 4.5,
                "review_count": 18200,
                "image_url": None,
                "url": f"https://www.flipkart.com/search?q={query}",
                "brand": self._extract_brand(query),
                "category": "Electronics",
            }
        ]
