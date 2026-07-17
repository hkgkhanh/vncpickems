from pydantic import BaseModel
from typing import List
from datetime import datetime
from bases.models import PaginationMeta


class EventPodiumResultSchema(BaseModel):
    event_id: str
    first_place: int # this is the user_id of the competitor, got from the API, not the result (avg or single) or wca_id
    second_place: int
    third_place: int


class PodiumResultSchema(BaseModel):
    podium: List[EventPodiumResultSchema]


class CompetitionResultSchema(BaseModel):
    competition_id: str
    podium: PodiumResultSchema
    additional_result_number_of_nr: int
    additional_result_avg_to_qualify_for_333_final: int
    additional_result_avg_to_win_333_final: int
    created_at: datetime
    updated_at: datetime | None


class CreateCompetitionResultSchema(BaseModel):
    competition_id: str
    podium: PodiumResultSchema
    additional_result_number_of_nr: int
    additional_result_avg_to_qualify_for_333_final: int
    additional_result_avg_to_win_333_final: int