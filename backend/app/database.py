import mysql.connector
from config.settings import settings
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_db_connection():
    logger.debug(f"Connecting with host={settings.DB_HOST}, user={settings.DB_USER}, database={settings.DB_NAME}")
    try:
        return mysql.connector.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            ssl_ca="config/rds-ca.pem",  # Path relative to the project root
            ssl_verify_cert=True
        )
    except mysql.connector.Error as err:
        logger.error(f"Database connection failed: {err}")
        raise

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
        self.cursor.execute("SELECT user_id FROM Users WHERE firebase_uid = %s", (firebase_uid,))
        return self.cursor.fetchone()[0]

    def update_user_profile(self, user_id: int, username: str, date_of_birth: str, gender: str,
                       weight_kg: float, height_cm: float, fitness_goal: str, experience_level: str):
        try:
            self.cursor.execute(
                "UPDATE Users SET username=%s, date_of_birth=%s, gender=%s, weight_kg=%s, height_cm=%s, "
                "fitness_goal=%s, experience_level=%s WHERE user_id=%s",
                (username, date_of_birth, gender, weight_kg, height_cm, fitness_goal, experience_level, user_id)
            )
            self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise

    def get_user_by_firebase_uid(self, firebase_uid: str):
        self.cursor.execute("SELECT * FROM Users WHERE firebase_uid = %s", (firebase_uid,))
        return self.cursor.fetchone()

    def close(self):
        self.cursor.close()
        self.conn.close()

def get_database():
    return Database(get_db_connection())