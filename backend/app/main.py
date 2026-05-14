from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import products, predict, analytics, users, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PriceSense API",
    description="AI-powered e-commerce price intelligence platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://pricesense.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",      tags=["Auth"])
app.include_router(products.router,  prefix="/api/products",  tags=["Products"])
app.include_router(predict.router,   prefix="/api/predict",   tags=["Prediction"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(users.router,     prefix="/api/users",     tags=["Users"])

@app.get("/")
def root():
    return {"message": "PriceSense API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}
