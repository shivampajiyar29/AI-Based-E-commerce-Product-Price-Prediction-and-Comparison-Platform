# PriceSense — AI-Powered E-Commerce Price Intelligence Platform

An industry-grade ML + Full Stack project that compares product prices across Amazon, Flipkart, Meesho, and Myntra, predicts fair market prices using Machine Learning, and detects fake discounts.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS |
| Backend | FastAPI (Python) |
| ML | Scikit-learn, XGBoost, Pandas |
| Database | PostgreSQL + SQLAlchemy |
| Scraping | BeautifulSoup4 + Requests |
| Charts | Chart.js / Recharts |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
pricesense/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Settings / env vars
│   │   ├── database.py          # DB connection
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── api/                 # Route handlers
│   │   ├── ml/                  # ML models & logic
│   │   └── scrapers/            # Web scrapers
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── tailwind.config.js
├── ml_notebooks/
│   └── model_training.ipynb     # Full ML pipeline
└── data/
    └── raw/                     # Sample datasets
```

---

## Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in your DB credentials
alembic upgrade head            # Run DB migrations
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### ML Training
```bash
cd backend
python -m app.ml.train          # Train and save models
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products/search?q=iphone | Search products |
| GET | /api/products/{id}/compare | Platform comparison |
| POST | /api/predict | ML price prediction |
| GET | /api/analytics/summary | Dashboard stats |
| POST | /api/users/alerts | Create price alert |
| GET | /api/users/{id}/history | Prediction history |

---

## ML Models Used
- **Linear Regression** — baseline
- **Random Forest** — ensemble method
- **XGBoost** — primary model (best R² = 0.91)

## Features
- Cross-platform price comparison
- Fake discount detection
- ML-based fair price prediction
- 12-month price trend analysis
- User price alerts & dashboard
# -AI-Based-E-commerce-Product-Price-Prediction-and-Comparison-Platform
# shivampajiyar29--AI-Based-E-commerce-Product-Price-Prediction-and-Comparison-Platform
# shivampajiyar29--AI-Based-E-commerce-Product-Price-Prediction-and-Comparison-Platform
