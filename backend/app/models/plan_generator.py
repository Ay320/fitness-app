from pydantic import BaseModel
from typing import Optional, Dict, List, Any

class GeneratePlanRequest(BaseModel):
    """Input model for generating a workout plan."""
    days_per_week: int
    preferences: Optional[Dict[str, List[str]]] = None  # e.g., {"equipment": ["no dumbbells"], "exercises": ["no deadlifts"]}
    plan_name: Optional[str] = None
    description: Optional[str] = None

class GeneratedPlanDay(BaseModel):
    """Model for a single day in the generated plan."""
    day_number: int
    description: str
    exercises: List[Dict[str, Any]]  # Exercise details with recommended sets/reps

class GeneratedPlan(BaseModel):
    """Output model for the generated workout plan."""
    plan_id: int
    name: str
    description: Optional[str]
    days_per_week: int
    preferred_days: Optional[str]
    is_active: bool
    days: List[GeneratedPlanDay]