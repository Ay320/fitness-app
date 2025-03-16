# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_database
from tests.test_data import REAL_FIREBASE_TOKEN

@pytest.fixture
def client():
    """Provide a TestClient instance for making HTTP requests."""
    return TestClient(app)

@pytest.fixture(params=[REAL_FIREBASE_TOKEN, "mock_firebase_token_123"])
def firebase_token(request):
    """Provide a real or mock Firebase token based on the test need."""
    return request.param

@pytest.fixture
def db():
    """Provide a database connection and clean up after each test."""
    db = get_database()
    yield db
    # Teardown: Delete from Users (cascades to dependent tables)
    db.cursor.execute("DELETE FROM Users")
    db.conn.commit()
    db.close()