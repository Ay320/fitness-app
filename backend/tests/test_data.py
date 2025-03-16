from dotenv import load_dotenv
import os

load_dotenv()
REAL_FIREBASE_TOKEN = os.getenv("REAL_FIREBASE_TOKEN", "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0...")  # Fallback for local testing