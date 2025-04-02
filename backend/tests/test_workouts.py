from unittest.mock import patch



def create_test_exercises(db):
    """Insert test exercises into Workout_Exercises with predictable IDs."""
    # Clear the table to ensure predictable IDs
    db.cursor.execute("DELETE FROM Workout_Exercises")
    exercises = [
        ("Bench Press", "Strength", "Chest"),
        ("Squat", "Strength", "Legs"),
        ("Deadlift", "Strength", "Back")
    ]
    for i, exercise in enumerate(exercises, 1):
        db.cursor.execute(
            """
            INSERT INTO Workout_Exercises (exercise_id, exercise_name, category, primary_muscle)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE exercise_name=exercise_name
            """,
            (i,) + exercise
        )
    db.conn.commit()


# Test GET /workouts endpoint
def test_get_workouts(client, firebase_token, db):
    """
    Test the GET /workouts endpoint to retrieve all available exercises.
    Ensures the endpoint returns a list of at least 3 workouts with the expected fields.
    """
    create_test_exercises(db)
    headers = {"Authorization": f"Bearer {firebase_token}"}
    response = client.get("/workouts", headers=headers)
    assert response.status_code == 200
    workouts = response.json()
    assert len(workouts) >= 3  # We inserted 3 workouts
    assert "exercise_name" in workouts[0]
    assert "instructions" in workouts[0]  # Will be None since not set in create_test_exercises
    assert "injury_prevention_tips" in workouts[0]  # Will be None
    assert "initial_recommended_sets" in workouts[0]  # Will be None
    assert "initial_recommended_reps" in workouts[0]  # Will be None
    assert "initial_recommended_time" in workouts[0]  # Will be None


# Test POST /workouts/log endpoint
def test_log_workout(client, firebase_token, db):
    """
    Test the POST /workouts/log endpoint to log a workout for the user.
    Ensures the endpoint successfully logs a workout and returns a log_id.
    """
    headers = {"Authorization": f"Bearer {firebase_token}"}

    # Sync the user first
    sync_response = client.post("/auth/sync-user", headers=headers)
    assert sync_response.status_code == 200

    # Ensure exercises exist
    create_test_exercises(db)

    # Log a workout
    workout_data = {
        "sets": 3,
        "reps": 10,
        "duration_minutes": None,
        "weight": 50.0,
        "notes": "Felt strong today"
    }
    response = client.post("/workouts/log?exercise_id=1", json=workout_data, headers=headers)
    if response.status_code != 200:
        print(f"POST /workouts/log failed: {response.json()}")
    assert response.status_code == 200
    assert response.json()["message"] == "Workout logged successfully"
    assert "log_id" in response.json()


# Test GET /workouts/logs endpoint
def test_get_workout_logs(client, firebase_token, db):
    """
    Test the GET /workouts/logs endpoint to retrieve the user's workout logs.
    Logs a workout, retrieves the logs, and verifies the newly created log is present with the correct data.
    Updated to find the matching log by log_id instead of assuming the first log in the list.
    """
    headers = {"Authorization": f"Bearer {firebase_token}"}

    # Sync the user first
    sync_response = client.post("/auth/sync-user", headers=headers)
    assert sync_response.status_code == 200

    # Ensure exercises exist
    create_test_exercises(db)

    # Log a workout
    workout_data = {
        "sets": 3,
        "reps": 10,
        "duration_minutes": None,
        "weight": 50.0,
        "notes": "Felt strong today"
    }
    response = client.post("/workouts/log?exercise_id=1", json=workout_data, headers=headers)
    print(f"POST /workouts/log response: {response.json()}")  # Debug print
    log_id = response.json()["log_id"]

    # Retrieve workout logs
    response = client.get("/workouts/logs", headers=headers)
    if response.status_code != 200:
        print(f"GET /workouts/logs failed: {response.json()}")
    assert response.status_code == 200
    logs = response.json()
    print(f"Retrieved logs: {logs}")  # Debug print
    assert len(logs) >= 1

    # Find the log with the matching log_id
    # Changed from logs[0] to handle cases where logs are not ordered as expected
    matching_log = next((log for log in logs if log["log_id"] == log_id), None)
    assert matching_log is not None, f"Log with log_id {log_id} not found in retrieved logs"
    assert matching_log["exercise_name"] == "Bench Press"  # Matches the exercise with exercise_id=1
    assert matching_log["sets"] == 3
    assert matching_log["reps"] == 10
    assert matching_log["weight"] == 50.0
    assert matching_log["notes"] == "Felt strong today"


# Test PUT /workouts/logs/{log_id} endpoint
def test_update_workout_log(client, firebase_token, db):
    """
    Test the PUT /workouts/logs/{log_id} endpoint to update an existing workout log.
    Logs a workout, updates it with new sets and reps, and verifies the update is successful.
    """
    headers = {"Authorization": f"Bearer {firebase_token}"}

    # Sync the user
    sync_response = client.post("/auth/sync-user", headers=headers)
    assert sync_response.status_code == 200

    # Ensure exercises exist
    create_test_exercises(db)

    # Log a workout first
    workout_data = {
        "sets": 3,
        "reps": 10,
        "duration_minutes": None,
        "weight": 50.0,
        "notes": "Felt strong today"
    }
    log_response = client.post("/workouts/log?exercise_id=1", json=workout_data, headers=headers)
    print(f"POST /workouts/log response: {log_response.json()}")  # Debug print
    log_id = log_response.json()["log_id"]

    # Update the workout log
    updated_data = {
        "sets": 4,
        "reps": 12
    }
    response = client.put(f"/workouts/logs/{log_id}", json=updated_data, headers=headers)
    if response.status_code != 200:
        print(f"PUT /workouts/logs/{log_id} failed: {response.json()}")  # Debug print
    assert response.status_code == 200


# Test DELETE /workouts/logs/{log_id} endpoint
def test_delete_workout_log(client, firebase_token, db):
    """
    Test the DELETE /workouts/logs/{log_id} endpoint to delete a workout log.
    Logs a workout, deletes it, and verifies the deletion is successful.
    """
    headers = {"Authorization": f"Bearer {firebase_token}"}

    # Sync the user
    sync_response = client.post("/auth/sync-user", headers=headers)
    assert sync_response.status_code == 200

    # Ensure exercises exist
    create_test_exercises(db)

    # Log a workout first
    workout_data = {
        "sets": 3,
        "reps": 10,
        "duration_minutes": None,
        "weight": 50.0,
        "notes": "Felt strong today"
    }
    log_response = client.post("/workouts/log?exercise_id=1", json=workout_data, headers=headers)
    print(f"POST /workouts/log response: {log_response.json()}")  # Debug print
    log_id = log_response.json()["log_id"]

    # Delete the workout log
    response = client.delete(f"/workouts/logs/{log_id}", headers=headers)
    if response.status_code != 200:
        print(f"DELETE /workouts/logs/{log_id} failed: {response.json()}")  # Debug print
    assert response.status_code == 200


# TODO: Test with real Firebase tokens
# Future improvement: Add tests for edge cases (e.g., invalid exercise_id, negative sets/reps)