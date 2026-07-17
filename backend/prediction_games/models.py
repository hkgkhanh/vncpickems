from sqlalchemy import Column, String, TIMESTAMP, Boolean, DATE
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.sql import func
from db.database import Base
from sqlalchemy.orm import relationship

class PredictionGame(Base):
    __tablename__ = "prediction_games"

    competition_id = Column(String(100), primary_key=True, nullable=False)
    competition_name = Column(String(255), nullable=False)
    published = Column(Boolean, nullable=False, default=False)
    prediction_open = Column(TIMESTAMP, nullable=True)
    prediction_close = Column(TIMESTAMP, nullable=True)
    competition_start_date = Column(DATE, nullable=False)
    competition_end_date = Column(DATE, nullable=False)
    competition_registration_open = Column(TIMESTAMP, nullable=False)
    competition_registration_close = Column(TIMESTAMP, nullable=False)
    competition_country_iso2 = Column(String(2), nullable=False)
    competition_event_ids = Column(String(100))
    competition_psych_sheets = Column(LONGTEXT, nullable=True, default=None)
    created_at = Column(TIMESTAMP, nullable=False , server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=True)

    participants = relationship("Participant", back_populates="predicts_for_game")
    competition_result = relationship("CompetitionResult", back_populates="prediction_game")