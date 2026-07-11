"""Populate the database with realistic sample data.

Run from the ``backend/`` directory:

    python seed_data.py

Generates 1000+ sales, 500+ purchases and supporting reference data so the
reporting features have something meaningful to work with. A fixed random seed
keeps the output reproducible across runs.
"""
from __future__ import annotations

import random
from datetime import date, timedelta

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Customer, Expense, Product, Purchase, Sale

random.seed(42)

# Data is generated relative to this reference date (project "today").
TODAY = date(2026, 7, 11)
HISTORY_DAYS = 540  # ~18 months of history

# ---------------------------------------------------------------------------
# Reference data pools (Arabic — matches the Arabic UI).
# ---------------------------------------------------------------------------
FIRST_NAMES = [
    "محمد", "أحمد", "عبدالله", "خالد", "سعود", "فهد", "ناصر", "عمر", "يوسف",
    "إبراهيم", "سلطان", "بندر", "ماجد", "طارق", "وليد", "سارة", "نورة", "منى",
    "هند", "ريم", "لطيفة", "أمل", "عائشة", "فاطمة", "جواهر",
]
LAST_NAMES = [
    "الفارس", "العتيبي", "القحطاني", "الشمري", "الدوسري", "الغامدي", "الحربي",
    "المطيري", "الزهراني", "السبيعي", "البقمي", "العنزي", "الشهري", "المالكي",
    "الرشيدي",
]
CITIES = [
    "الرياض", "جدة", "الدمام", "مكة", "المدينة", "الطائف", "تبوك", "أبها",
    "بريدة", "الخبر", "حائل", "نجران", "جازان",
]

PRODUCT_CATALOG = [
    ("إلكترونيات", ["جهاز لابتوب", "هاتف ذكي", "سماعة رأس", "شاشة عرض",
                    "لوحة مفاتيح", "ماوس لاسلكي", "كاميرا رقمية", "ساعة ذكية",
                    "قرص تخزين خارجي", "راوتر"]),
    ("أثاث مكتبي", ["كرسي مكتب", "طاولة اجتماعات", "خزانة ملفات", "مكتب خشبي",
                    "رف كتب"]),
    ("قرطاسية", ["ورق طباعة", "أقلام حبر", "دفاتر", "حبر طابعة", "ملفات بلاستيكية",
                 "دباسة"]),
    ("أجهزة منزلية", ["مكيف هواء", "ثلاجة", "غسالة", "فرن كهربائي", "مكنسة",
                      "غلاية ماء"]),
    ("مستلزمات شبكات", ["كابل شبكة", "سويتش", "نقطة وصول", "خادم صغير",
                        "بطارية احتياطية"]),
]

SUPPLIERS = [
    "شركة التقنية المتقدمة", "مؤسسة النور للتجارة", "الشركة الوطنية للتوريدات",
    "مجموعة الخليج التجارية", "مؤسسة الرواد", "شركة المستقبل للإمداد",
    "دار الأعمال للتجارة", "الشركة العربية للتوزيع",
]

EXPENSE_CATEGORIES = {
    "رواتب": (8000, 45000),
    "إيجار": (10000, 30000),
    "كهرباء وماء": (1500, 8000),
    "تسويق وإعلان": (2000, 25000),
    "صيانة": (500, 6000),
    "نقل وشحن": (800, 7000),
    "اتصالات وإنترنت": (600, 4000),
    "مستلزمات مكتبية": (300, 3000),
}


def random_date(days_back: int = HISTORY_DAYS) -> date:
    return TODAY - timedelta(days=random.randint(0, days_back))


def build_customers(n: int) -> list[Customer]:
    customers = []
    for i in range(n):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        customers.append(
            Customer(
                name=f"{first} {last}",
                email=f"customer{i + 1}@example.com",
                phone=f"05{random.randint(0, 9)}{random.randint(1000000, 9999999)}",
                city=random.choice(CITIES),
            )
        )
    return customers


def build_products() -> list[Product]:
    products = []
    sku_counter = 1
    for category, items in PRODUCT_CATALOG:
        for name in items:
            cost = round(random.uniform(50, 4000), 2)
            margin = random.uniform(1.15, 1.6)
            products.append(
                Product(
                    name=name,
                    sku=f"SKU-{sku_counter:04d}",
                    category=category,
                    unit_price=round(cost * margin, 2),
                    cost_price=cost,
                    stock_quantity=random.randint(0, 500),
                )
            )
            sku_counter += 1
    return products


def build_sales(n: int, customers: list[Customer],
                products: list[Product]) -> list[Sale]:
    sales = []
    for _ in range(n):
        customer = random.choice(customers)
        product = random.choice(products)
        quantity = random.randint(1, 25)
        # Occasional small discount on unit price.
        discount = random.choice([1.0, 1.0, 1.0, 0.95, 0.9])
        unit_price = round(product.unit_price * discount, 2)
        sales.append(
            Sale(
                customer=customer,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                total_amount=round(unit_price * quantity, 2),
                sale_date=random_date(),
            )
        )
    return sales


def build_purchases(n: int, products: list[Product]) -> list[Purchase]:
    purchases = []
    for _ in range(n):
        product = random.choice(products)
        quantity = random.randint(10, 300)
        # Purchase cost fluctuates slightly around the product cost price.
        unit_cost = round(product.cost_price * random.uniform(0.9, 1.1), 2)
        purchases.append(
            Purchase(
                product=product,
                supplier_name=random.choice(SUPPLIERS),
                quantity=quantity,
                unit_cost=unit_cost,
                total_cost=round(unit_cost * quantity, 2),
                purchase_date=random_date(),
            )
        )
    return purchases


def build_expenses(n: int) -> list[Expense]:
    expenses = []
    categories = list(EXPENSE_CATEGORIES.items())
    for _ in range(n):
        category, (low, high) = random.choice(categories)
        expenses.append(
            Expense(
                category=category,
                description=f"مصروف {category}",
                amount=round(random.uniform(low, high), 2),
                expense_date=random_date(),
            )
        )
    return expenses


def seed() -> None:
    print("Recreating database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Generating customers...")
        customers = build_customers(150)
        db.add_all(customers)
        db.flush()  # assign IDs for relationships

        print("Generating products...")
        products = build_products()
        db.add_all(products)
        db.flush()

        print("Generating sales...")
        db.add_all(build_sales(1200, customers, products))

        print("Generating purchases...")
        db.add_all(build_purchases(600, products))

        print("Generating expenses...")
        db.add_all(build_expenses(300))

        db.commit()

        summary = {
            "customers": db.query(Customer).count(),
            "products": db.query(Product).count(),
            "sales": db.query(Sale).count(),
            "purchases": db.query(Purchase).count(),
            "expenses": db.query(Expense).count(),
        }
        print("\nSeed complete:")
        for name, count in summary.items():
            print(f"  {name:<10} {count}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
