from pydantic import BaseModel
from typing import List
from datetime import datetime
from bases.models import PaginationMeta


class PsychSheetRecord(BaseModel):
    name: str
    user_id: int
    country_iso2: str
    average_best: int | None
    single_best: int | None
    pos: int| None


class PsychSheetSchema(BaseModel):
    event_id: str
    psych_sheet: List[PsychSheetRecord]


class PredictionGameSchema(BaseModel):
    competition_id: str
    competition_name: str
    published: bool
    prediction_open: datetime | None
    prediction_close: datetime | None
    competition_start_date: datetime
    competition_end_date: datetime
    competition_registration_open: datetime
    competition_registration_close: datetime
    competition_country_iso2: str
    competition_event_ids: List[str]
    competition_psych_sheets: List[PsychSheetSchema]


class CreatePredictionGameRequest(BaseModel):
    competition_id: str


class UpdatePredictionGameSchema(BaseModel):
    published: bool
    prediction_open: datetime | None
    prediction_close: datetime | None


class ShortenPredictionGameSchema(BaseModel):
    competition_id: str
    competition_name: str
    published: bool
    prediction_open: datetime | None
    prediction_close: datetime | None
    competition_start_date: datetime
    competition_end_date: datetime
    competition_registration_open: datetime
    competition_registration_close: datetime


class PredictionGamesList(BaseModel):
    data: List[ShortenPredictionGameSchema]
    pagination: PaginationMeta