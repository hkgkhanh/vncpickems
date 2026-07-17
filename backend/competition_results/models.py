from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT, TINYINT, INTEGER
from sqlalchemy.sql import func
from db.database import Base
from sqlalchemy.orm import relationship

class CompetitionResult(Base):
    __tablename__ = "competition_results"

    competition_id = Column(String(100), ForeignKey("prediction_games.competition_id"), primary_key=True, nullable=False)
    podium = Column(LONGTEXT, nullable=True, default=None)
    additional_result_number_of_nr = Column(TINYINT(unsigned=True), nullable=False, default=0)
    additional_result_avg_to_qualify_for_333_final = Column(INTEGER(unsigned=True), nullable=False, default=1000)
    additional_result_avg_to_win_333_final = Column(INTEGER(unsigned=True), nullable=False, default=1000)
    created_at = Column(TIMESTAMP, nullable=False , server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=True)

    prediction_game = relationship("PredictionGame", back_populates="competition_result")