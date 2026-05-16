from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


# ── Products ──────────────────────────────────────────
class PlatformListing(BaseModel):
    platform: str
    current_price: float
    original_price: Optional[float]
    discount_percent: Optional[float]
    rating: Optional[float]
    review_count: Optional[int]
    delivery_days: Optional[int]
    delivery_free: bool
    in_stock: bool
    platform_url: Optional[str]
    class Config:
        from_attributes = True

class ProductOut(BaseModel):
    id: int
    name: str
    brand: Optional[str]
    category: Optional[str]
    image_url: Optional[str]
    listings: List[PlatformListing] = []
    class Config:
        from_attributes = True

class ProductSearchResult(BaseModel):
    id: int
    name: str
    brand: Optional[str]
    category: Optional[str]
    image_url: Optional[str]
    lowest_price: float
    best_platform: str


# ── ML Prediction ─────────────────────────────────────
class PredictionRequest(BaseModel):
    product_name: str
    brand: str
    category: str
    rating: float
    review_count: int
    discount_percent: float
    platform: str
    is_latest_model: Optional[int] = 0

class PredictionResponse(BaseModel):
    predicted_price: float
    market_price: float
    status: str                    # overpriced | underpriced | fair
    best_platform: str
    confidence_score: float
    fake_discount_detected: bool
    fake_discount_platform: Optional[str]
    recommendation: str
    customer_value_score: Optional[float]
    model_used: str
    r2_score: float
    mae: float
    model_config = {"protected_namespaces": ()}

class PriceHistoryPoint(BaseModel):
    platform: str
    price: float
    recorded_at: datetime
    class Config:
        from_attributes = True


# ── Alerts ────────────────────────────────────────────
class AlertCreate(BaseModel):
    product_id: int
    target_price: float
    platform: Optional[str] = None

class AlertOut(BaseModel):
    id: int
    product_id: int
    target_price: float
    platform: Optional[str]
    is_active: bool
    triggered: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ── Analytics ─────────────────────────────────────────
class AnalyticsSummary(BaseModel):
    total_products_analyzed: int
    fake_discounts_flagged: int
    avg_savings_found: float
    ml_accuracy: float
    best_platform_overall: str
    platform_avg_prices: dict
    model_scores: dict
    model_config = {"protected_namespaces": ()}
