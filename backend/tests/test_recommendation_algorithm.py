import pytest
from fastapi.testclient import TestClient
from app.database import Database
from datetime import date, timedelta
from .test_plans import create_user, create_exercise  # Import helper functions


# Test Cases
def test_generate_plan_basic(client: TestClient, db: Database):
    """Test generating a basic plan for 3 days."""
    create_user(db, "testuser1", "test1@example.com")
    plan_data = {
        "days_per_week": 3,
        "preferences": {},
        "plan_name": "Basic 3-Day Plan",
        "description": "A basic push/pull/legs plan"
    }
    response = client.post("/plans/generate", json=plan_data)
    assert response.status_code == 201
    plan = response.json()
    assert plan["name"] == "Basic 3-Day Plan"
    assert plan["days_per_week"] == 3
    assert len(plan["days"]) == 3
    assert plan["days"][0]["description"] == "Push Day"
    assert plan["days"][1]["description"] == "Pull Day"
    assert plan["days"][2]["description"] == "Legs Day"


def test_generate_plan_with_preferences(client: TestClient, db: Database):
    """Test generating a plan with preferences (no dumbbells, no deadlifts)."""
    create_user(db, "testuser1", "test1@example.com")
    plan_data = {
        "days_per_week": 4,
        "preferences": {"equipment": ["dumbbells"], "exercises": ["deadlifts"]},
        "plan_name": "No Dumbbells Plan",
        "description": "A plan avoiding dumbbells and deadlifts"
    }
    response = client.post("/plans/generate", json=plan_data)
    assert response.status_code == 201
    plan = response.json()
    assert plan["name"] == "No Dumbbells Plan"
    assert plan["days_per_week"] == 4
    assert len(plan["days"]) == 4
    for day in plan["days"]:
        for exercise in day["exercises"]:
            assert "dumbbells" not in (exercise.get("equipment") or "").lower()
            assert "deadlifts" not in exercise["exercise_name"].lower()


def test_generate_plan_insufficient_exercises(client: TestClient, db: Database):
    """Test generating a plan with limited exercise options."""
    create_user(db, "testuser1", "test1@example.com")
    create_exercise(db, "Bench Press", "Strength", "Chest", secondary_muscle="Triceps", equipment="Barbell")
    create_exercise(db, "Pull-Ups", "Strength", "Back", secondary_muscle="Biceps", equipment="Pull-Up Bar")
    plan_data = {
        "days_per_week": 3,
        "preferences": {"equipment": ["dumbbells"]},
        "plan_name": "Limited Exercises Plan",
        "description": "A plan with limited exercise options"
    }
    response = client.post("/plans/generate", json=plan_data)
    assert response.status_code == 201
    plan = response.json()
    assert len(plan["days"]) == 3
    for day in plan["days"]:
        assert len(day["exercises"]) <= 3  # Assuming a max of 3 exercises per day


def test_generate_plan_muscle_coverage(client: TestClient, db: Database):
    """Test that the plan covers required muscle groups, including secondary muscles."""
    create_user(db, "testuser1", "test1@example.com")
    create_exercise(db, "Bench Press", "Strength", "Chest", secondary_muscle="Triceps", equipment="Barbell")
    create_exercise(db, "Push-Ups", "Strength", "Chest", secondary_muscle="Triceps", equipment="Bodyweight")
    create_exercise(db, "Shoulder Press", "Strength", "Shoulders", secondary_muscle="Triceps", equipment="Barbell")
    plan_data = {
        "days_per_week": 3,
        "preferences": {},
        "plan_name": "Muscle Coverage Plan",
        "description": "A plan to test muscle coverage"
    }
    response = client.post("/plans/generate", json=plan_data)
    assert response.status_code == 201
    plan = response.json()
    triceps_covered = any(
        exercise.get("secondary_muscle") == "Triceps"
        for day in plan["days"]
        for exercise in day["exercises"]
    )
    assert triceps_covered, "Triceps should be covered through secondary muscles"


def test_generate_plan_legs_subcategories(client: TestClient, db: Database):
    """Test that leg exercises are selected based on subcategories (Quads, Hamstrings, Glutes)."""
    create_user(db, "testuser1", "test1@example.com")
    create_exercise(db, "Squats", "Strength", "Legs", equipment="Barbell")
    create_exercise(db, "Leg Press", "Strength", "Legs", equipment="Machine")
    create_exercise(db, "Hamstring Curls", "Strength", "Legs", equipment="Machine")
    create_exercise(db, "Bulgarian Split Squats", "Strength", "Legs", equipment="Dumbbells")
    plan_data = {
        "days_per_week": 3,
        "preferences": {},
        "plan_name": "Legs Subcategories Plan",
        "description": "A plan to test legs subcategories"
    }
    response = client.post("/plans/generate", json=plan_data)
    assert response.status_code == 201
    plan = response.json()
    legs_day = next((day for day in plan["days"] if day["description"] == "Legs Day"), None)
    assert legs_day is not None, "Legs Day should be present"
    exercises = [ex["exercise_name"] for ex in legs_day["exercises"]]
    assert any(ex in exercises for ex in ["Squats", "Leg Press"]), "Quads exercise missing"
    assert "Hamstring Curls" in exercises, "Hamstrings exercise missing"
    assert "Bulgarian Split Squats" in exercises, "Glutes exercise missing"


def test_generate_plan_volume_adjustment(client: TestClient, db: Database):
    """Test volume adjustment based on workout frequency."""
    create_user(db, "testuser1", "test1@example.com")
    exercise_id = create_exercise(db, "Bench Press", "Strength", "Chest", equipment="Barbell")
    db.cursor.execute(
        "INSERT INTO Workout_Logs (user_id, exercise_id, date_logged) VALUES (%s, %s, %s)",
        (1, exercise_id, date.today() - timedelta(days=7))
    )
    db.conn.commit()
    plan_data = {
        "days_per_week": 3,
        "preferences": {},
        "plan_name": "Low Frequency Plan",
        "description": "A plan with low workout frequency"
    }
    response = client.post("/plans/generate", json=plan_data)
    assert response.status_code == 201
    plan = response.json()
    for day in plan["days"]:
        for exercise in day["exercises"]:
            assert int(exercise["recommended_sets"]) < 4, "Volume should be reduced for low frequency"