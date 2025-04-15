import pytest
from fastapi.testclient import TestClient
from app.database import Database
from datetime import date
from freezegun import freeze_time

# Helper Functions
def create_user(db: Database, firebase_uid: str, email: str) -> int:
    """Create a user in the database and return the user_id."""
    db.cursor.execute(
        "INSERT INTO Users (firebase_uid, email) VALUES (%s, %s)",
        (firebase_uid, email)
    )
    db.conn.commit()
    return db.cursor.lastrowid

def create_exercise(db: Database, exercise_name: str, primary_muscle: str, category: str = "Strength") -> int:
    """Create an exercise in the database and return the exercise_id."""
    db.cursor.execute(
        """
        INSERT INTO Workout_Exercises (exercise_name, primary_muscle, category)
        VALUES (%s, %s, %s)
        """,
        (exercise_name, primary_muscle, category)
    )
    db.conn.commit()
    return db.cursor.lastrowid

def log_workout(db: Database, user_id: int, exercise_id: int, log_date: date):
    """Log a workout for a user on a specific date."""
    log_date_str = log_date.strftime('%Y-%m-%d')  # Convert FakeDate to string
    db.cursor.execute(
        """
        INSERT INTO Workout_Logs (user_id, exercise_id, date_logged)
        VALUES (%s, %s, %s)
        """,
        (user_id, exercise_id, log_date_str)
    )
    db.conn.commit()

# Test Cases
@freeze_time("2023-01-01")
def test_get_streak_no_workouts(client: TestClient, db: Database):
    """Test that the streak is 0 when no workouts are logged."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.get("/user/streak")
    assert response.status_code == 200
    assert response.json() == {"current_streak": 0}

@freeze_time("2023-01-01")
def test_get_streak_with_workout_today(client: TestClient, db: Database):
    """Test that the streak is 1 when a workout is logged today."""
    user_id = create_user(db, "testuser1", "test1@example.com")
    exercise_id = create_exercise(db, "Test Exercise", "Test Muscle")
    log_workout(db, user_id, exercise_id, date(2023, 1, 1))
    response = client.get("/user/streak")
    assert response.status_code == 200
    assert response.json() == {"current_streak": 1}

@freeze_time("2023-01-01")
def test_get_streak_consecutive_days(client: TestClient, db: Database):
    """Test that the streak increments to 2 for workouts on consecutive days."""
    user_id = create_user(db, "testuser1", "test1@example.com")
    exercise_id = create_exercise(db, "Test Exercise", "Test Muscle")
    
    # Log workout on day 1 and update streak
    log_workout(db, user_id, exercise_id, date(2023, 1, 1))
    client.get("/user/streak")  # Sets streak to 1 and last_update to 2023-01-01

    # Log workout on day 2 and check streak
    with freeze_time("2023-01-02"):
        log_workout(db, user_id, exercise_id, date(2023, 1, 2))
        response = client.get("/user/streak")
        assert response.status_code == 200
        assert response.json() == {"current_streak": 2}

@freeze_time("2023-01-01")
def test_get_streak_missed_day(client: TestClient, db: Database):
    """Test that the streak resets to 0 after missing a day."""
    user_id = create_user(db, "testuser1", "test1@example.com")
    exercise_id = create_exercise(db, "Test Exercise", "Test Muscle")
    
    # Log workout on day 1 and update streak
    log_workout(db, user_id, exercise_id, date(2023, 1, 1))
    client.get("/user/streak")  # Sets streak to 1 and last_update to 2023-01-01

    # Check streak on day 3 (missed day 2)
    with freeze_time("2023-01-03"):
        response = client.get("/user/streak")
        assert response.status_code == 200
        assert response.json() == {"current_streak": 0}