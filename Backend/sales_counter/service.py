from sqlalchemy.orm import Session
from .model import Sale, SaleItem
from inventory.model import Product
from datetime import datetime, timedelta

def get_pos_products(db: Session, company_id: int | None = None, search: str = None):
    query = db.query(Product).filter(Product.is_active == True, Product.counter_stock > 0)
    
    # ─── ADDED COMPANY FILTER ───
    if company_id is not None:
        query = query.filter(Product.company_id == company_id)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_term)) | 
            (Product.barcode.ilike(search_term))
        )
    return query.all()

def create_sale(db: Session, sale_data: SaleCreate):
    sale_dict = sale_data.model_dump(exclude={"items"})
    db_sale = Sale(**sale_dict)
    db.add(db_sale)
    db.flush()
    
    for item_data in sale_data.items:
        item_dict = item_data.model_dump()
        
        # ─── ADDED: Inherit company_id from parent sale ───
        item_dict["company_id"] = db_sale.company_id
        
        db_item = SaleItem(**item_dict, sale_id=db_sale.id)
        db.add(db_item)
        
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if product:
            if (product.counter_stock or 0) < item_data.quantity:
                raise ValueError(f"Not enough counter stock for {product.name}")
            
            product.counter_stock -= item_data.quantity
            product.current_stock = (product.godown_stock or 0) + (product.counter_stock or 0)
            db.add(product)
            
    db.commit()
    db.refresh(db_sale)
    return db_sale

# ─── EXTRACTED SERVICE FUNCTION ───
def get_sales_report_service(db: Session, company_id: int | None = None, date_from: str = None, date_to: str = None):
    query = db.query(Sale)
    
    # ─── ADDED COMPANY FILTER ───
    if company_id is not None:
        query = query.filter(Sale.company_id == company_id)
    
    if date_from:
        query = query.filter(Sale.created_at >= date_from)
    if date_to:
        end_date = (datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
        query = query.filter(Sale.created_at < end_date)
        
    return query.order_by(Sale.created_at.desc()).all()