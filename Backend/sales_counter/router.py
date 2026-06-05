from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from database import get_db
from .schema import SaleCreate, SaleResponse
from .service import get_pos_products, create_sale
from .model import Sale
from inventory.schema import ProductResponse

router = APIRouter(prefix="/sales", tags=["POS & Sales"])

@router.get("/pos-products/", response_model=List[ProductResponse])
def list_pos_products(search: str = None, db: Session = Depends(get_db)):
    """Get products that have stock at the counter"""
    return get_pos_products(db, search=search)

@router.post("/", response_model=SaleResponse)
def checkout(sale_data: SaleCreate, db: Session = Depends(get_db)):
    """Process a new sale and deduct counter stock"""
    try:
        return create_sale(db, sale_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Failed to process sale")

# ─── ADDED: Sales Report Endpoint ───
@router.get("/", response_model=List[SaleResponse])
def get_sales_report(
    date_from: str = Query(None, alias="date_from"),
    date_to: str = Query(None, alias="date_to"),
    db: Session = Depends(get_db)
):
    """Fetch counter sales for reporting"""
    query = db.query(Sale)
    
    if date_from:
        query = query.filter(Sale.created_at >= date_from)
    if date_to:
        # Add 1 day to date_to to make the filter inclusive of the entire end date
        end_date = (datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
        query = query.filter(Sale.created_at < end_date)
        
    return query.order_by(Sale.created_at.desc()).all()