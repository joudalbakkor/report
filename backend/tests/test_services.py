"""Unit tests for the generic CRUD service and the DB session dependency."""
from app.db.session import get_db
from app.models import Customer, Product
from app.services.crud import CRUDService


def test_create_with_dict_and_get(db_session):
    service = CRUDService(Customer)
    obj = service.create(db_session, {"name": "اختبار", "city": "الرياض"})
    assert obj.id is not None
    fetched = service.get(db_session, obj.id)
    assert fetched is not None
    assert fetched.name == "اختبار"


def test_list_count_update_delete(db_session):
    service = CRUDService(Product)
    for i in range(3):
        service.create(
            db_session,
            {
                "name": f"منتج {i}",
                "sku": f"SKU-{i}",
                "category": "عام",
                "unit_price": 10.0,
                "cost_price": 5.0,
                "stock_quantity": 1,
            },
        )

    assert service.count(db_session) == 3

    page = service.list(db_session, skip=0, limit=2)
    assert len(page) == 2

    updated = service.update(db_session, page[0], {"name": "محدّث"})
    assert updated.name == "محدّث"

    service.delete(db_session, updated)
    assert service.count(db_session) == 2


def test_get_missing_returns_none(db_session):
    service = CRUDService(Customer)
    assert service.get(db_session, 12345) is None


def test_get_db_dependency_yields_and_closes():
    gen = get_db()
    db = next(gen)
    assert db is not None
    # Exhausting the generator runs the finally block (db.close()).
    gen.close()
