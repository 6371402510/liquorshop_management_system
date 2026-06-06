from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from .schema import GodownCheckoutRequest, GodownSaleResponse, GodownProductResponse
from .service import get_godown_products, process_godown_checkout
from .model import GodownSale

router = APIRouter(
    prefix="/api/godown",
    tags=["Godown POS"]
)

@router.get("/products", response_model=list[GodownProductResponse])
def get_products(
    company_id: int | None = None, # ─── ADDED
    search: str = Query("", alias="search"),
    db: Session = Depends(get_db)
):
    return get_godown_products(db, company_id=company_id, search=search)

@router.post("/checkout", response_model=GodownSaleResponse)
def process_checkout(
    checkout_data: GodownCheckoutRequest,
    db: Session = Depends(get_db)
):
    return process_godown_checkout(db, checkout_data)

@router.get("/sales", response_model=list[GodownSaleResponse])
def get_godown_sales_report(
    company_id: int | None = None, # ─── ADDED
    date_from: str = Query(None, alias="date_from"),
    date_to: str = Query(None, alias="date_to"),
    db: Session = Depends(get_db)
):
    """Fetch godown sales for reporting"""
    query = db.query(GodownSale)
    
    # ─── ADDED COMPANY FILTER ───
    if company_id is not None:
        query = query.filter(GodownSale.company_id == company_id)
    
    if date_from:
        query = query.filter(GodownSale.created_at >= date_from)
    if date_to:
        end_date = (datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
        query = query.filter(GodownSale.created_at < end_date)
        
    return query.order_by(GodownSale.created_at.desc()).all()