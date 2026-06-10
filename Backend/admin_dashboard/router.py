from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from . import service, schema

router = APIRouter(
    prefix="/operations-dashboard",
    tags=["Operations Dashboard"]
)

@router.get("/", response_model=schema.OperationsDashboardResponse)
def fetch_operations_dashboard(
    date_from: Optional[str] = Query(None, description="YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """
    Fetch aggregated operational data across ALL companies (stores).
    Defaults to the current month if no dates are provided.
    """
    return service.get_operations_dashboard_data(db, date_from, date_to)