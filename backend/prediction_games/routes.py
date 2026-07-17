from fastapi import APIRouter, Depends, Query, HTTPException
from auth.dependencies import get_current_admin
from admins.models import Admin
from db.dependencies import get_db
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .utils import fetch_competition_info
from .models import PredictionGame
from .schemas import PredictionGameSchema, CreatePredictionGameRequest, PredictionGamesList
import json
from math import ceil

router = APIRouter()


@router.post("/admin")
def create_prediction_game(request_data: CreatePredictionGameRequest, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)) -> PredictionGameSchema:

    competition_id = request_data.competition_id
    competition_name, event_ids, country_iso2, competition_start_date, competition_end_date, competition_registration_open, competition_registration_close, psych_sheets = fetch_competition_info(competition_id)

    now_timestamp = datetime.now(timezone.utc)
    db_prediction_game = PredictionGame(
        competition_id=competition_id,
        competition_name=competition_name,
        published=False,
        competition_start_date=datetime.fromisoformat(competition_start_date),
        competition_end_date=datetime.fromisoformat(competition_end_date),
        competition_registration_open=datetime.fromisoformat(competition_registration_open),
        competition_registration_close=datetime.fromisoformat(competition_registration_close),
        competition_country_iso2=country_iso2,
        competition_event_ids=",".join(event_ids),
        competition_psych_sheets=json.dumps(psych_sheets),
        created_at=now_timestamp
    )

    db.add(db_prediction_game)
    db.commit()
    db.refresh(db_prediction_game)

    return PredictionGameSchema(
        competition_id=competition_id,
        competition_name=competition_name,
        published=False,
        prediction_open=None,
        prediction_close=None,
        competition_start_date=datetime.fromisoformat(competition_start_date),
        competition_end_date=datetime.fromisoformat(competition_end_date),
        competition_registration_open=datetime.fromisoformat(competition_registration_open),
        competition_registration_close=datetime.fromisoformat(competition_registration_close),
        competition_country_iso2=country_iso2,
        competition_event_ids=event_ids,
        competition_psych_sheets=psych_sheets
    )


@router.get("/admin", response_model=PredictionGamesList)
def get_prediction_games_admin(page: int = Query(1, ge=1), db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    PAGE_SIZE = 10

    base_query = db.query(PredictionGame)

    total = base_query.count()

    if (page - 1) * PAGE_SIZE >= total and total > 0:
        raise HTTPException(status_code=400, detail="Page out of range")

    prediction_games = base_query.order_by(PredictionGame.created_at.desc()).offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()

    return {
        "data": prediction_games,
        "pagination": {
            "page": page,
            "page_size": PAGE_SIZE,
            "total": total,
            "total_pages": ceil(total / PAGE_SIZE)
        }
    }


@router.get("/client", response_model=PredictionGamesList)
def get_prediction_games(page: int = Query(1, ge=1), db: Session = Depends(get_db)):
    PAGE_SIZE = 10

    base_query = db.query(PredictionGame).filter(PredictionGame.published.is_(True))

    total = base_query.count()

    if (page - 1) * PAGE_SIZE >= total and total > 0:
        raise HTTPException(status_code=400, detail="Page out of range")

    prediction_games = base_query.order_by(PredictionGame.created_at.desc()).offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()

    return {
        "data": prediction_games,
        "pagination": {
            "page": page,
            "page_size": PAGE_SIZE,
            "total": total,
            "total_pages": ceil(total / PAGE_SIZE)
        }
    }


@router.get("/admin/{competition_id}", response_model=PredictionGameSchema)
def get_prediction_game_admin(competition_id: str, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    prediction_game = db.query(PredictionGame).filter(PredictionGame.competition_id == competition_id).first()

    if not prediction_game:
        raise HTTPException(status_code=404, detail="Prediction Game not found")

    return PredictionGameSchema(
        competition_id=prediction_game.competition_id,
        competition_name=prediction_game.competition_name,
        published=prediction_game.published,
        prediction_open=prediction_game.prediction_open,
        prediction_close=prediction_game.prediction_close,
        competition_start_date=prediction_game.competition_start_date,
        competition_end_date=prediction_game.competition_end_date,
        competition_registration_open=prediction_game.competition_registration_open,
        competition_registration_close=prediction_game.competition_registration_close,
        competition_country_iso2=prediction_game.competition_country_iso2,
        competition_event_ids=prediction_game.competition_event_ids.split(","),
        competition_psych_sheets=json.loads(prediction_game.competition_psych_sheets)
    )


@router.get("/client/{competition_id}", response_model=PredictionGameSchema)
def get_prediction_game(competition_id: str, db: Session = Depends(get_db)):
    prediction_game = db.query(PredictionGame).filter(PredictionGame.competition_id == competition_id, PredictionGame.published.is_(True)).first()

    if not prediction_game:
        raise HTTPException(status_code=404, detail="Prediction Game not found")

    return PredictionGameSchema(
        competition_id=prediction_game.competition_id,
        competition_name=prediction_game.competition_name,
        published=prediction_game.published,
        prediction_open=prediction_game.prediction_open,
        prediction_close=prediction_game.prediction_close,
        competition_start_date=prediction_game.competition_start_date,
        competition_end_date=prediction_game.competition_end_date,
        competition_registration_open=prediction_game.competition_registration_open,
        competition_registration_close=prediction_game.competition_registration_close,
        competition_country_iso2=prediction_game.competition_country_iso2,
        competition_event_ids=prediction_game.competition_event_ids.split(","),
        competition_psych_sheets=json.loads(prediction_game.competition_psych_sheets)
    )


@router.put("/admin/{competition_id}", response_model=PredictionGameSchema)
def update_prediction_game(competition_id: str, payload: PredictionGameSchema, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    prediction_game = db.query(PredictionGame).filter(PredictionGame.competition_id == competition_id).first()

    if not prediction_game:
        raise HTTPException(status_code=404, detail="Prediction Game not found")

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if not field.startswith("competition_"):
            setattr(prediction_game, field, value)

    competition_name, event_ids, country_iso2, competition_start_date, competition_end_date, competition_registration_open, competition_registration_close, psych_sheets = fetch_competition_info(competition_id)

    prediction_game.competition_name = competition_name
    prediction_game.competition_start_date = datetime.fromisoformat(competition_start_date)
    prediction_game.competition_end_date = datetime.fromisoformat(competition_end_date)
    prediction_game.competition_registration_open = datetime.fromisoformat(competition_registration_open)
    prediction_game.competition_registration_close = datetime.fromisoformat(competition_registration_close)
    prediction_game.competition_country_iso2 = country_iso2
    prediction_game.competition_event_ids = ",".join(event_ids)
    prediction_game.competition_psych_sheets = json.dumps(psych_sheets)

    prediction_game.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(prediction_game)

    return PredictionGameSchema(
        competition_id=prediction_game.competition_id,
        competition_name=prediction_game.competition_name,
        published=prediction_game.published,
        prediction_open=prediction_game.prediction_open,
        prediction_close=prediction_game.prediction_close,
        competition_start_date=prediction_game.competition_start_date,
        competition_end_date=prediction_game.competition_end_date,
        competition_registration_open=prediction_game.competition_registration_open,
        competition_registration_close=prediction_game.competition_registration_close,
        competition_country_iso2=prediction_game.competition_country_iso2,
        competition_event_ids=prediction_game.competition_event_ids.split(","),
        competition_psych_sheets=json.loads(prediction_game.competition_psych_sheets)
    )