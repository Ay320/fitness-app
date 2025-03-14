'''
# Temporary mock database (replace with MySQL later)
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MockDB:
    def __init__(self):
        self.users = {}  # uid: email

    def sync_user(self, uid: str, email: str):
        self.users[uid] = email
        logger.info(f"Mock DB: Synced user {uid} with email {email}")
        return True

    def commit(self):
        pass

    def rollback(self):
        pass

    def close(self):
        pass

mock_db = MockDB()

def get_db_connection():
    return mock_db '''

import mysql.connector
from config.settings import settings

def get_db_connection():
    return mysql.connector.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME
    )

class Database:
    def __init__(self, connection):
        self.conn = connection
        self.cursor = self.conn.cursor()

    def sync_user(self, firebase_uid: str, email: str):
        self.cursor.execute(
            "INSERT INTO Users (firebase_uid, email) VALUES (%s, %s) ON DUPLICATE KEY UPDATE email=%s",
            (firebase_uid, email, email)
        )
        self.conn.commit()
        return self.cursor.lastrowid

    def update_user_profile(self, user_id: int, username: str, date_of_birth: str, gender: str, weight_kg: float,
                           height_cm: float, fitness_goal: str, experience_level: str):
        self.cursor.execute(
            "UPDATE Users SET username=%s, date_of_birth=%s, gender=%s, weight_kg=%s, height_cm=%s, "
            "fitness_goal=%s, experience_level=%s WHERE user_id=%s",
            (username, date_of_birth, gender, weight_kg, height_cm, fitness_goal, experience_level, user_id)
        )
        self.conn.commit()

    def get_user_by_firebase_uid(self, firebase_uid: str):
        self.cursor.execute("SELECT user_id, username, email, date_of_birth, gender, weight_kg, height_cm, "
                            "fitness_goal, experience_level, created_at FROM Users WHERE firebase_uid = %s", (firebase_uid,))
        return self.cursor.fetchone()

    def close(self):
        self.cursor.close()
        self.conn.close()

def get_database():
    return Database(get_db_connection())