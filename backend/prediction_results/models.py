from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT, INTEGER
from sqlalchemy.sql import func
from db.database import Base
from sqlalchemy.orm import relationship

class PredictionResult(Base):
    __tablename__ = "prediction_results"

    email = Column(String(100), ForeignKey("participants.email"), primary_key=True, nullable=False)
    competition_id = Column(String(100), ForeignKey("prediction_games.competition_id"), primary_key=True, nullable=False)
    point_podium = Column(LONGTEXT, nullable=True, default=None)
    point_number_of_nr = Column(INTEGER(unsigned=True), nullable=False, default=0)
    point_avg_to_qualify_for_333_final = Column(INTEGER(unsigned=True), nullable=False, default=0)
    point_avg_to_win_333_final = Column(INTEGER(unsigned=True), nullable=False, default=0)
    total_point = Column(INTEGER(unsigned=True), nullable=False, default=0)
    pos = Column(INTEGER(unsigned=True), nullable=False, default=0)
    created_at = Column(TIMESTAMP, nullable=False , server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=True)

    participant = relationship("Participant", back_populates="prediction_result")
    prediction_game = relationship("PredictionGame", back_populates="prediction_results")