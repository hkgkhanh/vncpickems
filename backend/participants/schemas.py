from pydantic import BaseModel
from typing import List
from datetime import datetime
from bases.models import PaginationMeta


class EventPodiumPredictionSchema(BaseModel):
    event_id: str
    first_place: int # this is the user_id of the competitor, got from the API, not the result (avg or single) or wca_id
    second_place: int
    third_place: int


class PodiumPredictionSchema(BaseModel):
    predictions: List[EventPodiumPredictionSchema]


class ParticipantSchema(BaseModel):
    email: str
    participates_in: str
    display_name: str | None
    facebook_url: str | None
    podium_prediction: PodiumPredictionSchema
    additional_prediction_number_of_nr: int
    additional_prediction_avg_to_qualify_for_333_final: int
    additional_prediction_avg_to_win_333_final: int
    created_at: datetime
    updated_at: datetime | None


class CreateParticipantRequest(BaseModel):
    # email: str
    participates_in: str
    display_name: str | None
    facebook_url: str | None
    podium_prediction: PodiumPredictionSchema
    additional_prediction_number_of_nr: int
    additional_prediction_avg_to_qualify_for_333_final: int
    additional_prediction_avg_to_win_333_final: int


class GetParticipantPayload(BaseModel):
    participates_in: str


class DeleteParticipantPayload(BaseModel):
    participates_in: str


class ShortenParticipantSchema(BaseModel):
    email: str
    participates_in: str
    display_name: str | None
    facebook_url: str | None


class ParticipantsList(BaseModel):
    data: List[ParticipantSchema]
    pagination: PaginationMeta