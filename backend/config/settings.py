from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "REMOVED")
    DB_HOST = os.getenv("DB_HOST", "REMOVED")
    DB_USER = os.getenv("REMOVED")
    DB_PASSWORD = os.getenv("REMOVED")
    DB_NAME = os.getenv("DB_NAME", "REMOVED")

settings = Settings()
