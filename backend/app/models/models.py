from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    alerts = relationship("PriceAlert", back_populates="user")
    saved_products = relationship("SavedProduct", back_populates="user")
    predictions = relationship("Prediction", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    brand = Column(String(100))
    category = Column(String(100))
    description = Column(Text)
    image_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    listings = relationship("ProductListing", back_populates="product")
    predictions = relationship("Prediction", back_populates="product")


class ProductListing(Base):
    __tablename__ = "product_listings"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    platform = Column(String(50), nullable=False)  # amazon, flipkart, meesho, myntra
    platform_url = Column(String(500))
    current_price = Column(Float, nullable=False)
    original_price = Column(Float)
    discount_percent = Column(Float)
    rating = Column(Float)
    review_count = Column(Integer)
    delivery_days = Column(Integer)
    delivery_free = Column(Boolean, default=True)
    in_stock = Column(Boolean, default=True)
    scraped_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="listings")
    price_history = relationship("PriceHistory", back_populates="listing")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("product_listings.id"))
    price = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    listing = relationship("ProductListing", back_populates="price_history")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    predicted_price = Column(Float, nullable=False)
    confidence_score = Column(Float)
    model_used = Column(String(50))
    status = Column(String(50))          # overpriced, underpriced, fair
    best_platform = Column(String(50))
    fake_discount_detected = Column(Boolean, default=False)
    fake_discount_platform = Column(String(50))
    r2_score = Column(Float)
    mae = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="predictions")
    user = relationship("User", back_populates="predictions")


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    target_price = Column(Float, nullable=False)
    platform = Column(String(50))        # optional: specific platform
    is_active = Column(Boolean, default=True)
    triggered = Column(Boolean, default=False)
    triggered_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="alerts")


class SavedProduct(Base):
    __tablename__ = "saved_products"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    saved_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_products")
