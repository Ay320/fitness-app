from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.database import get_database, Database
from pydantic import BaseModel
from app.services.streak_service import update_streak
from typing import Dict, Any, Optional

router = APIRouter(prefix="/user", tags=["user"])

class UserProfileUpdate(BaseModel):
    username: str
    date_of_birth: str  # ISO format, e.g., "1990-01-01"
    gender: str
    weight_kg: float
    height_cm: float
    fitness_goal: str
    experience_level: str
    bio: Optional[str] = None



@router.get("/profile")
async def get_user_profile(decoded_token: dict = Depends(get_current_user)):
    """Fetch the authenticated user's profile data."""
    firebase_uid = decoded_token.get("uid")
    db = get_database()
    try:
        user = db.get_user_by_firebase_uid(firebase_uid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        # Exclude sensitive fields like firebase_uid from the response
        return {k: v for k, v in user.items() if k != "firebase_uid"}
    finally:
        db.close()


@router.post("/profile")
async def update_user_profile(profile: UserProfileUpdate, decoded_token: dict = Depends(get_current_user)):
    firebase_uid = decoded_token.get("uid")
    db = get_database()
    try:
        user = db.get_user_by_firebase_uid(firebase_uid)
        if not user:
            raise ValueError("User not found")
        user_id = user["user_id"]  
        db.update_user_profile(
            user_id=user_id,
            username=profile.username,
            date_of_birth=profile.date_of_birth,
            gender=profile.gender,
            weight_kg=profile.weight_kg,
            height_cm=profile.height_cm,
            fitness_goal=profile.fitness_goal,
            experience_level=profile.experience_level,
            bio=profile.bio 
        )
        return {"message": "Profile updated", "user_id": user_id}
    except Exception as e:
        raise Exception(f"Failed to update profile: {str(e)}")
    finally:
        db.close()


# Streaks feature:
@router.get("/streak", response_model=Dict[str, Any])
async def get_user_streak(decoded_token: dict = Depends(get_current_user), db: Database = Depends(get_database)):
    """Retrieve the user's current streak."""
    firebase_uid = decoded_token.get("uid")
    user = db.get_user_by_firebase_uid(firebase_uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user["user_id"]  

    # Update and return the streak
    streak = update_streak(db, user_id)
    return {"current_streak": streak}