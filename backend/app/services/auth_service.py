from app.database import get_db_connection

def sync_user(uid: str, email: str):
    db = get_db_connection()
    try:
        db.sync_user(uid, email)
        db.commit()
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to sync user: {str(e)}")
    finally:
        db.close()