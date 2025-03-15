import logging
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.database import get_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/sync-user")
async def sync_user_route(decoded_token: dict = Depends(get_current_user)):
    firebase_uid = decoded_token.get("uid")
    email = decoded_token.get("email", "unknown@example.com")  # Fallback if email not in token
    logger.info(f"Received request for /sync-user with UID: {firebase_uid}")
    db = get_database()
    try:
        user_id = db.sync_user(firebase_uid, email)
        logger.info(f"Successfully synced user {firebase_uid} with email {email}")
        return {"message": "User synced", "uid": firebase_uid, "user_id": user_id}
    except Exception as e:
        logger.error(f"Error syncing user {firebase_uid}: {str(e)}")
        raise
    finally:
        db.close()
