import pytest
from fastapi.testclient import TestClient
from fastapi import Header
from app.main import app
from app.database import get_database
from tests.test_data import REAL_FIREBASE_TOKEN
from app.dependencies import get_current_user  # Import the dependency to override


'''
# Real Token:
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
    db.close()'
    '''

#Mock token:
@pytest.fixture
def client():
    # Override the get_current_user dependency for all tests
    async def mock_get_current_user():
        return {"uid": "une1uwhaFy6UFRk7tCGldO0xPX5U", "email": "test1@example.com"}

    app.dependency_overrides[get_current_user] = mock_get_current_user
    client = TestClient(app)
    yield client
    # Clean up the override after the test
    app.dependency_overrides = {}

@pytest.fixture
def firebase_token():
    return "mock_firebase_token"

@pytest.fixture
def db():
    db = get_database()
    # Clean up all tables before each test
    # Deleting from Users will cascade to dependent tables (Workout_Logs, Weight_History)
    db.cursor.execute("DELETE FROM Users")
    # Also delete Workout_Exercises 
    db.cursor.execute("DELETE FROM Workout_Exercises")
    db.conn.commit()
    yield db
    # Clean up after each test 
    db.cursor.execute("DELETE FROM Users")
    db.cursor.execute("DELETE FROM Workout_Exercises")
    db.conn.commit()
    db.close()