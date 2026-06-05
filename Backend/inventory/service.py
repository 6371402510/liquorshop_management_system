from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from inventory.model import Product
from inventory.schema import ProductCreate, ProductUpdate

def get_products(db: Session, skip: int = 0, limit: int = 1000):
    return db.query(Product).filter(Product.is_active == True).order_by(Product.name).offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def create_product(db: Session, product_data: ProductCreate):
    # FIX: by_alias=False ensures it uses 'vat_rate' instead of 'VAT_rate' for SQLAlchemy
    product_dict = product_data.model_dump(by_alias=False)
    
    db_product = Product(**product_dict)
    
    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        return None

def update_product(db: Session, product_id: int, product_data: ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    # FIX: by_alias=False ensures it uses 'vat_rate' instead of 'VAT_rate' for SQLAlchemy
    update_data = product_data.model_dump(exclude_unset=True, by_alias=False)
    
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    try:
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        return None

def soft_delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return False
    
    db_product.is_active = False
    db_product.status = "INACTIVE"
    db.commit()
    return True