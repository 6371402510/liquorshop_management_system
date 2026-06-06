from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import Base, engine

from auth.router import router as auth_router
from company.router import router as company_router
from inventory.router import router as inventory_router
from supplier.router import router as supplier_router
from purchases.router import router as purchases_router
from stock_transfer.router import router as stock_transfer_router
from employee.router import router as employee_router
from sales_counter.router import router as sales_counter_router
from sales_godown.router import router as sales_godown_router
from expenses.router import expense_router, category_router
from employee_attendance.router import router as attendance_router
from dashboard.router import router as dashboard_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers
app.include_router(auth_router)
app.include_router(company_router)
app.include_router(inventory_router)
app.include_router(supplier_router)
app.include_router(purchases_router)
app.include_router(stock_transfer_router)
app.include_router(employee_router)
app.include_router(sales_counter_router)
app.include_router(sales_godown_router)
app.include_router(expense_router)
app.include_router(category_router)
app.include_router(attendance_router)
app.include_router(dashboard_router)
app.mount(
    "/assets",
    StaticFiles(directory="../frontend/dist/assets"),
    name="assets"
)

@app.get("/")
async def root():
    return FileResponse("../frontend/dist/index.html")

@app.get("/{path:path}")
async def spa(path: str):
    return FileResponse("../frontend/dist/index.html")