from sqlalchemy.orm import Session
from fastapi import HTTPException
from .model import Attendance
from .schema import AttendanceCreate, AttendanceUpdate, AttendanceResponse
from sqlalchemy import func
from .schema import MonthlyReportResponse
from typing import Optional, List


# Import the Employee model to perform the join
# Adjust the import path based on your project structure (e.g., from ..employees.model import Employee)
from employee.model import Employee 

def get_attendance(db: Session, date: str = None):
    # Query Attendance and join with Employee to get name and code
    query = db.query(Attendance, Employee.first_name, Employee.last_name, Employee.employee_code)\
              .join(Employee, Attendance.employee_id == Employee.id)
    
    # Filter by date if provided
    if date:
        query = query.filter(Attendance.date == date)
        
    results = query.order_by(Attendance.check_in_time).all()
    
    # Construct response with joined employee data
    response_data = []
    for record, first_name, last_name, code in results:
        resp = AttendanceResponse.model_validate(record)
        resp.employee_name = f"{first_name} {last_name}"
        resp.employee_code = code
        response_data.append(resp)
        
    return response_data

def get_attendance_record(db: Session, attendance_id: int):
    result = db.query(Attendance, Employee.first_name, Employee.last_name, Employee.employee_code)\
              .join(Employee, Attendance.employee_id == Employee.id)\
              .filter(Attendance.id == attendance_id).first()
              
    if not result:
        return None
        
    record, first_name, last_name, code = result
    resp = AttendanceResponse.model_validate(record)
    resp.employee_name = f"{first_name} {last_name}"
    resp.employee_code = code
    return resp

def create_attendance(db: Session, attendance_data: AttendanceCreate):
    # Check if attendance is already marked for this employee on this date
    existing = db.query(Attendance).filter(
        Attendance.employee_id == attendance_data.employee_id,
        Attendance.date == attendance_data.date
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"Attendance already marked for employee {attendance_data.employee_id} on {attendance_data.date}"
        )
    
    db_record = Attendance(**attendance_data.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    # Return using the join helper to include employee details
    return get_attendance_record(db, db_record.id)

def update_attendance(db: Session, attendance_id: int, attendance_data: AttendanceUpdate):
    db_record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not db_record:
        return None
    
    update_data = attendance_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)
        
    db.commit()
    db.refresh(db_record)
    
    # Return using the join helper to include employee details
    return get_attendance_record(db, db_record.id)

def delete_attendance(db: Session, attendance_id: int):
    db_record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not db_record:
        return False
    
    db.delete(db_record)
    db.commit()
    return True

def get_monthly_report(db: Session, month: str):
    query = db.query(
        Attendance.employee_id,
        Attendance.status,
        func.count(Attendance.id).label('count')
    ).filter(
        Attendance.date.like(f"{month}%")
    ).group_by(
        Attendance.employee_id,
        Attendance.status
    ).all()
    
    employee_data = {}
    for row in query:
        if row.employee_id not in employee_data:
            employee_data[row.employee_id] = {
                "present_days": 0, "paid_leave_days": 0, "unpaid_leave_days": 0, "half_days": 0
            }
        
        status_map = {
            "PRESENT": "present_days",
            "PAID_LEAVE": "paid_leave_days",
            "UNPAID_LEAVE": "unpaid_leave_days",
            "HALF_DAY": "half_days"
        }
        field = status_map.get(row.status)
        if field:
            employee_data[row.employee_id][field] = row.count
            
    employees = db.query(Employee).all()
    emp_map = {e.id: e for e in employees}
    
    report = []
    for emp_id, counts in employee_data.items():
        emp = emp_map.get(emp_id)
        if emp:
            # Working Days = Present + Paid Leave + (Half Day / 2)
            working_days = counts["present_days"] + counts["paid_leave_days"] + (counts["half_days"] / 2.0)
            report.append(MonthlyReportResponse(
                employee_id=emp_id,
                employee_name=f"{emp.first_name} {emp.last_name}",
                employee_code=emp.employee_code,
                department=emp.department,
                total_working_days=working_days,
                **counts
            ))
            
    for emp_id, emp in emp_map.items():
        if emp_id not in employee_data:
            report.append(MonthlyReportResponse(
                employee_id=emp_id,
                employee_name=f"{emp.first_name} {emp.last_name}",
                employee_code=emp.employee_code,
                department=emp.department
            ))
            
    return report


def get_employee_attendance_report(db: Session, employee_id: int, start_date: Optional[str] = None, end_date: Optional[str] = None):
    query = db.query(Attendance, Employee.first_name, Employee.last_name, Employee.employee_code)\
              .join(Employee, Attendance.employee_id == Employee.id)\
              .filter(Attendance.employee_id == employee_id)
    
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)
        
    results = query.order_by(Attendance.date).all()
    
    response_data = []
    for record, first_name, last_name, code in results:
        resp = AttendanceResponse.model_validate(record)
        resp.employee_name = f"{first_name} {last_name}"
        resp.employee_code = code
        response_data.append(resp)
        
    return response_data