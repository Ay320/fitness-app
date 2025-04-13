import pytest
from datetime import date, datetime
from fastapi.testclient import TestClient
from app.database import Database
from unittest.mock import patch


def test_get_workouts_by_type(client, db):
    """
    Test the retrieval of workout stats by type within a date range.
    Verifies that the endpoint returns the correct distribution of workout types (e.g. Strength, Cardio)
    for a given user within the specified date range.
    """
    # Insert a user into the Users table to satisfy foreign key constraints
    user_id = 1
    db.cursor.execute(
        "INSERT INTO Users (user_id, firebase_uid, email) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE email=%s",
        (user_id, "testuser1", "test1@example.com", "test1@example.com")
    )
    db.conn.commit()

    # Insert test data into Workout_Exercises with unique exercise_name values
    db.cursor.execute(
        "INSERT INTO Workout_Exercises (exercise_id, exercise_name, category, primary_muscle) VALUES (%s, %s, %s, %s)",
        (1, "Bench Press", "Strength", "Chest")
    )
    db.cursor.execute(
        "INSERT INTO Workout_Exercises (exercise_id, exercise_name, category, primary_muscle) VALUES (%s, %s, %s, %s)",
        (2, "Treadmill Run", "Cardio", "Full Body")
    )
    db.conn.commit()

    # Insert test data into Workout_Logs for the user
    db.cursor.execute(
        "INSERT INTO Workout_Logs (user_id, exercise_id, date_logged) VALUES (%s, %s, %s)",
        (user_id, 1, "2023-01-01 10:00:00")
    )
    db.cursor.execute(
        "INSERT INTO Workout_Logs (user_id, exercise_id, date_logged) VALUES (%s, %s, %s)",
        (user_id, 2, "2023-01-02 12:00:00")
    )
    db.conn.commit()

    # Make the request to the endpoint
    response = client.get("/stats/workouts/by-type?start_date=2023-01-01&end_date=2023-01-31")
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert len(data) == 2, f"Expected 2 workout types, got {len(data)}"
    assert {"type": "Strength", "count": 1} in data, "Strength workout type not found in response"
    assert {"type": "Cardio", "count": 1} in data, "Cardio workout type not found in response"



def test_get_workouts_by_muscle_group(client, db):
    """
    Test the retrieval of workout stats by muscle group within a date range.
    Verifies that the endpoint returns the correct distribution of muscle groups (e.g., Chest, Full Body)
    for a given user within the specified date range.
    """
    # Insert a user into the Users table to satisfy foreign key constraints
    user_id = 1
    db.cursor.execute(
        "INSERT INTO Users (user_id, firebase_uid, email) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE email=%s",
        (user_id, "testuser1", "test1@example.com", "test1@example.com")
    )
    db.conn.commit()

    # Insert test data into Workout_Exercises with unique exercise_name values
    db.cursor.execute(
        "INSERT INTO Workout_Exercises (exercise_id, exercise_name, category, primary_muscle) VALUES (%s, %s, %s, %s)",
        (1, "Bench Press", "Strength", "Chest")
    )
    db.cursor.execute(
        "INSERT INTO Workout_Exercises (exercise_id, exercise_name, category, primary_muscle) VALUES (%s, %s, %s, %s)",
        (2, "Treadmill Run", "Cardio", "Full Body")
    )
    db.conn.commit()

    # Insert test data into Workout_Logs for the user, using the correct column name 'date_logged'
    db.cursor.execute(
        "INSERT INTO Workout_Logs (user_id, exercise_id, date_logged) VALUES (%s, %s, %s)",
        (user_id, 1, "2023-01-01 10:00:00")
    )
    db.cursor.execute(
        "INSERT INTO Workout_Logs (user_id, exercise_id, date_logged) VALUES (%s, %s, %s)",
        (user_id, 2, "2023-01-02 12:00:00")
    )
    db.conn.commit()

    # Make the request to the endpoint
    response = client.get("/stats/workouts/by-muscle-group?start_date=2023-01-01&end_date=2023-01-31")
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert len(data) == 2, f"Expected 2 muscle groups, got {len(data)}"
    assert {"muscle_group": "Chest", "count": 1} in data, "Chest muscle group not found in response"
    assert {"muscle_group": "Full Body", "count": 1} in data, "Full Body muscle group not found in response"



def test_get_weight_history(client, db):
    """
    Test the retrieval of weight history within a date range.
    Verifies that the endpoint returns the correct weight history for a given user,
    averaging multiple entries per day if they exist.
    """
    # Insert a user into the Users table to satisfy foreign key constraints
    user_id = 1
    db.cursor.execute(
        "INSERT INTO Users (user_id, firebase_uid, email) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE email=%s",
        (user_id, "testuser1", "test1@example.com", "test1@example.com")
    )
    db.conn.commit()

    # Insert test data into Weight_History
    db.cursor.execute(
        "INSERT INTO Weight_History (user_id, date_logged, weight_kg) VALUES (%s, %s, %s)",
        (user_id, "2023-01-01 08:00:00", 70.5)
    )
    db.cursor.execute(
        "INSERT INTO Weight_History (user_id, date_logged, weight_kg) VALUES (%s, %s, %s)",
        (user_id, "2023-01-02 08:00:00", 70.0)
    )
    db.conn.commit()

    # Make the request to the endpoint
    response = client.get("/stats/weight/history?start_date=2023-01-01&end_date=2023-01-31")
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert len(data) == 2, f"Expected 2 weight entries, got {len(data)}"
    assert {"date": "2023-01-01", "weight": 70.5} in data, "Weight entry for 2023-01-01 not found"
    assert {"date": "2023-01-02", "weight": 70.0} in data, "Weight entry for 2023-01-02 not found"



def test_log_weight_with_date(client, db):
    """
    Test logging a new weight entry with a specific date.
    Verifies that the endpoint correctly logs the weight entry and updates the user's current weight.
    """
    # Insert a user into the Users table to satisfy foreign key constraints
    user_id = 1
    db.cursor.execute(
        "INSERT INTO Users (user_id, firebase_uid, email) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE email=%s",
        (user_id, "testuser1", "test1@example.com", "test1@example.com")
    )
    db.conn.commit()

    # Log a new weight entry with a specific date
    weight_data = {"weight_kg": 71.0, "date_logged": "2023-01-03T08:00:00"}
    response = client.post("/stats/weight", json=weight_data)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert data == {"date": "2023-01-03", "weight": 71.0}, f"Expected response {{\"date\": \"2023-01-03\", \"weight\": 71.0}}, got {data}"

    # Verify the entry in the database
    db.cursor.execute(
        "SELECT date_logged, weight_kg FROM Weight_History WHERE user_id = %s AND DATE(date_logged) = %s",
        (user_id, "2023-01-03")
    )
    result = db.cursor.fetchone()#
    print(f"Query result: {result}")  # Debug print to see the actual keys
    result_date = result["date_logged"].date()  # Extract date from datetime
    assert result_date == date(2023, 1, 3), f"Expected date 2023-01-03, got {result_date}"
    assert result["weight_kg"] == 71.0, f"Expected weight 71.0, got {result['weight_kg']}"



def test_log_weight_without_date(client, db):
    """
    Test logging a new weight entry without a date (uses CURRENT_TIMESTAMP).
    Verifies that the endpoint logs the weight entry with the current timestamp
    and updates the user's current weight.
    """
    # Insert a user into the Users table to satisfy foreign key constraints
    user_id = 1
    db.cursor.execute(
        "INSERT INTO Users (user_id, firebase_uid, email) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE email=%s",
        (user_id, "testuser1", "test1@example.com", "test1@example.com")
    )
    db.conn.commit()

    # Log a new weight entry without a date
    weight_data = {"weight_kg": 72.0}
    response = client.post("/stats/weight", json=weight_data)
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert data["weight"] == 72.0, f"Expected weight 72.0, got {data['weight']}"
    assert data["date"] == date.today().isoformat(), f"Expected date {date.today().isoformat()}, got {data['date']}"



def test_get_workout_frequency_daily(client, db):
    """
    Test the retrieval of workout frequency with daily granularity.
    Verifies that the endpoint returns the correct number of workouts per day
    within the specified date range.
    """
    # Insert a user into the Users table to satisfy foreign key constraints
    user_id = 1
    db.cursor.execute(
        "INSERT INTO Users (user_id, firebase_uid, email) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE email=%s",
        (user_id, "testuser1", "test1@example.com", "test1@example.com")
    )
    db.conn.commit()

    # Insert test data into Workout_Exercises with unique exercise_name values
    db.cursor.execute(
        "INSERT INTO Workout_Exercises (exercise_id, exercise_name, category, primary_muscle) VALUES (%s, %s, %s, %s)",
        (1, "Bench Press", "Strength", "Chest")
    )
    db.cursor.execute(
        "INSERT INTO Workout_Exercises (exercise_id, exercise_name, category, primary_muscle) VALUES (%s, %s, %s, %s)",
        (2, "Treadmill Run", "Cardio", "Full Body")
    )
    db.conn.commit()

    # Insert test data into Workout_Logs for the user
    db.cursor.execute(
        "INSERT INTO Workout_Logs (user_id, exercise_id, date_logged) VALUES (%s, %s, %s)",
        (user_id, 1, "2023-01-01 10:00:00")
    )
    db.cursor.execute(
        "INSERT INTO Workout_Logs (user_id, exercise_id, date_logged) VALUES (%s, %s, %s)",
        (user_id, 2, "2023-01-02 12:00:00")
    )
    db.conn.commit()

    # Make the request to the endpoint
    response = client.get("/stats/workouts/frequency?start_date=2023-01-01&end_date=2023-01-31&granularity=daily")
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert len(data) == 2, f"Expected 2 daily entries, got {len(data)}"
    assert {"date": "2023-01-01", "count": 1} in data, "Daily entry for 2023-01-01 not found"
    assert {"date": "2023-01-02", "count": 1} in data, "Daily entry for 2023-01-02 not found"


def test_get_workout_frequency_weekly(client, db):
    """
    Test the retrieval of workout frequency with weekly granularity.
    Verifies that the endpoint returns the correct number of workouts per week
    within the specified date range.
    """
    # Insert a user into the Users table to satisfy foreign key constraints
    user_id = 1
    db.cursor.execute(
        "INSERT INTO Users (user_id, firebase_uid, email) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE email=%s",
        (user_id, "testuser1", "test1@example.com", "test1@example.com")
    )
    db.conn.commit()

    # Insert test data into Workout_Exercises 
    db.cursor.execute(
        "INSERT INTO Workout_Exercises (exercise_id, exercise_name, category, primary_muscle) VALUES (%s, %s, %s, %s)",
        (1, "Bench Press", "Strength", "Chest")
    )
    db.cursor.execute(
        "INSERT INTO Workout_Exercises (exercise_id, exercise_name, category, primary_muscle) VALUES (%s, %s, %s, %s)",
        (2, "Treadmill Run", "Cardio", "Full Body")
    )
    db.conn.commit()

    # Insert test data into Workout_Logs for the user
    db.cursor.execute(
        "INSERT INTO Workout_Logs (user_id, exercise_id, date_logged) VALUES (%s, %s, %s)",
        (user_id, 1, "2023-01-01 10:00:00")
    )
    db.cursor.execute(
        "INSERT INTO Workout_Logs (user_id, exercise_id, date_logged) VALUES (%s, %s, %s)",
        (user_id, 2, "2023-01-01 12:00:00")
    )
    db.conn.commit()

    # Make the request to the endpoint
    response = client.get("/stats/workouts/frequency?start_date=2023-01-01&end_date=2023-01-31&granularity=weekly")
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()
    assert len(data) == 1, f"Expected 1 weekly entry, got {len(data)}"  # Both workouts are in the same week
    assert {"year": 2023, "week": 1, "count": 2} in data, "Weekly entry for 2023 Week 1 not found"



def test_get_workout_frequency_invalid_granularity(client, db):
    """
    Test the error handling for an invalid granularity parameter.
    Verifies that the endpoint returns a 400 Bad Request response when an invalid granularity is provided.
    """
    # Make the request with an invalid granularity
    response = client.get("/stats/workouts/frequency?start_date=2023-01-01&end_date=2023-01-31&granularity=monthly")
    assert response.status_code == 400, f"Expected status code 400, got {response.status_code}"
    assert response.json() == {"detail": "Invalid granularity. Use 'daily' or 'weekly'"}, "Expected invalid granularity error message"

def test_get_workouts_by_type_invalid_dates(client, db):
    """
    Test the error handling for a start_date after the end_date.
    Verifies that the endpoint returns a 400 Bad Request response when the date range is invalid.
    """
    # Make the request with an invalid date range
    response = client.get("/stats/workouts/by-type?start_date=2023-12-31&end_date=2023-01-01")
    assert response.status_code == 400, f"Expected status code 400, got {response.status_code}"
    assert response.json() == {"detail": "start_date must be before end_date"}, "Expected invalid date range error message"