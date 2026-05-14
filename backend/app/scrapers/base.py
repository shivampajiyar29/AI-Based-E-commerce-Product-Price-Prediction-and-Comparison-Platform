"""
Base Scraper
============
Shared session, rotating user-agents, and utility methods
used by all platform-specific scrapers.
"""

import re
import requests
from abc import ABC, abstractmethod
from typing import List, Dict
from fake_useragent import UserAgent

KNOWN_BRANDS = [
    "Apple", "Samsung", "Sony", "Boat", "OnePlus", "Realme",
    "LG", "Philips", "Bose", "JBL", "Xiaomi", "Oppo", "Vivo",
    "Lenovo", "Dell", "HP", "Asus", "Acer", "Microsoft", "Google",
]


class BaseScraper(ABC):
    def __init__(self):
        ua = UserAgent()
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": ua.random,
            "Accept-Language": "en-IN,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        })

    @abstractmethod
    def search(self, query: str) -> List[Dict]:
        """Search for products and return normalized list."""
        ...

    def _extract_brand(self, name: str) -> str:
        for brand in KNOWN_BRANDS:
            if brand.lower() in name.lower():
                return brand
        words = name.strip().split()
        return words[0] if words else "Unknown"

    def _clean_price(self, text: str) -> float:
        cleaned = re.sub(r"[^\d.]", "", text)
        try:
            return float(cleaned)
        except ValueError:
            return 0.0

    def _calc_discount(self, price: float, original: float) -> float:
        if original and original > price:
            return round((original - price) / original * 100, 1)
        return 0.0
