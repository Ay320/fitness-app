import pytest
from fastapi.testclient import TestClient
from fastapi import Header
from app.main import app
from app.database import get_database
from tests.test_data import REAL_FIREBASE_TOKEN
from app.dependencies import get_current_user  # Import the dependency to override
import os


# Set the test database environment variable
os.environ["TEST_DATABASE"] = "fittrack_test_DB"

'''
def pytest_configure(config):   # to check which database is connected to
    """Configure pytest to show logs during test execution."""
    # Enable live logging
    config.option.log_cli = True
    # Set the logging level to INFO
    config.option.log_cli_level = "INFO"
    # Define the log format
    config.option.log_cli_format = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"'''

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
        return {"uid": "testuser1", "email": "test1@example.com"}

    app.dependency_overrides[get_current_user] = mock_get_current_user
    client = TestClient(app)
    yield client
    # Clean up the override after the test
    app.dependency_overrides = {}

@pytest.fixture
def firebase_token():
    return "mock_firebase_token"


@pytest.fixture(scope="session")
def db():
    print("Creating database connection for test session")
    db = get_database()
    try:
        print("Clearing tables before test session")
        db.clear_all_tables()
    except Exception as e:
        print(f"Error clearing tables before test session: {e}")
        raise
    yield db
    try:
        print("Clearing tables after test session")
        db.clear_all_tables()
    except Exception as e:
        print(f"Error clearing tables after test session: {e}")
    finally:
        try:
            print("Closing database connection")
            db.close()
        except Exception as e:
            print(f"Error closing database connection: {e}")

@pytest.fixture(autouse=True)
def clear_tables(db):
    """Clear all tables before each test to ensure isolation."""
    try:
        db.clear_all_tables()
    except Exception as e:
        print(f"Error clearing tables before test: {e}")
        raise