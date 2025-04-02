from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Plan Models
class PlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    days_per_week: int  # e.g., 3 for a 3-day workout plan
    preferred_days: Optional[str] = None  # e.g., "Mon,Wed,Fri"

class PlanCreate(PlanBase):
    pass

class PlanUpdate(PlanBase):
    pass

class Plan(PlanBase):
    plan_id: int
    user_id: int
    is_active: bool = True

    class Config:
        from_attributes = True  # Allows mapping from SQLAlchemy or dicts

# Day Models
class PlanDayBase(BaseModel):
    day_number: int  # e.g., Day 1, Day 2
    description: Optional[str] = None

class PlanDayCreate(PlanDayBase):
    pass

class PlanDayUpdate(PlanDayBase):
    pass

class PlanDay(PlanDayBase):
    plan_day_id: int
    plan_id: int

    class Config:
        from_attributes = True

# Exercise Models
class PlanExerciseBase(BaseModel):
    exercise_id: int  # References an existing exercise in an Exercises table

class PlanExerciseCreate(PlanExerciseBase):
    pass

class PlanExercise(PlanExerciseBase):
    plan_exercise_id: int
    plan_day_id: int
    exercise_name: str  # Added to match database result
    category: str  # Added to match database result
    primary_muscle: str  # Added to match database result
    recommended_sets: Optional[str] = None  # Added to match database result
    recommended_reps: Optional[str] = None  # Added to match database result
    recommended_duration: Optional[str] = None  # Added to match database result

    class Config:
        from_attributes = True


# Workout Log Models
class WorkoutLogBase(BaseModel):
    exercise_id: int
    sets: int
    reps: int
    weight: Optional[float] = None
    notes: Optional[str] = None

class WorkoutLogCreate(WorkoutLogBase):
    pass

class WorkoutLog(WorkoutLogBase):
    workout_log_id: int
    plan_exercise_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Assume an Exercise model exists for detailed info
class Exercise(BaseModel):
    exercise_id: int
    exercise_name: str
    instructions: Optional[str] = None
    primary_muscle: str
    secondary_muscle: Optional[str] = None
    difficulty: str
    category: str
    equipment: Optional[str] = None
    initial_recommended_sets: Optional[str] = None
    initial_recommended_reps: Optional[str] = None
    initial_recommended_time: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True