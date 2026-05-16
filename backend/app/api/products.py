from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import Product, ProductListing, PriceHistory
from app.schemas.schemas import ProductOut, ProductSearchResult, PlatformListing, PriceHistoryPoint
from app.scrapers.scraper_manager import ScraperManager

router = APIRouter()
scraper = ScraperManager()


@router.get("/search", response_model=List[ProductSearchResult])
def search_products(
    q: str = Query(..., min_length=2, description="Product search query"),
    db: Session = Depends(get_db),
):
    """
    Search for a product and trigger scraping across all platforms.
    Returns aggregated results with lowest price and best platform.
    """
    # Try to find existing products in DB first
    products = db.query(Product).filter(
        Product.name.ilike(f"%{q}%")
    ).limit(10).all()

    if not products:
        # Scrape fresh data from all platforms
        scraped = scraper.search_all_platforms(q)
        results = []
        
        for item in scraped:
            # Check if product already exists by name
            existing = db.query(Product).filter(Product.name == item["name"]).first()
            if not existing:
                new_p = Product(
                    name=item["name"],
                    brand=item.get("brand", "Unknown"),
                    category=item.get("category", "General"),
                    image_url=item.get("image_url")
                )
                db.add(new_p)
                db.flush() # Get ID
                
                # Add listings
                for platform, details in item.get("platforms", {}).items():
                    new_l = ProductListing(
                        product_id=new_p.id,
                        platform=platform,
                        current_price=details["price"],
                        original_price=details.get("original_price"),
                        discount_percent=details.get("discount", 0),
                        rating=details.get("rating", 0),
                        review_count=details.get("reviews", 0),
                        platform_url=details.get("url"),
                        in_stock=True
                    )
                    db.add(new_l)
                db.commit()
                product_to_return = new_p
                best_platform = item["best_platform"]
                lowest_price = item["lowest_price"]
            else:
                product_to_return = existing
                # Recalculate best platform from DB or item
                best_platform = item["best_platform"]
                lowest_price = item["lowest_price"]

            results.append(ProductSearchResult(
                id=product_to_return.id,
                name=product_to_return.name,
                brand=product_to_return.brand,
                category=product_to_return.category,
                image_url=product_to_return.image_url,
                lowest_price=lowest_price,
                best_platform=best_platform,
            ))
        return results

    results = []
    for p in products:
        listings = db.query(ProductListing).filter(
            ProductListing.product_id == p.id
        ).all()
        if listings:
            best = min(listings, key=lambda x: x.current_price)
            results.append(ProductSearchResult(
                id=p.id,
                name=p.name,
                brand=p.brand,
                category=p.category,
                image_url=p.image_url,
                lowest_price=best.current_price,
                best_platform=best.platform,
            ))
    return results


@router.get("/{product_id}/compare", response_model=ProductOut)
def compare_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get full platform comparison for a product.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/{product_id}/history", response_model=List[PriceHistoryPoint])
def price_history(
    product_id: int,
    platform: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Get 12-month price history for trend chart.
    """
    query = (
        db.query(PriceHistory)
        .join(ProductListing, PriceHistory.listing_id == ProductListing.id)
        .filter(ProductListing.product_id == product_id)
    )
    if platform:
        query = query.filter(ProductListing.platform == platform)
    history = query.order_by(PriceHistory.recorded_at).all()
    return [
        PriceHistoryPoint(
            platform=h.listing.platform,
            price=h.price,
            recorded_at=h.recorded_at,
        )
        for h in history
    ]
