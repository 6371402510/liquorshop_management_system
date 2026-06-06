from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, and_
from typing import Optional

# Import your existing models
from expenses.model import Expense, ExpenseCategory
from employee.model import Employee
from inventory.model import Product
from purchases.model import Purchase, PurchaseItem
from sales_counter.model import Sale, SaleItem
from supplier.model import Supplier  # Adjust import path if needed
from sales_godown.model import GodownSale, GodownSaleItem  # ← ADDED


from . import schema


def get_dashboard_data(db: Session, company_id: Optional[int] = None):
    # ─── Time Boundaries ───
    today_start = datetime.combine(datetime.now().date(), datetime.min.time())
    month_start = datetime.now() - timedelta(days=30)
    seven_days_ago = datetime.now() - timedelta(days=6)

    # ─── Safe Company Filter Helper ───
    def company_filter(model):
        if company_id and hasattr(model, 'company_id'):
            return model.company_id == company_id
        return True

    # ═══════════════════════════════════════
    # 1. STATS (Combined Counter + Godown)
    # ═══════════════════════════════════════

    # Today's Counter Sales
    today_counter_data = db.query(
        func.coalesce(func.sum(Sale.total_amount), 0),
        func.count(Sale.id)
    ).filter(
        and_(Sale.created_at >= today_start, company_filter(Sale))
    ).first()

    # Today's Godown Sales
    today_godown_data = db.query(
        func.coalesce(func.sum(GodownSale.total_amount), 0),
        func.count(GodownSale.id)
    ).filter(
        and_(GodownSale.created_at >= today_start, company_filter(GodownSale))
    ).first()

    today_sales = float(today_counter_data[0] or 0) + float(today_godown_data[0] or 0)
    today_orders = (today_counter_data[1] or 0) + (today_godown_data[1] or 0)

    # Monthly Counter Sales
    month_counter_sales = db.query(
        func.coalesce(func.sum(Sale.total_amount), 0)
    ).filter(
        and_(Sale.created_at >= month_start, company_filter(Sale))
    ).scalar()

    # Monthly Godown Sales
    month_godown_sales = db.query(
        func.coalesce(func.sum(GodownSale.total_amount), 0)
    ).filter(
        and_(GodownSale.created_at >= month_start, company_filter(GodownSale))
    ).scalar()

    month_sales = float(month_counter_sales or 0) + float(month_godown_sales or 0)

    # Monthly Purchases
    month_purchases = db.query(
        func.coalesce(func.sum(Purchase.total_amount), 0)
    ).filter(
        and_(Purchase.created_at >= month_start, company_filter(Purchase))
    ).scalar()

    # Monthly Expenses
    month_expenses = db.query(
        func.coalesce(func.sum(Expense.amount), 0)
    ).filter(
        and_(Expense.expense_date >= month_start.date(), company_filter(Expense))
    ).scalar()

    # Total Products
    total_products = db.query(func.count(Product.id)).filter(company_filter(Product)).scalar()

    # Low Stock Count
    low_stock_count = db.query(func.count(Product.id)).filter(
        and_(Product.current_stock <= Product.reorder_level, company_filter(Product))
    ).scalar()

    # Total Active Suppliers
    total_suppliers = db.query(func.count(Supplier.id)).filter(
        and_(Supplier.is_active == True, company_filter(Supplier))
    ).scalar()

    # Total Active Employees
    total_employees = db.query(func.count(Employee.id)).filter(
        and_(Employee.status == "ACTIVE", company_filter(Employee))
    ).scalar()

    stats = schema.DashboardStats(
        todaySales=today_sales,
        todayOrders=today_orders,
        monthSales=month_sales,
        monthPurchases=float(month_purchases or 0),
        monthExpenses=float(month_expenses or 0),
        totalProducts=total_products or 0,
        lowStockCount=low_stock_count or 0,
        totalSuppliers=total_suppliers or 0,
        totalEmployees=total_employees or 0,
    )

    # ═══════════════════════════════════════
    # 2. DAILY SALES CHART (Combined)
    # ═══════════════════════════════════════
    
    # Counter Sales grouped by day
    counter_daily_db = db.query(
        cast(Sale.created_at, Date).label('date'),
        func.coalesce(func.sum(Sale.total_amount), 0).label('sales')
    ).filter(
        and_(Sale.created_at >= seven_days_ago, company_filter(Sale))
    ).group_by(cast(Sale.created_at, Date)).all()

    # Godown Sales grouped by day
    godown_daily_db = db.query(
        cast(GodownSale.created_at, Date).label('date'),
        func.coalesce(func.sum(GodownSale.total_amount), 0).label('sales')
    ).filter(
        and_(GodownSale.created_at >= seven_days_ago, company_filter(GodownSale))
    ).group_by(cast(GodownSale.created_at, Date)).all()

    # Merge both dictionaries
    sales_map = {}
    for row in counter_daily_db:
        sales_map[str(row.date)] = float(row.sales)
    for row in godown_daily_db:
        sales_map[str(row.date)] = sales_map.get(str(row.date), 0) + float(row.sales)

    daily_sales_list = []
    for i in range(6, -1, -1):
        date_obj = datetime.now().date() - timedelta(days=i)
        date_str = str(date_obj)
        daily_sales_list.append(schema.DailySale(
            date=date_obj.strftime('%b %d'),
            sales=sales_map.get(date_str, 0)
        ))

    # ═══════════════════════════════════════
    # 3. DAILY PURCHASES CHART
    # ═══════════════════════════════════════
    daily_purchases_db = db.query(
        cast(Purchase.created_at, Date).label('date'),
        func.coalesce(func.sum(Purchase.total_amount), 0).label('purchases')
    ).filter(
        and_(Purchase.created_at >= seven_days_ago, company_filter(Purchase))
    ).group_by(cast(Purchase.created_at, Date)).all()

    purchases_map = {str(row.date): float(row.purchases) for row in daily_purchases_db}
    daily_purchases_list = []
    for i in range(6, -1, -1):
        date_obj = datetime.now().date() - timedelta(days=i)
        date_str = str(date_obj)
        daily_purchases_list.append(schema.DailyPurchase(
            date=date_obj.strftime('%b %d'),
            purchases=purchases_map.get(date_str, 0)
        ))

    # ═══════════════════════════════════════
    # 4. CATEGORY BREAKDOWN (Pie Chart)
    # ═══════════════════════════════════════
    category_data_db = db.query(
        Product.category.label('name'),
        func.count(Product.id).label('value')
    ).filter(company_filter(Product)).group_by(Product.category).all()

    category_data = [
        schema.CategoryData(name=row.name or 'OTHER', value=row.value)
        for row in category_data_db
    ]

    # ═══════════════════════════════════════
    # 5. EXPENSE BREAKDOWN BY CATEGORY
    # ═══════════════════════════════════════
    expense_breakdown_db = db.query(
        Expense.category.label('category'),
        func.coalesce(func.sum(Expense.amount), 0).label('total_amount')
    ).filter(
        and_(Expense.expense_date >= month_start.date(), company_filter(Expense))
    ).group_by(Expense.category).all()

    expense_breakdown = [
        schema.ExpenseBreakdown(category=row.category or 'OTHER', total_amount=float(row.total_amount))
        for row in expense_breakdown_db
    ]

    # ═══════════════════════════════════════
    # 6. RECENT SALES (Combined Counter + Godown)
    # ═══════════════════════════════════════
    recent_counter_sales = db.query(Sale).filter(
        company_filter(Sale)
    ).order_by(Sale.created_at.desc()).limit(6).all()

    recent_godown_sales = db.query(GodownSale).filter(
        company_filter(GodownSale)
    ).order_by(GodownSale.created_at.desc()).limit(6).all()

    # Merge and map to schema
    all_recent_sales = []
    for s in recent_counter_sales:
        all_recent_sales.append(schema.RecentSale(
            id=s.id, invoice_number=s.invoice_number, customer_name=s.customer_name,
            total_amount=s.total_amount, payment_mode=s.payment_mode,
            created_at=s.created_at, type="COUNTER"
        ))
    for s in recent_godown_sales:
        all_recent_sales.append(schema.RecentSale(
            id=s.id, invoice_number=s.invoice_number, customer_name=s.customer_name,
            total_amount=s.total_amount, payment_mode=s.payment_mode,
            created_at=s.created_at, type="GODOWN"
        ))

    # Sort combined list by created_at descending, then take top 6
    all_recent_sales.sort(key=lambda x: x.created_at, reverse=True)
    recent_sales = all_recent_sales[:6]

    # ═══════════════════════════════════════
    # 7. RECENT PURCHASES (Last 6)
    # ═══════════════════════════════════════
    recent_purchases = db.query(Purchase).filter(
        company_filter(Purchase)
    ).order_by(Purchase.created_at.desc()).limit(6).all()

    # ═══════════════════════════════════════
    # 8. LOW STOCK ITEMS (Top 5)
    # ═══════════════════════════════════════
    low_stock_items = db.query(Product).filter(
        and_(Product.current_stock <= Product.reorder_level, company_filter(Product))
    ).order_by(Product.current_stock.asc()).limit(5).all()

    # ═══════════════════════════════════════
    # BUILD RESPONSE
    # ═══════════════════════════════════════
    return schema.DashboardResponse(
        stats=stats,
        dailySales=daily_sales_list,
        dailyPurchases=daily_purchases_list,
        categoryData=category_data,
        expenseBreakdown=expense_breakdown,
        recentSales=recent_sales,
        recentPurchases=recent_purchases,
        lowStockItems=low_stock_items,
    )