"""Service layer package."""
from app.models import Customer, Expense, Product, Purchase, Sale
from app.services.crud import CRUDService

customer_service = CRUDService(Customer)
product_service = CRUDService(Product)
sale_service = CRUDService(Sale)
purchase_service = CRUDService(Purchase)
expense_service = CRUDService(Expense)

__all__ = [
    "CRUDService",
    "customer_service",
    "product_service",
    "sale_service",
    "purchase_service",
    "expense_service",
]
