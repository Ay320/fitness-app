from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

# Model for Workout Distribution by Type (Pie Chart)
class WorkoutDistribution(BaseModel):
    type: str
    count: int

# Model for Workout Distribution by Muscle Group (Pie Chart)
class MuscleGroupDistribution(BaseModel):
    muscle_group: str
    count: int


# Model for User Weight Progress (Line Chart) - Response Model
class WeightEntry(BaseModel):
    date: date  # Returns only the date part for the line chart
    weight: float

# Model for Logging a New Weight Entry 
class WeightCreate(BaseModel):
    weight_kg: float
    date_logged: Optional[datetime] = None  # Optional, defaults to CURRENT_TIMESTAMP in DB


# Model for Workout Frequency Trend (Line Chart) - Daily
class FrequencyEntry(BaseModel):
    date: date
    count: int

# Model for Workout Frequency Trend (Line Chart) - Weekly
class WeeklyFrequencyEntry(BaseModel):
    year: int
    week: int
    count: int