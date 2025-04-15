import pytest
from fastapi.testclient import TestClient
from app.database import Database
from datetime import datetime

# Helper Functions
def create_user(db: Database, firebase_uid: str, email: str):
    """Create a test user and return their user_id."""
    return db.sync_user(firebase_uid=firebase_uid, email=email)

def create_exercise(db: Database, exercise_name: str, category: str, primary_muscle: str, secondary_muscle: str = None, sets: str = "3", reps: str = "10", duration: str = "30", equipment: str = None):
    """Create a test exercise and return its exercise_id, handling duplicates."""
    db.cursor.execute(
        """
        INSERT INTO Workout_Exercises (exercise_name, category, primary_muscle, secondary_muscle, initial_recommended_sets, initial_recommended_reps, initial_recommended_time, equipment)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE exercise_id=LAST_INSERT_ID(exercise_id)
        """,
        (exercise_name, category, primary_muscle, secondary_muscle, sets, reps, duration, equipment)
    )
    db.conn.commit()
    return db.cursor.lastrowid

# Test Database Verification
def test_verify_test_database(db: Database):
    """Verify that the tests are using the correct test database."""
    db.cursor.execute("SELECT DATABASE() AS db_name")
    result = db.cursor.fetchone()
    # Convert tuple to dict if necessary
    if isinstance(result, tuple):
        result = dict(zip(db.cursor.column_names, result))
    assert result["db_name"] == "fittrack_test_DB", f"Expected 'fittrack_test_DB', got '{result['db_name']}'"

# Plans Endpoints Tests
def test_create_plan_valid(client: TestClient, db: Database):
    """Test creating a plan with valid data."""
    create_user(db, "testuser1", "test1@example.com")
    plan_data = {
        "name": "Beginner Plan",
        "description": "A plan for beginners",
        "days_per_week": 3,
        "preferred_days": "Monday,Wednesday,Friday"
    }
    print("Sending POST request to /plans") #debug
    response = client.post("/plans", json=plan_data, follow_redirects=False)
    print(f"Received response: {response.status_code} - {response.text}")
    assert response.status_code == 201
    plan = response.json()
    assert "plan_id" in plan
    assert plan["name"] == "Beginner Plan"
    assert plan["description"] == "A plan for beginners"
    assert plan["days_per_week"] == 3
    assert plan["preferred_days"] == "Monday,Wednesday,Friday"
    assert plan["is_active"] is False

def test_create_plan_minimal_data(client: TestClient, db: Database):
    """Test creating a plan with minimal data."""
    create_user(db, "testuser1", "test1@example.com")
    plan_data = {"name": "Minimal Plan", "days_per_week": 1}
    response = client.post("/plans", json=plan_data, follow_redirects=False)
    assert response.status_code == 201
    plan = response.json()
    assert "plan_id" in plan
    assert plan["name"] == "Minimal Plan"
    assert plan["days_per_week"] == 1
    assert plan.get("description") is None
    assert plan.get("preferred_days") is None

def test_create_plan_invalid_days_per_week(client: TestClient, db: Database):
    """Test creating a plan with invalid days_per_week."""
    create_user(db, "testuser1", "test1@example.com")
    plan_data = {"name": "Invalid Plan", "days_per_week": 0}
    response = client.post("/plans", json=plan_data, follow_redirects=False)
    assert response.status_code == 400
    assert "days_per_week must be between 1 and 7" in response.json()["detail"]

def test_get_plans(client: TestClient, db: Database):
    """Test retrieving all plans."""
    create_user(db, "testuser1", "test1@example.com")
    client.post("/plans", json={"name": "Plan 1", "days_per_week": 3}, follow_redirects=False)
    client.post("/plans", json={"name": "Plan 2", "days_per_week": 4}, follow_redirects=False)
    response = client.get("/plans", follow_redirects=False)
    assert response.status_code == 200
    plans = response.json()
    assert len(plans) == 2
    assert plans[0]["name"] == "Plan 1"
    assert plans[1]["name"] == "Plan 2"

def test_get_plans_no_data(client: TestClient, db: Database):
    """Test retrieving plans when none exist."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.get("/plans", follow_redirects=False)
    assert response.status_code == 200
    assert response.json() == []

def test_get_plan(client: TestClient, db: Database):
    """Test retrieving a specific plan."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.post("/plans", json={"name": "Specific Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.get(f"/plans/{plan_id}", follow_redirects=False)
    assert response.status_code == 200
    plan = response.json()
    assert plan["name"] == "Specific Plan"
    assert plan["days_per_week"] == 3

def test_get_plan_not_found(client: TestClient, db: Database):
    """Test retrieving a non-existent plan."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.get("/plans/999", follow_redirects=False)
    assert response.status_code == 404
    assert response.json() == {"detail": "Plan not found"}

def test_update_plan(client: TestClient, db: Database):
    """Test updating a plan."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.post("/plans", json={"name": "Old Name", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    update_data = {"name": "New Name", "days_per_week": 4}
    response = client.put(f"/plans/{plan_id}", json=update_data, follow_redirects=False)
    assert response.status_code == 200
    updated_plan = response.json()
    assert updated_plan["name"] == "New Name"
    assert updated_plan["days_per_week"] == 4

def test_update_plan_not_found(client: TestClient, db: Database):
    """Test updating a non-existent plan."""
    create_user(db, "testuser1", "test1@example.com")
    update_data = {"name": "New Name", "days_per_week": 4}
    response = client.put("/plans/999", json=update_data, follow_redirects=False)
    assert response.status_code == 404
    assert response.json() == {"detail": "Plan not found"}

def test_delete_plan(client: TestClient, db: Database):
    """Test deleting a plan."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.post("/plans", json={"name": "To Delete", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.delete(f"/plans/{plan_id}", follow_redirects=False)
    assert response.status_code == 200
    assert response.json() == {"message": "Plan deleted successfully"}
    response = client.get(f"/plans/{plan_id}", follow_redirects=False)
    assert response.status_code == 404

def test_set_plan_active(client: TestClient, db: Database):
    """Test setting a plan as active."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.post("/plans", json={"name": "Plan 1", "days_per_week": 3}, follow_redirects=False)
    plan_id_1 = response.json()["plan_id"]
    response = client.post("/plans", json={"name": "Plan 2", "days_per_week": 4}, follow_redirects=False)
    plan_id_2 = response.json()["plan_id"]
    response = client.put(f"/plans/{plan_id_1}/set-active", follow_redirects=False)
    assert response.status_code == 200
    assert response.json() == {"message": f"Plan {plan_id_1} set as active"}
    response = client.get("/plans", follow_redirects=False)
    plans = response.json()
    for plan in plans:
        if plan["plan_id"] == plan_id_1:
            assert plan["is_active"] is True
        else:
            assert plan["is_active"] is False

def test_set_plan_active_not_found(client: TestClient, db: Database):
    """Test setting a non-existent plan as active."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.put("/plans/999/set-active", follow_redirects=False)
    assert response.status_code == 404
    assert response.json() == {"detail": "Plan not found"}

# Days Endpoints Tests
def test_create_day_valid(client: TestClient, db: Database):
    """Test adding a day to a plan."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.post("/plans", json={"name": "Test Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    day_data = {"day_number": 1, "description": "Leg Day"}
    response = client.post(f"/plans/{plan_id}/days", json=day_data, follow_redirects=False)
    assert response.status_code == 200
    day = response.json()
    assert day["day_number"] == 1
    assert day["description"] == "Leg Day"

def test_create_day_invalid_plan(client: TestClient, db: Database):
    """Test adding a day to a non-existent plan."""
    create_user(db, "testuser1", "test1@example.com")
    day_data = {"day_number": 1, "description": "Leg Day"}
    response = client.post("/plans/999/days", json=day_data, follow_redirects=False)
    assert response.status_code == 404
    assert response.json() == {"detail": "Plan not found"}

def test_get_days(client: TestClient, db: Database):
    """Test retrieving all days for a plan."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.post("/plans", json={"name": "Test Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    client.post(f"/plans/{plan_id}/days", json={"day_number": 1, "description": "Day 1"}, follow_redirects=False)
    client.post(f"/plans/{plan_id}/days", json={"day_number": 2, "description": "Day 2"}, follow_redirects=False)
    response = client.get(f"/plans/{plan_id}/days", follow_redirects=False)
    assert response.status_code == 200
    days = response.json()
    assert len(days) == 2
    assert days[0]["day_number"] == 1
    assert days[1]["day_number"] == 2

def test_get_days_no_data(client: TestClient, db: Database):
    """Test retrieving days when none exist."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.post("/plans", json={"name": "Empty Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.get(f"/plans/{plan_id}/days", follow_redirects=False)
    assert response.status_code == 200
    assert response.json() == []

def test_update_day(client: TestClient, db: Database):
    """Test updating a day's details."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.post("/plans", json={"name": "Test Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.post(f"/plans/{plan_id}/days", json={"day_number": 1, "description": "Old Description"}, follow_redirects=False)
    day_id = response.json()["plan_day_id"]
    update_data = {"day_number": 2, "description": "New Description"}
    response = client.put(f"/plans/{plan_id}/days/{day_id}", json=update_data, follow_redirects=False)
    assert response.status_code == 200
    updated_day = response.json()
    assert updated_day["day_number"] == 2
    assert updated_day["description"] == "New Description"

def test_delete_day(client: TestClient, db: Database):
    """Test deleting a day."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.post("/plans", json={"name": "Test Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.post(f"/plans/{plan_id}/days", json={"day_number": 1, "description": "To Delete"}, follow_redirects=False)
    day_id = response.json()["plan_day_id"]
    response = client.delete(f"/plans/{plan_id}/days/{day_id}", follow_redirects=False)
    assert response.status_code == 200
    assert response.json() == {"message": "Day deleted successfully"}
    response = client.get(f"/plans/{plan_id}/days", follow_redirects=False)
    assert len(response.json()) == 0

# Exercises Endpoints Tests
def test_add_exercise_to_day_valid(client: TestClient, db: Database):
    """Test adding an exercise to a day."""
    create_user(db, "testuser1", "test1@example.com")
    exercise_id = create_exercise(db, "Squat", "Strength", "Legs", sets="3", reps="10", duration="30")
    response = client.post("/plans", json={"name": "Test Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.post(f"/plans/{plan_id}/days", json={"day_number": 1, "description": "Leg Day"}, follow_redirects=False)
    day_id = response.json()["plan_day_id"]
    exercise_data = {"exercise_id": exercise_id}
    response = client.post(f"/plans/{plan_id}/days/{day_id}/exercises", json=exercise_data, follow_redirects=False)
    assert response.status_code == 200
    exercise = response.json()
    assert exercise["exercise_id"] == exercise_id
    assert exercise["exercise_name"] == "Squat"
    assert exercise["recommended_sets"] == "3"
    assert exercise["recommended_reps"] == "10"
    assert exercise["recommended_duration"] == "30"

def test_add_exercise_to_day_invalid_exercise(client: TestClient, db: Database):
    """Test adding a non-existent exercise to a day."""
    create_user(db, "testuser1", "test1@example.com")
    response = client.post("/plans", json={"name": "Test Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.post(f"/plans/{plan_id}/days", json={"day_number": 1, "description": "Leg Day"}, follow_redirects=False)
    day_id = response.json()["plan_day_id"]
    exercise_data = {"exercise_id": 999}
    response = client.post(f"/plans/{plan_id}/days/{day_id}/exercises", json=exercise_data, follow_redirects=False)
    assert response.status_code == 404
    assert response.json() == {"detail": "Exercise not found"}

def test_get_exercises_for_day(client: TestClient, db: Database):
    """Test retrieving all exercises for a day."""
    create_user(db, "testuser1", "test1@example.com")
    exercise_id_1 = create_exercise(db, "Squat", "Strength", "Legs", sets="3", reps="10", duration="30")
    exercise_id_2 = create_exercise(db, "Lunges", "Strength", "Legs", sets="3", reps="12", duration="20")
    response = client.post("/plans", json={"name": "Test Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.post(f"/plans/{plan_id}/days", json={"day_number": 1, "description": "Leg Day"}, follow_redirects=False)
    day_id = response.json()["plan_day_id"]
    client.post(f"/plans/{plan_id}/days/{day_id}/exercises", json={"exercise_id": exercise_id_1}, follow_redirects=False)
    client.post(f"/plans/{plan_id}/days/{day_id}/exercises", json={"exercise_id": exercise_id_2}, follow_redirects=False)
    response = client.get(f"/plans/{plan_id}/days/{day_id}/exercises", follow_redirects=False)
    assert response.status_code == 200
    exercises = response.json()
    assert len(exercises) == 2
    assert exercises[0]["exercise_name"] == "Squat"
    assert exercises[1]["exercise_name"] == "Lunges"
    assert exercises[0]["recommended_sets"] == "3"
    assert exercises[0]["recommended_reps"] == "10"
    assert exercises[0]["recommended_duration"] == "30"
    assert exercises[1]["recommended_sets"] == "3"
    assert exercises[1]["recommended_reps"] == "12"
    assert exercises[1]["recommended_duration"] == "20"

def test_remove_exercise_from_day(client: TestClient, db: Database):
    """Test removing an exercise from a day."""
    create_user(db, "testuser1", "test1@example.com")
    exercise_id = create_exercise(db, "Squat", "Strength", "Legs", sets="3", reps="10", duration="30")
    response = client.post("/plans", json={"name": "Test Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.post(f"/plans/{plan_id}/days", json={"day_number": 1, "description": "Leg Day"}, follow_redirects=False)
    day_id = response.json()["plan_day_id"]
    response = client.post(f"/plans/{plan_id}/days/{day_id}/exercises", json={"exercise_id": exercise_id}, follow_redirects=False)
    plan_exercise_id = response.json()["plan_exercise_id"]
    response = client.delete(f"/plans/{plan_id}/days/{day_id}/exercises/{plan_exercise_id}", follow_redirects=False)
    assert response.status_code == 200
    assert response.json() == {"message": "Exercise removed successfully"}
    response = client.get(f"/plans/{plan_id}/days/{day_id}/exercises", follow_redirects=False)
    assert len(response.json()) == 0

# Workout Logging Tests
def test_log_workout_valid(client: TestClient, db: Database):
    """Test logging a workout with valid data."""
    create_user(db, "testuser1", "test1@example.com")
    exercise_id = create_exercise(db, "Bench Press", "Strength", "Chest", sets="4", reps="8", duration="40")
    response = client.post("/plans", json={"name": "Test Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.post(f"/plans/{plan_id}/days", json={"day_number": 1, "description": "Upper Body"}, follow_redirects=False)
    day_id = response.json()["plan_day_id"]
    response = client.post(f"/plans/{plan_id}/days/{day_id}/exercises", json={"exercise_id": exercise_id}, follow_redirects=False)
    plan_exercise_id = response.json()["plan_exercise_id"]
    workout_log_data = {
        "exercise_id": exercise_id,
        "sets": 4,
        "reps": 8,
        "weight": 50.0,
        "notes": "Felt strong"
    }
    response = client.post(f"/plans/{plan_id}/days/{day_id}/exercises/{plan_exercise_id}/log", json=workout_log_data, follow_redirects=False)
    assert response.status_code == 200
    workout_log = response.json()
    assert workout_log["exercise_id"] == exercise_id
    assert workout_log["sets"] == 4
    assert workout_log["reps"] == 8
    assert workout_log["weight"] == 50.0
    assert workout_log["notes"] == "Felt strong"

def test_log_workout_invalid_data(client: TestClient, db: Database):
    """Test logging a workout with invalid data."""
    create_user(db, "testuser1", "test1@example.com")
    exercise_id = create_exercise(db, "Bench Press", "Strength", "Chest", sets="4", reps="8", duration="40")
    response = client.post("/plans", json={"name": "Test Plan", "days_per_week": 3}, follow_redirects=False)
    plan_id = response.json()["plan_id"]
    response = client.post(f"/plans/{plan_id}/days", json={"day_number": 1, "description": "Upper Body"}, follow_redirects=False)
    day_id = response.json()["plan_day_id"]
    response = client.post(f"/plans/{plan_id}/days/{day_id}/exercises", json={"exercise_id": exercise_id}, follow_redirects=False)
    plan_exercise_id = response.json()["plan_exercise_id"]
    workout_log_data = {
        "exercise_id": exercise_id,
        "sets": -1,  # Invalid
        "reps": 8,
        "weight": 50.0
    }
    response = client.post(f"/plans/{plan_id}/days/{day_id}/exercises/{plan_exercise_id}/log", json=workout_log_data, follow_redirects=False)
    assert response.status_code == 400
    assert "sets must be non-negative" in response.json()["detail"]