from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.sql import func
from db.database import Base
from sqlalchemy.orm import relationship

class Admin(Base):
    __tablename__ = "admins"

    username = Column(String(45), primary_key=True, nullable=False)
    hashed_password = Column(String(100))
    created_at = Column(TIMESTAMP, nullable=False , server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=True)