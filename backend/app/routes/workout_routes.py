from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.database import get_database

router = APIRouter(prefix="/workouts", tags=["workouts"])

# GET /workouts: Retrieve all available exercises
@router.get("/")
async def get_workouts(current_user: dict = Depends(get_current_user)):
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
    exercise_id: int,
    sets: int = None,
    reps: int = None,
    duration_minutes: float = None,
    weight: float = None,
    notes: str = None,
    current_user: dict = Depends(get_current_user)
):
    # Validate input
    if sets is not None and sets < 0:
        raise HTTPException(status_code=400, detail="Sets must be non-negative")
    if reps is not None and reps < 0:
        raise HTTPException(status_code=400, detail="Reps must be non-negative")
    if duration_minutes is not None and duration_minutes < 0:
        raise HTTPException(status_code=400, detail="Duration must be non-negative")
    if weight is not None and weight < 0:
        raise HTTPException(status_code=400, detail="Weight must be non-negative")

    # Get user_id from Firebase UID
    user_id = None
    db = get_database()
    try:
        firebase_uid = current_user.get("uid")
        db.cursor.execute("SELECT user_id FROM Users WHERE firebase_uid = %s", (firebase_uid,))
        user = db.cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user[0]

        # Verify the exercise exists
        db.cursor.execute("SELECT exercise_id FROM Workout_Exercises WHERE exercise_id = %s", (exercise_id,))
        exercise = db.cursor.fetchone()
        if not exercise:
            raise HTTPException(status_code=404, detail="Exercise not found")

        # Insert the workout log
        db.cursor.execute(
            """
            INSERT INTO Workout_Logs (user_id, exercise_id, sets, reps, duration_minutes, weight, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (user_id, exercise_id, sets, reps, duration_minutes, weight, notes)
        )
        db.conn.commit()
        return {"message": "Workout logged successfully", "log_id": db.cursor.lastrowid}
    finally:
        db.close()

# GET /workouts/logs: Retrieve the user's workout logs
@router.get("/logs")
async def get_workout_logs(current_user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        firebase_uid = current_user.get("uid")
        db.cursor.execute(
            """
            SELECT wl.log_id, wl.user_id, wl.exercise_id, we.exercise_name, wl.date_logged,
                   wl.sets, wl.reps, wl.duration_minutes, wl.weight, wl.notes
            FROM Workout_Logs wl
            JOIN Workout_Exercises we ON wl.exercise_id = we.exercise_id
            JOIN Users u ON wl.user_id = u.user_id
            WHERE u.firebase_uid = %s
            ORDER BY wl.date_logged DESC
            """,
            (firebase_uid,)
        )
        logs = db.cursor.fetchall()
        return [{"log_id": row[0], "user_id": row[1], "exercise_id": row[2], "exercise_name": row[3],
                 "date_logged": str(row[4]), "sets": row[5], "reps": row[6],
                 "duration_minutes": row[7], "weight": row[8], "notes": row[9]}
                for row in logs]
    finally:
        db.close()


# PUT /workouts/logs/{log_id}: Update an existing workout log
@router.put("/logs/{log_id}")
async def update_workout_log(
    log_id: int,
    sets: int = None,
    reps: int = None,
    duration_minutes: float = None,
    weight: float = None,
    notes: str = None,
    current_user: dict = Depends(get_current_user)
):
    # Validate input
    if sets is not None and sets < 0:
        raise HTTPException(status_code=400, detail="Sets must be non-negative")
    if reps is not None and reps < 0:
        raise HTTPException(status_code=400, detail="Reps must be non-negative")
    if duration_minutes is not None and duration_minutes < 0:
        raise HTTPException(status_code=400, detail="Duration must be non-negative")
    if weight is not None and weight < 0:
        raise HTTPException(status_code=400, detail="Weight must be non-negative")

    # Get user_id from Firebase UID
    db = get_database()
    try:
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

        # Update the workout log
        update_fields = []
        update_values = []
        if sets is not None:
            update_fields.append("sets = %s")
            update_values.append(sets)
        if reps is not None:
            update_fields.append("reps = %s")
            update_values.append(reps)
        if duration_minutes is not None:
            update_fields.append("duration_minutes = %s")
            update_values.append(duration_minutes)
        if weight is not None:
            update_fields.append("weight = %s")
            update_values.append(weight)
        if notes is not None:
            update_fields.append("notes = %s")
            update_values.append(notes)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_values.extend([log_id, user_id])
        update_query = f"""
        UPDATE Workout_Logs
        SET {', '.join(update_fields)}
        WHERE log_id = %s AND user_id = %s
        """
        db.cursor.execute(update_query, update_values)
        db.conn.commit()
        return {"message": "Workout log updated successfully"}
    finally:
        db.close()

# DELETE /workouts/logs/{log_id}: Delete a workout log
@router.delete("/logs/{log_id}")
async def delete_workout_log(log_id: int, current_user: dict = Depends(get_current_user)):
    db = get_database()
    try:
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
    finally:
        db.close()