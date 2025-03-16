from fastapi import Header, HTTPException
import os
from firebase_REMOVED import auth
from config.settings import Settings

settings = Settings()

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    try:
        if os.getenv("FIREBASE_AUTH_EMULATOR_HOST"):
            # For emulator: decode token without strict iss/aud checks
            decoded_token = auth.verify_id_token(token, check_revoked=False)
            # Optionally, log the decoded token for debugging
            print(f"Decoded emulator token: {decoded_token}")
            return decoded_token
        else:
            # For production: enforce strict validation
            decoded_token = auth.verify_id_token(token, check_revoked=True)
            expected_iss = f"https://securetoken.google.com/{settings.FIREBASE_PROJECT_ID}"
            if decoded_token.get("iss") != expected_iss:
                raise HTTPException(status_code=401, detail="Invalid issuer")
            if decoded_token.get("aud") != settings.FIREBASE_PROJECT_ID:
                raise HTTPException(status_code=401, detail="Invalid audience")
            return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired Firebase token: {str(e)}")