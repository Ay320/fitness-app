from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS")
    DB_HOST = os.getenv("DB_HOST")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")

    def __post_init__(self):
        # Validate that all required environment variables are set
        required_vars = [
            "FIREBASE_CREDENTIALS",
            "DB_HOST",
            "DB_USER",
            "DB_PASSWORD",
            "DB_NAME",
            "FIREBASE_PROJECT_ID",
        ]
        for var in required_vars:
            if not getattr(self, var):
                raise ValueError(f"Missing required environment variable: {var}")

settings = Settings()
settings.__post_init__()