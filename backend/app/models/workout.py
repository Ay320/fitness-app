from pydantic import BaseModel
from typing import Optional

class WorkoutLogCreate(BaseModel):
    sets: Optional[int]
    reps: Optional[int]
    duration_minutes: Optional[float] = None
    weight: Optional[float] = None
    notes: Optional[str] = None


class WorkoutLogUpdate(BaseModel):
    sets: Optional[int] = None
    reps: Optional[int] = None
    duration_minutes: Optional[float] = None
    weight: Optional[float] = None
    notes: Optional[str] = None