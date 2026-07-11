"""Pytest fixtures: isolated in-memory database + TestClient."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (register models on Base.metadata)
from app.db.base import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture()
def client():
    """A TestClient backed by a fresh in-memory SQLite database per test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(
        bind=engine, autoflush=False, autocommit=False
    )
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
