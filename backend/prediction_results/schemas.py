from pydantic import BaseModel
from typing import List
from datetime import datetime
from bases.models import PaginationMeta
from participants.schemas import PodiumPredictionSchema


class EventPodiumPointSchema(BaseModel):
    event_id: str
    point: int


class PointPodiumSchema(BaseModel):
    podium: List[EventPodiumPointSchema]


class PredictionResultSchema(BaseModel):
    email: str
    display_name: str | None
    facebook_url: str | None
    competition_id: str
    point_podium: PointPodiumSchema
    point_number_of_nr: int
    point_avg_to_qualify_for_333_final: int
    point_avg_to_win_333_final: int
    total_point: int
    pos: int
    prediction_podium: PodiumPredictionSchema
    prediction_number_of_nr: int
    prediction_avg_to_qualify_for_333_final: int
    prediction_avg_to_win_333_final: int
    created_at: datetime
    updated_at: datetime | None


class PredictionResultsList(BaseModel):
    data: List[PredictionResultSchema]
    pagination: PaginationMeta