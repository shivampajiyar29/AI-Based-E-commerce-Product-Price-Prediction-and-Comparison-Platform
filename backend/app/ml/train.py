"""
PriceSense — ML Training Pipeline
==================================
Run: python -m app.ml.train

Trains Linear Regression, Random Forest, and XGBoost on product data.
Saves the best model (XGBoost) and all encoders to disk.
Prints comparison of all model metrics.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from xgboost import XGBRegressor

MODEL_DIR = "app/ml/saved_models"
os.makedirs(MODEL_DIR, exist_ok=True)


# ── 1. Load / Generate training data ──────────────────────────────────────────
def load_data() -> pd.DataFrame:
    """
    In production: load from PostgreSQL using SQLAlchemy.
    Here we generate synthetic data that mirrors real e-commerce patterns.
    """
    np.random.seed(42)
    n = 10000

    brands = [
        "Apple", "Samsung", "Sony", "Boat", "OnePlus", "Realme", "LG", "Philips", 
        "Bose", "JBL", "Lenovo", "Acer", "Fossil", "Marshall", "Sennheiser",
        "Google", "Microsoft", "HP", "Dell", "Asus", "MSI", "Xiaomi", "Amazfit", 
        "Noise", "Boult", "Canon", "Nikon", "GoPro", "Nothing", "Motorola"
    ]
    categories = [
        "Smartphones", "Laptops", "Headphones", "Tablets", "Earbuds", 
        "Speakers", "Smartwatches", "Monitors", "Cameras", "Gaming Consoles", "Smart Home"
    ]
    platforms = ["amazon", "flipkart", "meesho", "myntra"]

    brand_multiplier = {
        "Apple": 1.9, "Samsung": 1.5, "Sony": 1.45, "Bose": 1.65, "Google": 1.55,
        "Microsoft": 1.5, "HP": 1.2, "Dell": 1.25, "Asus": 1.15, "MSI": 1.4,
        "OnePlus": 1.25, "LG": 1.1, "Philips": 1.0, "Canon": 1.6, "Nikon": 1.55,
        "GoPro": 1.35, "Boat": 0.65, "Realme": 0.8, "JBL": 1.15, "Xiaomi": 0.85,
        "Nothing": 1.1, "Motorola": 0.95, "Lenovo": 1.1, "Acer": 0.9, 
        "Fossil": 1.05, "Marshall": 1.4, "Sennheiser": 1.45, "Noise": 0.6, "Boult": 0.55, "Amazfit": 0.85
    }
    category_base = {
        "Smartphones": 45000, "Laptops": 80000, "Headphones": 12000,
        "Tablets": 35000, "Earbuds": 5000, "Speakers": 8000, "Smartwatches": 15000,
        "Monitors": 18000, "Cameras": 60000, "Gaming Consoles": 45000, "Smart Home": 4000
    }

    data = []
    for _ in range(n):
        brand = np.random.choice(brands)
        category = np.random.choice(categories)
        platform = np.random.choice(platforms)
        
        # More realistic ratings: better brands tend to have higher ratings
        rating_base = 4.0 if brand in ["Apple", "Sony", "Bose", "Google", "Samsung"] else 3.5
        rating = round(np.random.normal(rating_base, 0.4), 1)
        rating = max(1.0, min(5.0, rating))
        
        review_count = int(np.random.exponential(8000))
        discount_pct = round(np.random.uniform(5, 60), 1)
        
        # New Feature: Is Latest Model
        is_latest = 1 if np.random.random() > 0.7 else 0
        latest_multiplier = 1.2 if is_latest else 1.0

        base = category_base[category] * brand_multiplier[brand] * latest_multiplier
        noise = np.random.normal(0, base * 0.05) # Reduced noise for more precision
        
        # Platform pricing tendency
        platform_adj = {"amazon": 1.04, "flipkart": 0.98, "meesho": 1.01, "myntra": 1.06}
        
        fair_price = base + noise
        actual_price = fair_price * platform_adj[platform]
        actual_price = max(actual_price, 499)
        
        # New Feature: Customer Value Score (Higher is better)
        # Value = (Rating / 5) * (1 + Discount/100) / (Price / Category Mean)
        # We'll use a simplified version:
        value_score = (rating * 2) + (discount_pct / 10) + (10 if is_latest else 0)

        data.append({
            "brand": brand,
            "category": category,
            "platform": platform,
            "rating": rating,
            "review_count": review_count,
            "discount_percent": discount_pct,
            "is_latest_model": is_latest,
            "customer_value_score": round(value_score, 2),
            "fair_price": round(fair_price, 2),
            "actual_price": round(actual_price, 2),
        })

    return pd.DataFrame(data)


# ── 2. Preprocess ─────────────────────────────────────────────────────────────
def preprocess(df: pd.DataFrame):
    le_brand    = LabelEncoder()
    le_category = LabelEncoder()
    le_platform = LabelEncoder()

    df["brand_enc"]    = le_brand.fit_transform(df["brand"])
    df["category_enc"] = le_category.fit_transform(df["category"])
    df["platform_enc"] = le_platform.fit_transform(df["platform"])

    features = [
        "brand_enc", "category_enc", "platform_enc",
        "rating", "review_count", "discount_percent",
        "is_latest_model", "customer_value_score"
    ]
    target = "fair_price"

    X = df[features].values
    y = df[target].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    encoders = {
        "brand": le_brand,
        "category": le_category,
        "platform": le_platform,
    }
    return X_scaled, y, scaler, encoders


# ── 3. Train & evaluate ───────────────────────────────────────────────────────
def train_and_evaluate(X_scaled, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    models = {
        "linear_regression": LinearRegression(),
        "random_forest": RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1),
        "xgboost": XGBRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbosity=0,
        ),
    }

    results = {}
    trained = {}

    print("\n" + "="*55)
    print("  PriceSense — Model Training Results")
    print("="*55)

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        r2   = round(r2_score(y_test, preds), 4)
        mae  = round(mean_absolute_error(y_test, preds), 2)
        rmse = round(np.sqrt(mean_squared_error(y_test, preds)), 2)

        results[name] = {"r2": r2, "mae": mae, "rmse": rmse}
        trained[name] = model

        print(f"\n  {name.replace('_', ' ').title()}")
        print(f"    R²   : {r2}")
        print(f"    MAE  : Rs.{mae:,.0f}")
        print(f"    RMSE : Rs.{rmse:,.0f}")

    print("\n" + "="*55)
    best_name = max(results, key=lambda k: results[k]["r2"])
    print(f"\n  Best model: {best_name} (R² = {results[best_name]['r2']})")
    print("="*55 + "\n")

    return trained, results, best_name


# ── 4. Save ───────────────────────────────────────────────────────────────────
def save_artifacts(trained, scaler, encoders, results, best_name):
    for name, model in trained.items():
        joblib.dump(model, f"{MODEL_DIR}/{name}.pkl")

    joblib.dump(scaler,   f"{MODEL_DIR}/scaler.pkl")
    joblib.dump(encoders, f"{MODEL_DIR}/encoders.pkl")

    with open(f"{MODEL_DIR}/metrics.json", "w") as f:
        json.dump({"results": results, "best_model": best_name}, f, indent=2)

    print(f"  All models saved to {MODEL_DIR}/")


# ── 5. Entry point ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\nLoading data...")
    df = load_data()
    print(f"Dataset: {len(df)} rows, {df['category'].nunique()} categories, {df['brand'].nunique()} brands")

    print("Preprocessing...")
    X_scaled, y, scaler, encoders = preprocess(df)

    print("Training models (this may take ~30 seconds)...")
    trained, results, best_name = train_and_evaluate(X_scaled, y)

    save_artifacts(trained, scaler, encoders, results, best_name)
    print("Done! Run the API server with: uvicorn app.main:app --reload\n")
