from pydantic import BaseModel
from typing import List

class StorePerformance(BaseModel):
    id: int
    name: str
    sales: float
    expense: float
    employees: int

class AttendanceRecord(BaseModel):
    emp: str
    store: str
    checkin: str
    status: str

class ExpenseCategoryBreakdown(BaseModel):
    category: str
    total_amount: float

class PayrollSummary(BaseModel):
    total_employees: int
    total_salary: float
    overtime: float
    incentive: float
    net_payroll: float

class OperationsStats(BaseModel):
    total_stores: int
    total_employees: int
    present_today: int
    cash_in_hand: float
    total_stock_value: float  # ← NEW

# ─── NEW: Company-wise stock breakdown ───
class CompanyStockValue(BaseModel):
    company_id: int
    company_name: str
    stock_value: float        # total value at cost
    stock_value_mrp: float    # total value at MRP (optional)
    item_count: int           # number of distinct liquor items

class OperationsDashboardResponse(BaseModel):
    stats: OperationsStats
    stores: List[StorePerformance]
    attendance: List[AttendanceRecord]
    monthly_expenses: List[ExpenseCategoryBreakdown]
    payroll_summary: PayrollSummary
    company_stock: List[CompanyStockValue]  # ← NEW