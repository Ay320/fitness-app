from fastapi import HTTPException, Header
from firebase_REMOVED import auth

def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase token")