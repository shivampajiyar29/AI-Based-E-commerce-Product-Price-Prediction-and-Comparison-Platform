from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import PredictionRequest, PredictionResponse
from app.ml.predictor import PricePredictor

router = APIRouter()
predictor = PricePredictor()


@router.post("/", response_model=PredictionResponse)
def predict_price(payload: PredictionRequest, db: Session = Depends(get_db)):
    """
    Run ML inference to predict fair market price.
    Returns prediction, status, best platform, and fake-discount flag.
    """
    result = predictor.predict(payload.dict())
    return result


@router.post("/batch")
def batch_predict(payloads: list[PredictionRequest], db: Session = Depends(get_db)):
    """
    Batch prediction for multiple products at once.
    """
    return [predictor.predict(p.dict()) for p in payloads]
