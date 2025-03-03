
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user  # For Firebase token verification
from app.database import get_db_connection  # For mock DB
from app import firebase_config 
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


security = HTTPBearer()



router = APIRouter(prefix="/auth", tags=["auth"])  # Define the router with the /auth prefix
security = HTTPBearer()

@router.post("/sync-user")
async def sync_user_route(uid: str = Depends(get_current_user)):
    db = get_db_connection()
    try:
        db.sync_user(uid, "mock_email@example.com")  # Mock syncing for testing
        db.commit()
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to sync user: {str(e)}")
    finally:
        db.close()
    return {"message": "User synced", "uid": uid}

