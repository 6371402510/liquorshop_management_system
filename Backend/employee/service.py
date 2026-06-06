# employees/service.py

from sqlalchemy.orm import Session
from sqlalchemy import or_
from .model import Employee
from .schema import EmployeeCreate, EmployeeUpdate

def get_employees(db: Session, company_id: int, search: str = None, department: str = None):  # ← ADDED company_id
    query = db.query(Employee).filter(Employee.company_id == company_id)  # ← ADDED FILTER
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Employee.first_name.ilike(search_term),
                Employee.last_name.ilike(search_term),
                Employee.employee_code.ilike(search_term),
                Employee.phone.ilike(search_term)
            )
        )
    
    if department and department != "ALL":
        query = query.filter(Employee.department == department.upper())
        
    return query.order_by(Employee.first_name).all()

def get_employee(db: Session, employee_id: int, company_id: int):  # ← ADDED company_id
    return db.query(Employee).filter(Employee.id == employee_id, Employee.company_id == company_id).first()

def create_employee(db: Session, employee_data: EmployeeCreate):
    db_employee = Employee(**employee_data.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, employee_id: int, employee_data: EmployeeUpdate, company_id: int):  # ← ADDED company_id
    db_employee = db.query(Employee).filter(Employee.id == employee_id, Employee.company_id == company_id).first()
    if not db_employee:
        return None
    
    update_data = employee_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_employee, key, value)
        
    db.commit()
    db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: int, company_id: int):  # ← ADDED company_id
    db_employee = db.query(Employee).filter(Employee.id == employee_id, Employee.company_id == company_id).first()
    if not db_employee:
        return False
    
    db.delete(db_employee)
    db.commit()
    return True