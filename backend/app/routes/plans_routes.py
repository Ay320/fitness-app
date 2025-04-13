

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.database import Database, get_database
from app.dependencies import get_current_user
from app.models.plans import Plan, PlanCreate, PlanUpdate, PlanDay, PlanDayCreate, PlanDayUpdate, PlanExercise, PlanExerciseCreate, Exercise, WorkoutLogCreate, WorkoutLog
import logging
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# Endpoints
@router.get("", response_model=List[Plan])
async def read_plans(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """List all plans for the authenticated user."""
    # Fetch user details using the uid from the decoded token
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Access user_id using dictionary key since database returns dicts
    user_id = user["user_id"]

    plans = db.get_plans(user_id)
    if not plans:
        return []  # Return empty list if no plans exist
    return plans

@router.get("/{plan_id}", response_model=Plan)
async def read_plan(
    plan_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Get details of a specific plan."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.post("", response_model=Plan, status_code=201)
async def create_plan(
    plan: PlanCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Create a new plan."""
    try:
        user = db.get_user_by_firebase_uid(current_user["uid"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user["user_id"]

        # Validate days_per_week
        if not (1 <= plan.days_per_week <= 7):
            raise HTTPException(status_code=400, detail="days_per_week must be between 1 and 7")

        # Create the plan
        plan_id = db.create_plan(
            user_id=user_id,
            name=plan.name,
            description=plan.description,
            days_per_week=plan.days_per_week,
            preferred_days=plan.preferred_days
        )
        return {
            "name": plan.name,
            "description": plan.description if plan.description is not None else None,
            "days_per_week": plan.days_per_week,
            "preferred_days": plan.preferred_days if plan.preferred_days is not None else None,
            "plan_id": plan_id,
            "user_id": user_id,
            "is_active": False  # Default value for new plans
        }
    except Exception as e:
        logger.error(f"Error in create_plan: {str(e)}")
        raise

@router.put("/{plan_id}", response_model=Plan)
async def update_plan(
    plan_id: int,
    plan_update: PlanUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Update an existing plan."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Validate days_per_week
    if not (1 <= plan_update.days_per_week <= 7):
        raise HTTPException(status_code=400, detail="days_per_week must be between 1 and 7")

    # Update the plan
    db.update_plan(
        plan_id=plan_id,
        name=plan_update.name,
        description=plan_update.description,
        days_per_week=plan_update.days_per_week,
        preferred_days=plan_update.preferred_days
    )
    # Fetch updated plan to return
    updated_plan = db.get_plan(plan_id)
    return updated_plan

@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Delete a plan."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Delete the plan (cascades to days and exercises)
    db.delete_plan(plan_id)
    return {"message": "Plan deleted successfully"}

@router.put("/{plan_id}/set-active")
async def set_plan_active(
    plan_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Set a plan as active, deactivating all other plans for the user."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Deactivate all plans for the user
    db.cursor.execute(
        "UPDATE Plans SET is_active = FALSE WHERE user_id = %s",
        (user_id,)
    )
    # Activate the specified plan
    db.cursor.execute(
        "UPDATE Plans SET is_active = TRUE WHERE plan_id = %s",
        (plan_id,)
    )
    db.conn.commit()
    return {"message": f"Plan {plan_id} set as active"}

@router.get("/{plan_id}/days", response_model=List[PlanDay])
async def read_plan_days(
    plan_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """List all days for a specific plan."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    return db.get_plan_days(plan_id)

@router.post("/{plan_id}/days", response_model=PlanDay)
async def create_plan_day(
    plan_id: int,
    day: PlanDayCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Add a new day to a plan."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Validate day_number
    if day.day_number < 1:
        raise HTTPException(status_code=400, detail="day_number must be at least 1")

    # Create the day
    plan_day_id = db.create_plan_day(
        plan_id=plan_id,
        day_number=day.day_number,
        description=day.description
    )
    return {**day.dict(), "plan_day_id": plan_day_id, "plan_id": plan_id}

@router.put("/{plan_id}/days/{day_id}", response_model=PlanDay)
async def update_plan_day(
    plan_id: int,
    day_id: int,
    day_update: PlanDayUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Update an existing plan day."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Validate day ownership
    day = db.get_plan_day(day_id)
    if not day or day["plan_id"] != plan_id:
        raise HTTPException(status_code=404, detail="Day not found")

    # Validate day_number
    if day_update.day_number < 1:
        raise HTTPException(status_code=400, detail="day_number must be at least 1")

    # Update the day
    db.update_plan_day(
        plan_day_id=day_id,
        day_number=day_update.day_number,
        description=day_update.description
    )
    # Fetch updated day to return
    updated_day = db.get_plan_day(day_id)
    return updated_day

@router.delete("/{plan_id}/days/{day_id}")
async def delete_plan_day(
    plan_id: int,
    day_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Delete a plan day."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Validate day ownership
    day = db.get_plan_day(day_id)
    if not day or day["plan_id"] != plan_id:
        raise HTTPException(status_code=404, detail="Day not found")

    # Delete the day (cascades to exercises)
    db.delete_plan_day(day_id)
    return {"message": "Day deleted successfully"}

@router.get("/{plan_id}/days/{day_id}/exercises", response_model=List[PlanExercise])
async def read_plan_exercises(
    plan_id: int,
    day_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """List all exercises for a specific day."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Validate day ownership
    day = db.get_plan_day(day_id)
    if not day or day["plan_id"] != plan_id:
        raise HTTPException(status_code=404, detail="Day not found")

    exercises = db.get_plan_exercises(day_id)
    logger.info(f"Raw exercises data: {exercises}")  # Add logging

    return exercises

@router.post("/{plan_id}/days/{day_id}/exercises", response_model=PlanExercise)
async def add_exercise_to_day(
    plan_id: int,
    day_id: int,
    exercise: PlanExerciseCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Add an exercise to a specific day."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Validate day ownership
    day = db.get_plan_day(day_id)
    if not day or day["plan_id"] != plan_id:
        raise HTTPException(status_code=404, detail="Day not found")

    # Validate exercise exists
    exercise_details = db.get_exercise(exercise.exercise_id)
    if not exercise_details:
        raise HTTPException(status_code=404, detail="Exercise not found")

    # Add the exercise to the day
    plan_exercise_id = db.add_exercise_to_day(day_id, exercise.exercise_id)
    return {
        "plan_exercise_id": plan_exercise_id,
        "plan_day_id": day_id,
        "exercise_id": exercise.exercise_id,
        "exercise_name": exercise_details["exercise_name"],
        "category": exercise_details["category"],
        "primary_muscle": exercise_details["primary_muscle"],
        "recommended_sets": exercise_details["initial_recommended_sets"],
        "recommended_reps": exercise_details["initial_recommended_reps"],
        "recommended_duration": exercise_details["initial_recommended_time"]
    }

@router.delete("/{plan_id}/days/{day_id}/exercises/{exercise_id}")
async def remove_exercise_from_day(
    plan_id: int,
    day_id: int,
    exercise_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Remove an exercise from a specific day."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Validate day ownership
    day = db.get_plan_day(day_id)
    if not day or day["plan_id"] != plan_id:
        raise HTTPException(status_code=404, detail="Day not found")

    # Validate exercise exists in the day
    exercises = db.get_plan_exercises(day_id)
    exercise = next((ex for ex in exercises if ex["plan_exercise_id"] == exercise_id), None)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found in this day")

    # Remove the exercise
    db.remove_exercise_from_day(exercise_id)
    return {"message": "Exercise removed successfully"}


@router.post("/{plan_id}/days/{day_id}/exercises/{plan_exercise_id}/log", response_model=WorkoutLog)
async def log_workout(
    plan_id: int,
    day_id: int,
    plan_exercise_id: int,
    workout_log: WorkoutLogCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database)
):
    """Log a workout for a specific plan exercise."""
    user = db.get_user_by_firebase_uid(current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]

    # Validate plan ownership
    plan = db.get_plan(plan_id)
    if not plan or plan["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Validate day ownership
    day = db.get_plan_day(day_id)
    if not day or day["plan_id"] != plan_id:
        raise HTTPException(status_code=404, detail="Day not found")

    # Validate plan exercise exists and belongs to the day
    exercises = db.get_plan_exercises(day_id)
    plan_exercise = next((ex for ex in exercises if ex["plan_exercise_id"] == plan_exercise_id), None)
    if not plan_exercise:
        raise HTTPException(status_code=404, detail="Plan exercise not found")

    # Validate exercise_id matches the plan exercise
    if workout_log.exercise_id != plan_exercise["exercise_id"]:
        raise HTTPException(status_code=400, detail="Exercise ID does not match the plan exercise")

    # Validate sets and reps are non-negative
    if workout_log.sets < 0:
        raise HTTPException(status_code=400, detail="sets must be non-negative")
    if workout_log.reps < 0:
        raise HTTPException(status_code=400, detail="reps must be non-negative")
    if workout_log.weight is not None and workout_log.weight < 0:
        raise HTTPException(status_code=400, detail="weight must be non-negative")

    # Log the workout
    workout_log_id = db.log_workout(
        user_id=user_id,
        plan_exercise_id=plan_exercise_id,
        exercise_id=workout_log.exercise_id,
        sets=workout_log.sets,
        reps=workout_log.reps,
        duration_minutes=None,  # Not provided in the test, can be added if needed
        weight=workout_log.weight,
        notes=workout_log.notes
    )

    return {
        "workout_log_id": workout_log_id,
        "plan_exercise_id": plan_exercise_id,
        "exercise_id": workout_log.exercise_id,
        "sets": workout_log.sets,
        "reps": workout_log.reps,
        "weight": workout_log.weight,
        "notes": workout_log.notes,
        "created_at": datetime.now()
    }