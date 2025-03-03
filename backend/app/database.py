from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

'''
DATABASE_URL = "mysql+pymysql://my_username:my_password@my_university_server/my_database"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

#TODO: connect the database
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
    return mock_db