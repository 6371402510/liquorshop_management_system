from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .model import Supplier
from .schema import SupplierCreate, SupplierUpdate

def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Supplier).filter(Supplier.is_active == True).order_by(Supplier.name).offset(skip).limit(limit).all()

def get_supplier(db: Session, supplier_id: int):
    return db.query(Supplier).filter(Supplier.id == supplier_id).first()

def create_supplier(db: Session, supplier_data: SupplierCreate):
    supplier_dict = supplier_data.model_dump()
    db_supplier = Supplier(**supplier_dict)
    
    try:
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier
    except IntegrityError:
        db.rollback()
        return None

def update_supplier(db: Session, supplier_id: int, supplier_data: SupplierUpdate):
    db_supplier = get_supplier(db, supplier_id)
    if not db_supplier:
        return None
    
    update_data = supplier_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_supplier, key, value)
        
    try:
        db.commit()
        db.refresh(db_supplier)
        return db_supplier
    except IntegrityError:
        db.rollback()
        return None

def soft_delete_supplier(db: Session, supplier_id: int):
    db_supplier = get_supplier(db, supplier_id)
    if not db_supplier:
        return False
    
    db_supplier.is_active = False
    db.commit()
    return True