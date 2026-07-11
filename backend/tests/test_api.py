"""End-to-end API tests covering meta endpoints and CRUD flows."""


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_root_metadata(client):
    resp = client.get("/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["api"] == "/api/v1"
    assert "version" in body


def test_customer_crud(client):
    # Create
    resp = client.post(
        "/api/v1/customers/",
        json={"name": "عميل تجريبي", "city": "الرياض"},
    )
    assert resp.status_code == 201
    customer = resp.json()
    assert customer["name"] == "عميل تجريبي"
    customer_id = customer["id"]

    # Read
    resp = client.get(f"/api/v1/customers/{customer_id}")
    assert resp.status_code == 200

    # Update
    resp = client.put(
        f"/api/v1/customers/{customer_id}", json={"city": "جدة"}
    )
    assert resp.status_code == 200
    assert resp.json()["city"] == "جدة"

    # List
    resp = client.get("/api/v1/customers/")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    # Delete
    resp = client.delete(f"/api/v1/customers/{customer_id}")
    assert resp.status_code == 204

    # Confirm gone
    resp = client.get(f"/api/v1/customers/{customer_id}")
    assert resp.status_code == 404


def test_sale_flow_with_relations(client):
    customer_id = client.post(
        "/api/v1/customers/", json={"name": "مشترٍ"}
    ).json()["id"]
    product_id = client.post(
        "/api/v1/products/",
        json={
            "name": "منتج",
            "sku": "SKU-TEST-1",
            "category": "إلكترونيات",
            "unit_price": 100.0,
            "cost_price": 60.0,
            "stock_quantity": 10,
        },
    ).json()["id"]

    resp = client.post(
        "/api/v1/sales/",
        json={
            "customer_id": customer_id,
            "product_id": product_id,
            "quantity": 3,
            "unit_price": 100.0,
            "total_amount": 300.0,
            "sale_date": "2026-01-15",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["total_amount"] == 300.0


def test_product_duplicate_sku_conflict(client):
    payload = {
        "name": "منتج مكرر",
        "sku": "SKU-DUP",
        "category": "قرطاسية",
        "unit_price": 20.0,
        "cost_price": 10.0,
    }
    assert client.post("/api/v1/products/", json=payload).status_code == 201
    # Second insert with same SKU must conflict.
    assert client.post("/api/v1/products/", json=payload).status_code == 409


def test_validation_error_on_bad_quantity(client):
    resp = client.post(
        "/api/v1/sales/",
        json={
            "customer_id": 1,
            "product_id": 1,
            "quantity": 0,  # violates gt=0
            "unit_price": 10.0,
            "total_amount": 0.0,
            "sale_date": "2026-01-15",
        },
    )
    assert resp.status_code == 422
