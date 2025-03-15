from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.database import get_database
from pydantic import BaseModel

router = APIRouter(prefix="/user", tags=["user"])

class UserProfileUpdate(BaseModel):
    username: str
    date_of_birth: str  # ISO format, e.g., "1990-01-01"
    gender: str
    weight_kg: float
    height_cm: float
    fitness_goal: str
    experience_level: str

@router.post("/profile")
async def update_user_profile(profile: UserProfileUpdate, decoded_token: dict = Depends(get_current_user)):
    firebase_uid = decoded_token.get("uid")
    db = get_database()
    try:
        user = db.get_user_by_firebase_uid(firebase_uid)
        if not user:
            raise ValueError("User not found")
        user_id = user[0]  # First column is user_id
        db.update_user_profile(
            user_id=user_id,
            username=profile.username,
            date_of_birth=profile.date_of_birth,
            gender=profile.gender,
            weight_kg=profile.weight_kg,
            height_cm=profile.height_cm,
            fitness_goal=profile.fitness_goal,
            experience_level=profile.experience_level
        )
        return {"message": "Profile updated", "user_id": user_id}
    except Exception as e:
        raise Exception(f"Failed to update profile: {str(e)}")
    finally:
        db.close()