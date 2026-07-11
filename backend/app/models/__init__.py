"""ORM models package.

Importing the models here ensures they are registered on ``Base.metadata``
whenever the package is imported (needed for ``create_all`` and seeding).
"""
from app.models.customer import Customer
from app.models.expense import Expense
from app.models.product import Product
from app.models.purchase import Purchase
from app.models.sale import Sale

__all__ = ["Customer", "Product", "Sale", "Purchase", "Expense"]
