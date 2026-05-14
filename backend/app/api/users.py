from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import User, PriceAlert, SavedProduct, Prediction
from app.schemas.schemas import AlertCreate, AlertOut

router = APIRouter()


@router.get("/{user_id}/alerts", response_model=List[AlertOut])
def get_alerts(user_id: int, db: Session = Depends(get_db)):
    return db.query(PriceAlert).filter(PriceAlert.user_id == user_id).all()


@router.post("/{user_id}/alerts", response_model=AlertOut, status_code=201)
def create_alert(user_id: int, payload: AlertCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    alert = PriceAlert(user_id=user_id, **payload.dict())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.delete("/{user_id}/alerts/{alert_id}", status_code=204)
def delete_alert(user_id: int, alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(PriceAlert).filter(
        PriceAlert.id == alert_id, PriceAlert.user_id == user_id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()


@router.get("/{user_id}/saved")
def get_saved_products(user_id: int, db: Session = Depends(get_db)):
    saved = db.query(SavedProduct).filter(SavedProduct.user_id == user_id).all()
    return saved


@router.post("/{user_id}/saved/{product_id}", status_code=201)
def save_product(user_id: int, product_id: int, db: Session = Depends(get_db)):
    existing = db.query(SavedProduct).filter(
        SavedProduct.user_id == user_id,
        SavedProduct.product_id == product_id,
    ).first()
    if existing:
        return {"message": "Already saved"}
    item = SavedProduct(user_id=user_id, product_id=product_id)
    db.add(item)
    db.commit()
    return {"message": "Saved"}


@router.get("/{user_id}/history")
def prediction_history(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .limit(20)
        .all()
    )
