"""Parametrized CRUD tests covering every resource endpoint."""
import pytest

# A valid create payload for each resource.
PAYLOADS = {
    "customers": {"name": "عميل تجريبي", "city": "جدة"},
    "products": {
        "name": "منتج تجريبي",
        "sku": "SKU-TEST-CRUD",
        "category": "عام",
        "unit_price": 100.0,
        "cost_price": 60.0,
        "stock_quantity": 5,
    },
    "sales": {
        "customer_id": 1,
        "product_id": 1,
        "quantity": 2,
        "unit_price": 50.0,
        "total_amount": 100.0,
        "sale_date": "2026-01-01",
    },
    "purchases": {
        "product_id": 1,
        "supplier_name": "مورّد تجريبي",
        "quantity": 5,
        "unit_cost": 10.0,
        "total_cost": 50.0,
        "purchase_date": "2026-01-01",
    },
    "expenses": {
        "category": "إيجار",
        "amount": 1000.0,
        "expense_date": "2026-01-01",
    },
}

# A field to change on update and the expected value.
UPDATES = {
    "customers": ("city", "الرياض"),
    "products": ("stock_quantity", 42),
    "sales": ("quantity", 9),
    "purchases": ("supplier_name", "مورّد آخر"),
    "expenses": ("category", "تسويق"),
}


@pytest.mark.parametrize("resource,payload", list(PAYLOADS.items()))
def test_full_crud_flow(client, resource, payload):
    base = f"/api/v1/{resource}"

    # Create
    created = client.post(f"{base}/", json=payload)
    assert created.status_code == 201, created.text
    obj = created.json()
    obj_id = obj["id"]

    # List includes the new object
    listed = client.get(f"{base}/")
    assert listed.status_code == 200
    assert any(row["id"] == obj_id for row in listed.json())

    # Get by id
    assert client.get(f"{base}/{obj_id}").status_code == 200

    # Update
    field, value = UPDATES[resource]
    updated = client.put(f"{base}/{obj_id}", json={field: value})
    assert updated.status_code == 200
    assert updated.json()[field] == value

    # Delete
    assert client.delete(f"{base}/{obj_id}").status_code == 204
    assert client.get(f"{base}/{obj_id}").status_code == 404


@pytest.mark.parametrize("resource", list(PAYLOADS.keys()))
def test_get_missing_returns_404(client, resource):
    assert client.get(f"/api/v1/{resource}/999999").status_code == 404


@pytest.mark.parametrize("resource,payload", list(PAYLOADS.items()))
def test_update_missing_returns_404(client, resource, payload):
    assert client.put(f"/api/v1/{resource}/999999", json=payload).status_code == 404


@pytest.mark.parametrize("resource", list(PAYLOADS.keys()))
def test_delete_missing_returns_404(client, resource):
    assert client.delete(f"/api/v1/{resource}/999999").status_code == 404


def test_pagination_limit_validation(client):
    # limit above the allowed maximum is rejected.
    assert client.get("/api/v1/customers/?limit=5000").status_code == 422
    assert client.get("/api/v1/customers/?skip=-1").status_code == 422
