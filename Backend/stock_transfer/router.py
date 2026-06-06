from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db

from .schema import StockTransferCreate, StockTransferResponse, TransferItemResponse
from .service import get_transfers, create_transfer
from .model import StockTransferItem

router = APIRouter(prefix="/stock-transfers", tags=["Stock Transfers"])

@router.get("/", response_model=List[StockTransferResponse])
def list_transfers(
    company_id: int | None = None, # ─── ADDED
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return get_transfers(db, company_id=company_id, skip=skip, limit=limit)

@router.get("/{transfer_id}/items", response_model=List[TransferItemResponse])
def get_transfer_items(transfer_id: int, db: Session = Depends(get_db)):
    items = db.query(StockTransferItem).filter(StockTransferItem.transfer_id == transfer_id).all()
    if not items:
        raise HTTPException(status_code=404, detail="Transfer items not found")
    return items

@router.post("/", response_model=StockTransferResponse, status_code=status.HTTP_201_CREATED)
def create_new_transfer(transfer_data: StockTransferCreate, db: Session = Depends(get_db)):
    try:
        return create_transfer(db, transfer_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Failed to create transfer")