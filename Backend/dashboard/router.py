from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db  # Your existing db dependency
from . import service, schema

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/", response_model=schema.DashboardResponse)
def fetch_dashboard_data(
    company_id: Optional[int] = Query(None, description="Filter by Company ID"),
    date: Optional[str] = Query(None, description="Target date YYYY-MM-DD"), # ← ADDED
    db: Session = Depends(get_db)
):
    """
    Fetch aggregated dashboard data:
    - Stats (Today/Monthly Sales, Purchases, Expenses, Counts)
    - Last 7 Days Sales & Purchases chart data
    - Inventory by Category pie chart data
    - Expense breakdown by category
    - Recent Sales list
    - Recent Purchases list
    - Low Stock Alerts list
    """
    if not company_id:
        raise HTTPException(
            status_code=400,
            detail="company_id query parameter is required"
        )
    return service.get_dashboard_data(db, company_id=company_id, target_date_str=date)