from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "REMOVED")
    DB_HOST = os.getenv("DB_HOST", "REMOVED")
    DB_USER = os.getenv("DB_USER", "REMOVED")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "REMOVED")
    DB_NAME = os.getenv("DB_NAME", "REMOVED")
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "REMOVED")

settings = Settings()
