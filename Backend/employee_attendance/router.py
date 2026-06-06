# attendance/router.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from .schema import AttendanceCreate, AttendanceUpdate, AttendanceResponse, MonthlyReportResponse
from .service import (
    get_attendance, get_attendance_record, create_attendance, 
    update_attendance, delete_attendance, get_monthly_report, get_employee_attendance_report
)

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)

@router.get("/", response_model=List[AttendanceResponse])
def list_attendance(
    company_id: int = Query(..., description="Company ID is required"),  # ← ADDED
    date: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    return get_attendance(db, company_id=company_id, date=date)

@router.get("/{attendance_id}", response_model=AttendanceResponse)
def read_attendance(
    attendance_id: int, 
    company_id: int = Query(..., description="Company ID"),  # ← ADDED
    db: Session = Depends(get_db)
):
    record = get_attendance_record(db, attendance_id, company_id)
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return record

@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_new_attendance(attendance_data: AttendanceCreate, db: Session = Depends(get_db)):
    try:
        return create_attendance(db, attendance_data)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to mark attendance: {str(e)}")

@router.put("/{attendance_id}", response_model=AttendanceResponse)
def update_existing_attendance(
    attendance_id: int, 
    attendance_data: AttendanceUpdate, 
    company_id: int = Query(..., description="Company ID"),  # ← ADDED
    db: Session = Depends(get_db)
):
    record = update_attendance(db, attendance_id, attendance_data, company_id)
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found or update failed")
    return record

@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_attendance(
    attendance_id: int, 
    company_id: int = Query(..., description="Company ID"),  # ← ADDED
    db: Session = Depends(get_db)
):
    success = delete_attendance(db, attendance_id, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return

@router.get("/report/monthly", response_model=List[MonthlyReportResponse])
def monthly_attendance_report(
    month: str, 
    company_id: int = Query(..., description="Company ID is required"),  # ← ADDED
    db: Session = Depends(get_db)
):
    return get_monthly_report(db, month, company_id)

@router.get("/report/employee", response_model=List[AttendanceResponse])
def employee_attendance_report(
    employee_id: int, 
    company_id: int = Query(..., description="Company ID is required"),  # ← ADDED
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    return get_employee_attendance_report(db, employee_id, company_id, start_date, end_date)