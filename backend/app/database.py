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
        self.cursor.execute("SELECT user_id FROM Users WHERE firebase_uid = %s", (firebase_uid,))
        return self.cursor.fetchone()[0]  # Return user_id

    def update_user_profile(self, user_id: int, username: str, date_of_birth: str, gender: str,
                           weight_kg: float, height_cm: float, fitness_goal: str, experience_level: str):
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

    def log_workout(self, user_id: int, exercise_id: int, sets: int, reps: int, duration_minutes: float,
                    weight: float, notes: str):
        self.cursor.execute(
            "INSERT INTO Workout_Logs (user_id, exercise_id, sets, reps, duration_minutes, weight, notes) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (user_id, exercise_id, sets, reps, duration_minutes, weight, notes)
        )
        self.conn.commit()

    def close(self):
        self.cursor.close()
        self.conn.close()

def get_database():
    return Database(get_db_connection())