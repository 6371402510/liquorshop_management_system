from sqlalchemy.orm import Session
from .model import Sale, SaleItem
from inventory.model import Product # Import Product to deduct counter stock

def get_pos_products(db: Session, search: str = None):
    # ONLY get products that have stock at the counter
    query = db.query(Product).filter(Product.is_active == True, Product.counter_stock > 0)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_term)) | 
            (Product.barcode.ilike(search_term))
        )
    return query.all()

def create_sale(db: Session, sale_data: SaleCreate):
    # 1. Create the Sale header
    sale_dict = sale_data.model_dump(exclude={"items"})
    db_sale = Sale(**sale_dict)
    db.add(db_sale)
    db.flush() # Get the sale ID
    
    # 2. Process each item
    for item_data in sale_data.items:
        item_dict = item_data.model_dump()
        db_item = SaleItem(**item_dict, sale_id=db_sale.id)
        db.add(db_item)
        
        # 3. DEDUCT FROM COUNTER STOCK
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