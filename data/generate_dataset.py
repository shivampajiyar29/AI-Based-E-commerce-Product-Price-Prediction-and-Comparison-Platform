"""
Generate sample CSV dataset for training / testing.
Run: python data/generate_dataset.py
Outputs: data/raw/products.csv
"""

import os
import numpy as np
import pandas as pd

np.random.seed(42)
N = 5000

BRANDS     = ["Apple","Samsung","Sony","Boat","OnePlus","Realme","LG","Philips","Bose","JBL"]
CATEGORIES = ["Smartphones","Laptops","Headphones","Tablets","Earbuds","Speakers","Smartwatches"]
PLATFORMS  = ["amazon","flipkart","meesho","myntra"]

BRAND_MUL = {"Apple":1.8,"Samsung":1.5,"Sony":1.4,"Bose":1.6,"OnePlus":1.2,
             "LG":1.1,"Philips":1.0,"Boat":0.7,"Realme":0.8,"JBL":1.15}
CAT_BASE  = {"Smartphones":40000,"Laptops":75000,"Headphones":8000,
             "Tablets":30000,"Earbuds":4000,"Speakers":6000,"Smartwatches":12000}
PLAT_ADJ  = {"amazon":1.05,"flipkart":0.97,"meesho":1.02,"myntra":1.07}

rows = []
for i in range(N):
    brand    = np.random.choice(BRANDS)
    category = np.random.choice(CATEGORIES)
    platform = np.random.choice(PLATFORMS)
    rating   = round(np.random.uniform(2.5, 5.0), 1)
    reviews  = int(np.random.exponential(5000))
    discount = round(np.random.uniform(0, 50), 1)
    base     = CAT_BASE[category] * BRAND_MUL[brand]
    noise    = np.random.normal(0, base * 0.08)
    fair     = max(base + noise, 500)
    actual   = fair * PLAT_ADJ[platform]
    rows.append({
        "id": i + 1,
        "brand": brand,
        "category": category,
        "platform": platform,
        "rating": rating,
        "review_count": reviews,
        "discount_percent": discount,
        "fair_price": round(fair, 2),
        "actual_price": round(actual, 2),
    })

os.makedirs("data/raw", exist_ok=True)
df = pd.DataFrame(rows)
df.to_csv("data/raw/products.csv", index=False)
print(f"Dataset saved: data/raw/products.csv ({len(df)} rows)")
print(df.describe())
