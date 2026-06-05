from sqlalchemy.orm import Session
from .model import StockTransfer, StockTransferItem
from inventory.model import Product # <--- FIX: Changed to absolute import

def get_transfers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(StockTransfer).order_by(StockTransfer.created_at.desc()).offset(skip).limit(limit).all()

def create_transfer(db: Session, transfer_data: StockTransferCreate):
    items_data = transfer_data.items
    transfer_dict = transfer_data.model_dump(exclude={"items"})
    
    db_transfer = StockTransfer(**transfer_dict)
    db.add(db_transfer)
    db.flush() # Flush to get the transfer ID
    
    for item_data in items_data:
        item_dict = item_data.model_dump()
        db_item = StockTransferItem(**item_dict, transfer_id=db_transfer.id)
        db.add(db_item)
        
        # --- CORE LOGIC: Move stock from Godown to Counter ---
        product = db.query(Product).filter(Product.id == item_dict['product_id']).first()
        if product:
            if (product.godown_stock or 0) < item_dict['quantity']:
                raise ValueError(f"Not enough godown stock for {product.name}")
            
            # Deduct from Godown
            product.godown_stock = (product.godown_stock or 0) - item_dict['quantity']
            # Add to Counter
            product.counter_stock = (product.counter_stock or 0) + item_dict['quantity']
            # Update Total
            product.current_stock = (product.godown_stock or 0) + (product.counter_stock or 0)
            db.add(product)
            
    db.commit()
    db.refresh(db_transfer)
    return db_transfer