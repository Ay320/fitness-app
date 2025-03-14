from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.database import get_database, get_db_connection
from pydantic import BaseModel

router = APIRouter(prefix="/user", tags=["user"])

class UserProfileUpdate(BaseModel):
    username: str
    date_of_birth: str
    gender: str
    weight_kg: float
    height_cm: float
    fitness_goal: str
    experience_level: str

@router.post("/profile")
async def update_user_profile(profile: UserProfileUpdate, uid: str = Depends(get_current_user)):
    db = get_database()
    try:
        user = db.get_user_by_firebase_uid(uid)
        if not user:
            raise ValueError("User not found")
        user_id = user[0]  # First column is user_id
        db.update_user_profile(user_id, profile.username, profile.date_of_birth, profile.gender,
                              profile.weight_kg, profile.height_cm, profile.fitness_goal, profile.experience_level)
        return {"message": "Profile updated", "user_id": user_id}
    except Exception as e:
        db.close()
        raise Exception(f"Failed to update profile: {str(e)}")
    finally:
        db.close()