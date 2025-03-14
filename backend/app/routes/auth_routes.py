from fastapi import APIRouter, Depends
from app.dependencies import get_current_user  # For Firebase token verification
from app.database import get_db_connection  # For mock DB
from app import firebase_config 
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_database
import logging

security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])   # Define the router with the /auth prefix

@router.post("/sync-user")
async def sync_user_route(uid: str = Depends(get_current_user)):
    logger.info(f"Received request for /sync-user with UID: {uid}")
    db = get_database()
    try:
        # Sync user with minimal data (firebase_uid and email)
        email = "test@example.com"  # Replace with actual email from Firebase token if available
        db.sync_user(uid, email)
        logger.info(f"Successfully synced user {uid} with email {email}")
        return {"message": "User synced", "uid": uid}
    except Exception as e:
        db.close()
        logger.error(f"Error syncing user {uid}: {str(e)}")
        raise
    finally:
        db.close()
