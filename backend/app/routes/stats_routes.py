from fastapi import APIRouter, Depends, HTTPException
from datetime import date, datetime
from typing import List
from app.dependencies import get_current_user
from app.database import get_database
from app.models.stats import (
    WorkoutDistribution,
    MuscleGroupDistribution,
    WeightEntry,
    WeightCreate,
    FrequencyEntry,
    WeeklyFrequencyEntry
)

router = APIRouter()

# Helper function to fetch user_id from uid
def get_user_id_from_uid(db, uid: str) -> int:
    """Fetch the user_id from the Users table based on the Firebase uid."""
    db.cursor.execute("SELECT user_id FROM Users WHERE firebase_uid = %s", (uid,))
    result = db.cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result["user_id"]

# Endpoint 1: Workout Distribution by Type
@router.get("/workouts/by-type", response_model=List[WorkoutDistribution])
async def get_workouts_by_type(
    start_date: str,
    end_date: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Fetch workout distribution by type within a time range."""
    # Parse the date strings into date objects
    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
    
    # Fetch user_id from the database using the uid from current_user
    user_id = get_user_id_from_uid(db, current_user["uid"])

    query = """
        SELECT we.category AS type, COUNT(*) AS count
        FROM Workout_Logs wl
        JOIN Workout_Exercises we ON wl.exercise_id = we.exercise_id
        WHERE wl.user_id = %s AND DATE(wl.date_logged) BETWEEN %s AND %s
        GROUP BY we.category
    """
    db.cursor.execute(query, (user_id, start_date, end_date))
    results = db.cursor.fetchall()
    return [{"type": row["type"], "count": row["count"]} for row in results]

# Endpoint 2: Workout Distribution by Muscle Group
@router.get("/workouts/by-muscle-group", response_model=List[MuscleGroupDistribution])
async def get_workouts_by_muscle_group(
    start_date: str,
    end_date: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Fetch workout distribution by muscle group within a time range."""
    # Parse the date strings into date objects
    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
    
    # Fetch user_id from the database using the uid from current_user
    user_id = get_user_id_from_uid(db, current_user["uid"])

    query = """
        SELECT we.primary_muscle AS muscle_group, COUNT(*) AS count
        FROM Workout_Logs wl
        JOIN Workout_Exercises we ON wl.exercise_id = we.exercise_id
        WHERE wl.user_id = %s AND DATE(wl.date_logged) BETWEEN %s AND %s
        GROUP BY we.primary_muscle
    """
    db.cursor.execute(query, (user_id, start_date, end_date))
    results = db.cursor.fetchall()
    return [{"muscle_group": row["muscle_group"], "count": row["count"]} for row in results]

# Endpoint 3: User Weight Progress (GET)
@router.get("/weight/history", response_model=List[WeightEntry])
async def get_weight_history(
    start_date: str,
    end_date: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Fetch user's weight history within a time range."""
    # Parse the date strings into date objects
    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
    
    # Fetch user_id from the database using the uid from current_user
    user_id = get_user_id_from_uid(db, current_user["uid"])

    query = """
        SELECT DATE(date_logged) AS date, AVG(weight_kg) AS weight
        FROM Weight_History
        WHERE user_id = %s AND DATE(date_logged) BETWEEN %s AND %s
        GROUP BY DATE(date_logged)
        ORDER BY DATE(date_logged)
    """
    db.cursor.execute(query, (user_id, start_date, end_date))
    results = db.cursor.fetchall()
    return [{"date": row["date"], "weight": row["weight"]} for row in results]

# Endpoint 4: Log a New Weight Entry (POST)
@router.post("/weight", response_model=WeightEntry)
async def log_weight(
    weight_entry: WeightCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Log a new weight entry for the user."""
    # Fetch user_id from the database using the uid from current_user
    user_id = get_user_id_from_uid(db, current_user["uid"])

    # If date_logged is not provided, the database will use CURRENT_TIMESTAMP
    if weight_entry.date_logged:
        query = """
            INSERT INTO Weight_History (user_id, date_logged, weight_kg)
            VALUES (%s, %s, %s)
        """
        values = (user_id, weight_entry.date_logged, weight_entry.weight_kg)
    else:
        query = """
            INSERT INTO Weight_History (user_id, weight_kg)
            VALUES (%s, %s)
        """
        values = (user_id, weight_entry.weight_kg)
    
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
        db.cursor.execute(update_query, (weight_entry.weight_kg, user_id))
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
    db.cursor.execute(fetch_query, (user_id, fetch_date))
    result = db.cursor.fetchone()
    
    if not result:
        raise HTTPException(status_code=500, detail="Failed to fetch the logged weight entry")

    return {"date": result["date"], "weight": result["weight"]}

# Endpoint 5: Workout Frequency Trend
@router.get("/workouts/frequency")
async def get_workout_frequency(
    start_date: str,
    end_date: str,
    granularity: str = "daily",
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Fetch workout frequency trend within a time range, with daily or weekly granularity."""
    # Parse the date strings into date objects
    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
    if granularity not in ["daily", "weekly"]:
        raise HTTPException(status_code=400, detail="Invalid granularity. Use 'daily' or 'weekly'")

    # Fetch user_id from the database using the uid from current_user
    user_id = get_user_id_from_uid(db, current_user["uid"])

    if granularity == "daily":
        query = """
            SELECT DATE(wl.date_logged) AS date, COUNT(*) AS count
            FROM Workout_Logs wl
            WHERE wl.user_id = %s AND DATE(wl.date_logged) BETWEEN %s AND %s
            GROUP BY DATE(wl.date_logged)
        """
        db.cursor.execute(query, (user_id, start_date, end_date))
        results = db.cursor.fetchall()
        return [{"date": row["date"], "count": row["count"]} for row in results]
    else:  # weekly
        query = """
            SELECT YEAR(wl.date_logged) AS year, WEEK(wl.date_logged) AS week, COUNT(*) AS count
            FROM Workout_Logs wl
            WHERE wl.user_id = %s AND DATE(wl.date_logged) BETWEEN %s AND %s
            GROUP BY YEAR(wl.date_logged), WEEK(wl.date_logged)
        """
        db.cursor.execute(query, (user_id, start_date, end_date))
        results = db.cursor.fetchall()
        return [{"year": row["year"], "week": row["week"], "count": row["count"]} for row in results]