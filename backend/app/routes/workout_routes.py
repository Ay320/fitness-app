from fastapi import APIRouter, Depends, HTTPException, Query
from app.dependencies import get_current_user
from app.database import get_database, Database
from app.models.workout import WorkoutLogCreate, WorkoutLogUpdate

router = APIRouter(prefix="/workouts", tags=["workouts"])

# GET /workouts: Retrieve all available exercises
@router.get("/")
async def get_workouts(current_user: dict = Depends(get_current_user)):
    """
    Retrieve a list of all available exercises from the Workout_Exercises table.
    Returns a list of exercises with their details (e.g., name, muscle groups, difficulty).
    """
    db = get_database()
    try:
        db.cursor.execute("SELECT * FROM Workout_Exercises")
        workouts = db.cursor.fetchall()
        return [{"id": row[0], "exercise_name": row[1], "primary_muscle": row[2], "secondary_muscle": row[3],
                 "difficulty": row[4], "category": row[5], "equipment": row[6],
                 "initial_recommended_sets": row[7], "initial_recommended_reps": row[8], "initial_recommended_time": row[9],
                 "instructions": row[10], "injury_prevention_tips": row[11], "image_url": row[12]}
                for row in workouts]
    finally:
        db.close()

# POST /workouts/log: Log a workout for the user
@router.post("/log")
async def log_workout(
    workout: WorkoutLogCreate,
    exercise_id: int = Query(...),
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_database)  
):
    """
    Log a workout for the authenticated user.
    Requires an exercise_id as a query parameter and workout details in the request body.
    Saves the workout to the Workout_Logs table and returns the log_id.
    """
    print(f"Received workout data: {workout.dict()}")  # Debug print
    # Get user_id from Firebase UID
    firebase_uid = current_user.get("uid")
    db.cursor.execute("SELECT user_id FROM Users WHERE firebase_uid = %s", (firebase_uid,))
    user = db.cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    # Verify the exercise exists
    db.cursor.execute("SELECT exercise_id FROM Workout_Exercises WHERE exercise_id = %s", (exercise_id,))
    if not db.cursor.fetchone():
        raise HTTPException(status_code=404, detail="Exercise not found")

    # Insert the workout log
    query = """
        INSERT INTO Workout_Logs (user_id, exercise_id, sets, reps, duration_minutes, weight, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        user_id,
        exercise_id,
        workout.sets,
        workout.reps,
        workout.duration_minutes,
        workout.weight,
        workout.notes
    )
    print(f"Inserting values: {values}")  # Debug print
    db.cursor.execute(query, values)
    db.conn.commit()
    print(f"Inserted log_id: {db.cursor.lastrowid}")  # Debug print
    return {"message": "Workout logged successfully", "log_id": db.cursor.lastrowid}


# GET /workouts/logs: Retrieve the user's workout logs
@router.get("/logs")
async def get_workout_logs(
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """
    Retrieve all workout logs for the authenticated user.
    Joins Workout_Logs with Workout_Exercises and Users to include exercise names.
    Orders logs by date_logged DESC, with a secondary sort by log_id DESC for consistent ordering.
    """
    firebase_uid = current_user.get("uid")
    db.cursor.execute(
        """
        SELECT wl.log_id, wl.user_id, wl.exercise_id, we.exercise_name, wl.date_logged,
               wl.sets, wl.reps, wl.duration_minutes, wl.weight, wl.notes
        FROM Workout_Logs wl
        JOIN Workout_Exercises we ON wl.exercise_id = we.exercise_id
        JOIN Users u ON wl.user_id = u.user_id
        WHERE u.firebase_uid = %s
        ORDER BY wl.date_logged DESC, wl.log_id DESC
        """,
        (firebase_uid,)
    )
    logs = db.cursor.fetchall()
    print(f"Fetched logs: {logs}")  # Debug print
    return [{"log_id": row[0], "user_id": row[1], "exercise_id": row[2], "exercise_name": row[3],
             "date_logged": str(row[4]), "sets": row[5], "reps": row[6],
             "duration_minutes": row[7], "weight": row[8], "notes": row[9]}
            for row in logs]


# PUT /workouts/logs/{log_id}: Update an existing workout log
@router.put("/logs/{log_id}")
async def update_workout_log(
    log_id: int,
    workout: WorkoutLogUpdate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """
    Update an existing workout log for the authenticated user.
    Accepts a partial update via WorkoutLogUpdate model and applies only the provided fields.
    Validates that updated fields are non-negative where applicable.
    """
    print(f"Received update data: {workout.dict()}")  # Debug print
    # Get user_id from Firebase UID
    firebase_uid = current_user.get("uid")
    db.cursor.execute("SELECT user_id FROM Users WHERE firebase_uid = %s", (firebase_uid,))
    user = db.cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    # Verify the log exists and belongs to the user
    db.cursor.execute(
        "SELECT log_id FROM Workout_Logs WHERE log_id = %s AND user_id = %s",
        (log_id, user_id)
    )
    log = db.cursor.fetchone()
    if not log:
        raise HTTPException(status_code=404, detail="Workout log not found or not owned by user")

    # Build dynamic update query using exclude_unset=True
    updates = workout.dict(exclude_unset=True)
    print(f"Updates to apply: {updates}")  # Debug print
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Validate input
    if "sets" in updates and updates["sets"] < 0:
        raise HTTPException(status_code=400, detail="Sets must be non-negative")
    if "reps" in updates and updates["reps"] < 0:
        raise HTTPException(status_code=400, detail="Reps must be non-negative")
    if "duration_minutes" in updates and updates["duration_minutes"] < 0:
        raise HTTPException(status_code=400, detail="Duration must be non-negative")
    if "weight" in updates and updates["weight"] < 0:
        raise HTTPException(status_code=400, detail="Weight must be non-negative")

    # Build the update query
    update_fields = [f"{key} = %s" for key in updates.keys()]
    update_values = list(updates.values())
    update_values.extend([log_id, user_id])
    update_query = f"""
    UPDATE Workout_Logs
    SET {', '.join(update_fields)}
    WHERE log_id = %s AND user_id = %s
    """
    print(f"Update query: {update_query}, Values: {update_values}")  # Debug print
    db.cursor.execute(update_query, update_values)
    db.conn.commit()
    return {"message": "Workout log updated successfully"}

# DELETE /workouts/logs/{log_id}: Delete a workout log
@router.delete("/logs/{log_id}")
async def delete_workout_log(
    log_id: int,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """
    Delete a workout log for the authenticated user.
    Verifies that the log exists and belongs to the user before deletion.
    """
    firebase_uid = current_user.get("uid")
    db.cursor.execute("SELECT user_id FROM Users WHERE firebase_uid = %s", (firebase_uid,))
    user = db.cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    # Verify the log exists and belongs to the user
    db.cursor.execute(
        "SELECT log_id FROM Workout_Logs WHERE log_id = %s AND user_id = %s",
        (log_id, user_id)
    )
    log = db.cursor.fetchone()
    if not log:
        raise HTTPException(status_code=404, detail="Workout log not found or not owned by user")

    # Delete the workout log
    db.cursor.execute("DELETE FROM Workout_Logs WHERE log_id = %s AND user_id = %s", (log_id, user_id))
    db.conn.commit()
    return {"message": "Workout log deleted successfully"}



# TODO: Add pagination to GET /workouts/logs to handle large datasets
# TODO: Add logging for database errors and failed operations
# Future improvement: Add validation for exercise_id in POST /workouts/log to ensure it corresponds to a valid exercise