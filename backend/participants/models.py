from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT, TINYINT, INTEGER
from sqlalchemy.sql import func
from db.database import Base
from sqlalchemy.orm import relationship

class Participant(Base):
    __tablename__ = "participants"

    email = Column(String(100), primary_key=True, nullable=False)
    participates_in = Column(String(100), ForeignKey("prediction_games.competition_id"), primary_key=True, nullable=False)
    display_name = Column(String(100), nullable=True, default=None)
    facebook_url = Column(String(255), nullable=True, default=None)
    podium_prediction = Column(LONGTEXT, nullable=True, default=None)
    additional_prediction_number_of_nr = Column(TINYINT(unsigned=True), nullable=False, default=0)
    additional_prediction_avg_to_qualify_for_333_final = Column(INTEGER(unsigned=True), nullable=False, default=1000)
    additional_prediction_avg_to_win_333_final = Column(INTEGER(unsigned=True), nullable=False, default=1000)
    created_at = Column(TIMESTAMP, nullable=False , server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=True)

    predicts_for_game = relationship("PredictionGame", back_populates="participants")
    prediction_result = relationship("PredictionResult", back_populates="participant")