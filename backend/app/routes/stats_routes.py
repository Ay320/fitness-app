from fastapi import APIRouter, Depends, HTTPException
from datetime import date
from typing import List
from dependencies import get_current_user 
from app.database import get_database
from models.stats import (
    WorkoutDistribution,
    MuscleGroupDistribution,
    WeightEntry,
    WeightCreate,
    FrequencyEntry,
    WeeklyFrequencyEntry
)

router = APIRouter()

# Endpoint 1: Workout Distribution by Type
@router.get("/workouts/by-type", response_model=List[WorkoutDistribution])
async def get_workouts_by_type(
    start_date: date,
    end_date: date,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Fetch workout distribution by type within a time range."""
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
    
    query = """
        SELECT we.category AS type, COUNT(*) AS count
        FROM Workout_Logs wl
        JOIN Workout_Exercises we ON wl.exercise_id = we.exercise_id
        WHERE wl.user_id = %s AND DATE(wl.date) BETWEEN %s AND %s
        GROUP BY we.category
    """
    db.cursor.execute(query, (current_user["user_id"], start_date, end_date))
    results = db.cursor.fetchall()
    return [{"type": row[0], "count": row[1]} for row in results]

# Endpoint 2: Workout Distribution by Muscle Group
@router.get("/workouts/by-muscle-group", response_model=List[MuscleGroupDistribution])
async def get_workouts_by_muscle_group(
    start_date: date,
    end_date: date,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Fetch workout distribution by muscle group within a time range."""
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
    
    query = """
        SELECT we.primary_muscle AS muscle_group, COUNT(*) AS count
        FROM Workout_Logs wl
        JOIN Workout_Exercises we ON wl.exercise_id = we.exercise_id
        WHERE wl.user_id = %s AND DATE(wl.date) BETWEEN %s AND %s
        GROUP BY we.primary_muscle
    """
    db.cursor.execute(query, (current_user["user_id"], start_date, end_date))
    results = db.cursor.fetchall()
    return [{"muscle_group": row[0], "count": row[1]} for row in results]

# Endpoint 3: User Weight Progress (GET)
@router.get("/weight/history", response_model=List[WeightEntry])
async def get_weight_history(
    start_date: date,
    end_date: date,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Fetch user's weight history within a time range."""
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
    
    query = """
        SELECT DATE(date_logged) AS date, AVG(weight_kg) AS weight
        FROM Weight_History
        WHERE user_id = %s AND DATE(date_logged) BETWEEN %s AND %s
        GROUP BY DATE(date_logged)
        ORDER BY DATE(date_logged)
    """
    db.cursor.execute(query, (current_user["user_id"], start_date, end_date))
    results = db.cursor.fetchall()
    return [{"date": row[0], "weight": row[1]} for row in results]

# Endpoint 4: Log a New Weight Entry (POST)
@router.post("/weight", response_model=WeightEntry)
async def log_weight(
    weight_entry: WeightCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Log a new weight entry for the user."""
    # If date_logged is not provided, the database will use CURRENT_TIMESTAMP
    if weight_entry.date_logged:
        query = """
            INSERT INTO Weight_History (user_id, date_logged, weight_kg)
            VALUES (%s, %s, %s)
        """
        values = (current_user["user_id"], weight_entry.date_logged, weight_entry.weight_kg)
    else:
        query = """
            INSERT INTO Weight_History (user_id, weight_kg)
            VALUES (%s, %s)
        """
        values = (current_user["user_id"], weight_entry.weight_kg)
    
    try:
        db.cursor.execute(query, values)
        db.conn.commit()
    except Exception as e:
        db.conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to log weight: {str(e)}")

    # Update the current weight in the Users table
    update_query = """
        UPDATE Users
        SET weight_kg = %s, last_updated = CURRENT_TIMESTAMP
        WHERE user_id = %s
    """
    try:
        db.cursor.execute(update_query, (weight_entry.weight_kg, current_user["user_id"]))
        db.conn.commit()
    except Exception as e:
        db.conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update user weight: {str(e)}")

    # Fetch the inserted entry to return (use the latest entry for this user on that date)
    fetch_query = """
        SELECT DATE(date_logged) AS date, weight_kg AS weight
        FROM Weight_History
        WHERE user_id = %s AND DATE(date_logged) = %s
        ORDER BY date_logged DESC
        LIMIT 1
    """
    # If date_logged was provided, use it; otherwise, use today's date (since CURRENT_TIMESTAMP was used)
    fetch_date = weight_entry.date_logged.date() if weight_entry.date_logged else date.today()
    db.cursor.execute(fetch_query, (current_user["user_id"], fetch_date))
    result = db.cursor.fetchone()
    
    if not result:
        raise HTTPException(status_code=500, detail="Failed to fetch the logged weight entry")

    return {"date": result[0], "weight": result[1]}

# Endpoint 5: Workout Frequency Trend
@router.get("/workouts/frequency")
async def get_workout_frequency(
    start_date: date,
    end_date: date,
    granularity: str = "daily",
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Fetch workout frequency trend within a time range, with daily or weekly granularity."""
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
    if granularity not in ["daily", "weekly"]:
        raise HTTPException(status_code=400, detail="Invalid granularity. Use 'daily' or 'weekly'")

    if granularity == "daily":
        query = """
            SELECT DATE(wl.date) AS date, COUNT(*) AS count
            FROM Workout_Logs wl
            WHERE wl.user_id = %s AND DATE(wl.date) BETWEEN %s AND %s
            GROUP BY DATE(wl.date)
        """
        db.cursor.execute(query, (current_user["user_id"], start_date, end_date))
        results = db.cursor.fetchall()
        return [{"date": row[0], "count": row[1]} for row in results]
    else:  # weekly
        query = """
            SELECT YEAR(wl.date) AS year, WEEK(wl.date) AS week, COUNT(*) AS count
            FROM Workout_Logs wl
            WHERE wl.user_id = %s AND DATE(wl.date) BETWEEN %s AND %s
            GROUP BY YEAR(wl.date), WEEK(wl.date)
        """
        db.cursor.execute(query, (current_user["user_id"], start_date, end_date))
        results = db.cursor.fetchall()
        return [{"year": row[0], "week": row[1], "count": row[2]} for row in results]