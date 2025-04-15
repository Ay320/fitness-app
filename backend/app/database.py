import mysql.connector
from config.settings import settings
import logging
from typing import List, Optional, Dict, Any
import os
import time  # Added for retry delay in get_db_connection
from datetime import date

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_db_connection(max_retries=3, retry_delay=5):
    db_name = os.getenv("TEST_DATABASE", settings.DB_NAME)
    logger.info(f"Connecting to database: {db_name} (host={settings.DB_HOST}, user={settings.DB_USER})")
    for attempt in range(max_retries):
        try:
            conn = mysql.connector.connect(
                host=settings.DB_HOST,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=db_name,
                ssl_ca="config/rds-ca.pem",
                ssl_verify_cert=True,
                connection_timeout=30
            )
            # Set session variables after connection
            cursor = conn.cursor()
            cursor.execute("SET SESSION wait_timeout = 60")
            cursor.execute("SET SESSION interactive_timeout = 60")
            cursor.close()
            logger.info(f"Successfully connected to database: {db_name}")
            return conn
        except mysql.connector.Error as err:
            logger.error(f"Database connection failed (attempt {attempt + 1}/{max_retries}): {err}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise
        except Exception as e:
            logger.error(f"Unexpected error during database connection: {e}")
            raise

class Database:
    def __init__(self, connection):
        self.conn = connection
        # Use dictionary=True to return query results as dictionaries instead of tuples
        self.cursor = self.conn.cursor(dictionary=True)

    def clear_all_tables(self):
        """Clear all data from tables in the correct order to avoid foreign key constraints."""
        try:
            # Disable foreign key checks to avoid constraint issues during deletion
            self.cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

            # Clear tables in reverse order of dependency
            self.cursor.execute("DELETE FROM Workout_Logs")
            self.cursor.execute("DELETE FROM Weight_History")
            self.cursor.execute("DELETE FROM AI_Recommendations")
            self.cursor.execute("DELETE FROM Plan_Exercises")
            self.cursor.execute("DELETE FROM Plan_Days")
            self.cursor.execute("DELETE FROM Plans")
            self.cursor.execute("DELETE FROM Workout_Exercises")
            self.cursor.execute("DELETE FROM Users")

            # Reset AUTO_INCREMENT counters
            self.cursor.execute("ALTER TABLE Workout_Logs AUTO_INCREMENT = 1")
            self.cursor.execute("ALTER TABLE Weight_History AUTO_INCREMENT = 1")
            self.cursor.execute("ALTER TABLE AI_Recommendations AUTO_INCREMENT = 1")
            self.cursor.execute("ALTER TABLE Plan_Exercises AUTO_INCREMENT = 1")
            self.cursor.execute("ALTER TABLE Plan_Days AUTO_INCREMENT = 1")
            self.cursor.execute("ALTER TABLE Plans AUTO_INCREMENT = 1")
            self.cursor.execute("ALTER TABLE Workout_Exercises AUTO_INCREMENT = 1")
            self.cursor.execute("ALTER TABLE Users AUTO_INCREMENT = 1")

            # Re-enable foreign key checks
            self.cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
            self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Failed to clear tables: {e}")
            raise

    def sync_user(self, firebase_uid: str, email: str):
        """Synchronize user data with Firebase UID and email, returning user_id."""
        try:
            logger.info(f"Inserting user with firebase_uid={firebase_uid}")
            self.cursor.execute(
                "INSERT INTO Users (firebase_uid, email) VALUES (%s, %s) ON DUPLICATE KEY UPDATE email=%s",
                (firebase_uid, email, email)
            )
            self.conn.commit()
            logger.info(f"Selecting user_id for firebase_uid={firebase_uid}")
            self.cursor.execute("SELECT user_id FROM Users WHERE firebase_uid = %s", (firebase_uid,))
            result = self.cursor.fetchone()
            if result is None:
                raise ValueError(f"User with firebase_uid {firebase_uid} not found after insertion")
            # Access user_id as a dictionary key since cursor returns dicts
            user_id = result["user_id"]
            logger.info(f"Retrieved user_id={user_id} for firebase_uid={firebase_uid}")
            return user_id
        except Exception as e:
            logger.error(f"Error in sync_user: {str(e)}")
            raise

    def update_user_profile(self, user_id: int, username: str, date_of_birth: str, gender: str,
                           weight_kg: float, height_cm: float, fitness_goal: str, experience_level: str):
        """Update user profile information."""
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
        """Fetch user details by Firebase UID, returning a dictionary."""
        try:
            self.cursor.execute("SELECT * FROM Users WHERE firebase_uid = %s", (firebase_uid,))
            return self.cursor.fetchone()
        except mysql.connector.Error as err:
            logger.error(f"Error querying user by firebase_uid: {err}")
            raise

    #workouts:
    def log_workout(self, user_id: int, plan_exercise_id: Optional[int], exercise_id: int, sets: int, reps: int, duration_minutes: Optional[float], weight: Optional[float], notes: Optional[str]) -> int:
        """Log a workout for a user, optionally tied to a plan exercise, and return the workout log ID."""
        query = """
            INSERT INTO Workout_Logs (user_id, plan_exercise_id, exercise_id, sets, reps, duration_minutes, weight, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (user_id, plan_exercise_id, exercise_id, sets, reps, duration_minutes, weight, notes)
        self.cursor.execute(query, values)
        self.conn.commit()
        return self.cursor.lastrowid

    # Plans:
    def get_plans(self, user_id: int) -> List[Dict[str, Any]]:
        """Fetch all plans for a user, returning a list of dictionaries."""
        query = """
            SELECT plan_id, user_id, name, description, days_per_week, preferred_days, is_active
            FROM Plans
            WHERE user_id = %s
        """
        self.cursor.execute(query, (user_id,))
        return self.cursor.fetchall()

    def get_plan(self, plan_id: int) -> Optional[Dict[str, Any]]:
        """Fetch a specific plan by ID, returning a dictionary or None."""
        query = """
            SELECT plan_id, user_id, name, description, days_per_week, preferred_days, is_active
            FROM Plans
            WHERE plan_id = %s
        """
        self.cursor.execute(query, (plan_id,))
        return self.cursor.fetchone()

    def create_plan(self, user_id: int, name: str, description: Optional[str], days_per_week: int, preferred_days: Optional[str]) -> int:
        """Create a new plan and return its ID."""
        query = """
            INSERT INTO Plans (user_id, name, description, days_per_week, preferred_days)
            VALUES (%s, %s, %s, %s, %s)
        """
        self.cursor.execute(query, (user_id, name, description, days_per_week, preferred_days))
        self.conn.commit()
        return self.cursor.lastrowid

    def update_plan(self, plan_id: int, name: str, description: Optional[str], days_per_week: int, preferred_days: Optional[str]):
        """Update an existing plan."""
        query = """
            UPDATE Plans
            SET name = %s, description = %s, days_per_week = %s, preferred_days = %s
            WHERE plan_id = %s
        """
        self.cursor.execute(query, (name, description, days_per_week, preferred_days, plan_id))
        self.conn.commit()

    def delete_plan(self, plan_id: int):
        """Delete a plan (cascades to days and exercises)."""
        query = "DELETE FROM Plans WHERE plan_id = %s"
        self.cursor.execute(query, (plan_id,))
        self.conn.commit()

    # Methods for Plan Days
    def get_plan_days(self, plan_id: int) -> List[Dict[str, Any]]:
        """Fetch all days for a specific plan, returning a list of dictionaries."""
        query = """
            SELECT plan_day_id, plan_id, day_number, description
            FROM Plan_Days
            WHERE plan_id = %s
        """
        self.cursor.execute(query, (plan_id,))
        return self.cursor.fetchall()

    def get_plan_day(self, plan_day_id: int) -> Optional[Dict[str, Any]]:
        """Fetch a specific day by ID, returning a dictionary or None."""
        query = """
            SELECT plan_day_id, plan_id, day_number, description
            FROM Plan_Days
            WHERE plan_day_id = %s
        """
        self.cursor.execute(query, (plan_day_id,))
        return self.cursor.fetchone()

    def create_plan_day(self, plan_id: int, day_number: int, description: Optional[str]) -> int:
        """Create a new day for a plan and return its ID."""
        query = """
            INSERT INTO Plan_Days (plan_id, day_number, description)
            VALUES (%s, %s, %s)
        """
        self.cursor.execute(query, (plan_id, day_number, description))
        self.conn.commit()
        return self.cursor.lastrowid

    def update_plan_day(self, plan_day_id: int, day_number: int, description: Optional[str]):
        """Update an existing plan day."""
        query = """
            UPDATE Plan_Days
            SET day_number = %s, description = %s
            WHERE plan_day_id = %s
        """
        self.cursor.execute(query, (day_number, description, plan_day_id))
        self.conn.commit()

    def delete_plan_day(self, plan_day_id: int):
        """Delete a plan day (cascades to exercises)."""
        query = "DELETE FROM Plan_Days WHERE plan_day_id = %s"
        self.cursor.execute(query, (plan_day_id,))
        self.conn.commit()

    # Methods for Plan Exercises
    def get_plan_exercises(self, plan_day_id: int) -> List[Dict[str, Any]]:
        """Fetch all exercises for a specific day, including exercise details, as a list of dictionaries."""
        query = """
        SELECT pe.plan_exercise_id, pe.plan_day_id, pe.exercise_id,
               we.exercise_name AS exercise_name, we.category, we.primary_muscle,
               we.initial_recommended_sets AS recommended_sets,
               we.initial_recommended_reps AS recommended_reps,
               we.initial_recommended_time AS recommended_duration
        FROM Plan_Exercises pe
        JOIN Workout_Exercises we ON pe.exercise_id = we.exercise_id
        WHERE pe.plan_day_id = %s
        """
        self.cursor.execute(query, (plan_day_id,))
        return self.cursor.fetchall()

    def add_exercise_to_day(self, plan_day_id: int, exercise_id: int) -> int:
        """Add an exercise to a specific day and return its ID."""
        query = """
            INSERT INTO Plan_Exercises (plan_day_id, exercise_id)
            VALUES (%s, %s)
        """
        self.cursor.execute(query, (plan_day_id, exercise_id))
        self.conn.commit()
        return self.cursor.lastrowid

    def remove_exercise_from_day(self, plan_exercise_id: int):
        """Remove an exercise from a day."""
        query = "DELETE FROM Plan_Exercises WHERE plan_exercise_id = %s"
        self.cursor.execute(query, (plan_exercise_id,))
        self.conn.commit()

    def get_exercise(self, exercise_id: int) -> Optional[Dict[str, Any]]:
        """Fetch detailed info about an exercise, returning a dictionary or None."""
        query = """
        SELECT exercise_id, exercise_name, category, primary_muscle,
               initial_recommended_sets, initial_recommended_reps, initial_recommended_time
        FROM Workout_Exercises
        WHERE exercise_id = %s
        """
        self.cursor.execute(query, (exercise_id,))
        return self.cursor.fetchone()

    def close(self):
        """Close the database cursor and connection safely."""
        try:
            self.cursor.close()
            self.conn.close()
        except Exception as e:
            logger.error(f"Error closing database connection: {e}")
            # Ensure the connection is closed even if an error occurs
            try:
                if self.conn.is_connected():
                    self.conn.close()
            except:
                pass
    
    # For workout recommender:
    def get_user_by_id(self, user_id: int) -> Dict[str, Any] | None:
        """Fetch user profile by user_id."""
        self.cursor.execute("SELECT * FROM Users WHERE user_id = %s", (user_id,))
        return self.cursor.fetchone()

    def get_recent_workout_logs(self, user_id: int, weeks: int = 4) -> List[Dict[str, Any]]:
        """Fetch recent workout logs for the user."""
        self.cursor.execute("""
            SELECT wl.*, we.primary_muscle
            FROM Workout_Logs wl
            JOIN Workout_Exercises we ON wl.exercise_id = we.exercise_id
            WHERE wl.user_id = %s AND wl.date_logged >= DATE_SUB(CURDATE(), INTERVAL %s WEEK)
        """, (user_id, weeks))
        return self.cursor.fetchall()

    def get_muscle_group_distribution(self, user_id: int, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """Fetch muscle group distribution from workout logs."""
        self.cursor.execute("""
            SELECT we.primary_muscle AS muscle_group, COUNT(*) AS count
            FROM Workout_Logs wl
            JOIN Workout_Exercises we ON wl.exercise_id = we.exercise_id
            WHERE wl.user_id = %s AND DATE(wl.date_logged) BETWEEN %s AND %s
            GROUP BY we.primary_muscle
        """, (user_id, start_date, end_date))
        return self.cursor.fetchall()

    def get_workout_frequency(self, user_id: int, start_date: date, end_date: date, granularity: str = "weekly") -> List[Dict[str, Any]]:
        """Fetch workout frequency trend."""
        if granularity == "weekly":
            self.cursor.execute("""
                SELECT YEAR(wl.date_logged) AS year, WEEK(wl.date_logged) AS week, COUNT(*) AS count
                FROM Workout_Logs wl
                WHERE wl.user_id = %s AND DATE(wl.date_logged) BETWEEN %s AND %s
                GROUP BY YEAR(wl.date_logged), WEEK(wl.date_logged)
            """, (user_id, start_date, end_date))
        else:  # daily
            self.cursor.execute("""
                SELECT DATE(wl.date_logged) AS date, COUNT(*) AS count
                FROM Workout_Logs wl
                WHERE wl.user_id = %s AND DATE(wl.date_logged) BETWEEN %s AND %s
                GROUP BY DATE(wl.date_logged)
            """, (user_id, start_date, end_date))
        return self.cursor.fetchall()

def get_database():
    """Factory function to create a Database instance."""
    return Database(get_db_connection())