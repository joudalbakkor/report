"""Aggregate API router wiring every entity's CRUD endpoints."""
from fastapi import APIRouter

from app import schemas, services
from app.api.crud_router import create_crud_router

api_router = APIRouter()

api_router.include_router(
    create_crud_router(
        service=services.customer_service,
        read_schema=schemas.CustomerRead,
        create_schema=schemas.CustomerCreate,
        update_schema=schemas.CustomerUpdate,
        prefix="/customers",
        tags=["customers"],
    )
)
api_router.include_router(
    create_crud_router(
        service=services.product_service,
        read_schema=schemas.ProductRead,
        create_schema=schemas.ProductCreate,
        update_schema=schemas.ProductUpdate,
        prefix="/products",
        tags=["products"],
    )
)
api_router.include_router(
    create_crud_router(
        service=services.sale_service,
        read_schema=schemas.SaleRead,
        create_schema=schemas.SaleCreate,
        update_schema=schemas.SaleUpdate,
        prefix="/sales",
        tags=["sales"],
    )
)
api_router.include_router(
    create_crud_router(
        service=services.purchase_service,
        read_schema=schemas.PurchaseRead,
        create_schema=schemas.PurchaseCreate,
        update_schema=schemas.PurchaseUpdate,
        prefix="/purchases",
        tags=["purchases"],
    )
)
api_router.include_router(
    create_crud_router(
        service=services.expense_service,
        read_schema=schemas.ExpenseRead,
        create_schema=schemas.ExpenseCreate,
        update_schema=schemas.ExpenseUpdate,
        prefix="/expenses",
        tags=["expenses"],
    )
)
