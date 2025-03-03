 #links Firebase authentication with MySQL.

from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP
from app.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String(128), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    gender = Column(Enum('Male', 'Female', 'Other'))
    created_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")

#TODO:Update later
