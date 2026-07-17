from fastapi import APIRouter, Depends, Query, HTTPException
from auth.dependencies import get_current_admin
from admins.models import Admin
from db.dependencies import get_db
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .models import Participant
from prediction_games.models import PredictionGame
from .schemas import ParticipantSchema, CreateParticipantRequest, ParticipantsList, GetParticipantPayload, DeleteParticipantPayload
import json
from math import ceil

router = APIRouter()


@router.post("/client", response_model=ParticipantSchema)
def create_participant(request_data: CreateParticipantRequest, db: Session = Depends(get_db)):

    db_prediction_game = db.query(PredictionGame).filter(PredictionGame.competition_id == request_data.participates_in, PredictionGame.published.is_(True)).first()

    if not db_prediction_game:
        raise HTTPException(status_code=404, detail=f"Prediction Game for competition {request_data.participates_in} not found")

    db_participant = db.query(Participant).filter(Participant.email == request_data.email, Participant.participates_in == request_data.participates_in).first()

    if not db_participant:
        now_timestamp = datetime.now(timezone.utc)
        db_participant = Participant(
            email = request_data.email,
            participates_in = request_data.participates_in,
            display_name = request_data.display_name,
            facebook_url = request_data.facebook_url,
            podium_prediction = json.dumps(request_data.podium_prediction.model_dump()),
            additional_prediction_number_of_nr = request_data.additional_prediction_number_of_nr,
            additional_prediction_avg_to_qualify_for_333_final = request_data.additional_prediction_avg_to_qualify_for_333_final,
            additional_prediction_avg_to_win_333_final = request_data.additional_prediction_avg_to_win_333_final,
            created_at = now_timestamp,
            updated_at = now_timestamp
        )

        db.add(db_participant)
        db.commit()
        db.refresh(db_participant)
    
    else:
        update_data = request_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if field == "podium_prediction":
                setattr(db_participant, field, json.dumps(value))

            else:
                setattr(db_participant, field, value)

        db_participant.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(db_participant)

    return ParticipantSchema(
        email = request_data.email,
        participates_in = request_data.participates_in,
        display_name = request_data.display_name,
        facebook_url = request_data.facebook_url,
        podium_prediction = request_data.podium_prediction,
        additional_prediction_number_of_nr = request_data.additional_prediction_number_of_nr,
        additional_prediction_avg_to_qualify_for_333_final = request_data.additional_prediction_avg_to_qualify_for_333_final,
        additional_prediction_avg_to_win_333_final = request_data.additional_prediction_avg_to_win_333_final,
        created_at = db_participant.created_at,
        updated_at = db_participant.updated_at
    )


@router.get("/client", response_model=ParticipantSchema)
def get_participant(payload: GetParticipantPayload, db: Session = Depends(get_db)):
    email = payload.email
    participates_in = payload.participates_in

    participant = db.query(Participant).filter(Participant.email == email, Participant.participates_in == participates_in).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    return ParticipantSchema(
        email=participant.email,
        participates_in=participant.participates_in,
        display_name=participant.display_name,
        facebook_url=participant.facebook_url,
        podium_prediction=json.loads(participant.podium_prediction),
        additional_prediction_number_of_nr=participant.additional_prediction_number_of_nr,
        additional_prediction_avg_to_qualify_for_333_final=participant.additional_prediction_avg_to_qualify_for_333_final,
        additional_prediction_avg_to_win_333_final=participant.additional_prediction_avg_to_win_333_final,
        created_at=participant.created_at,
        updated_at=participant.updated_at
    )


@router.get("/client/{participates_in}", response_model=ParticipantsList)
def get_participants_of_a_prediction_game_client(participates_in: str, page: int = Query(1, ge=1), db: Session = Depends(get_db)):

    comp_result = db.query(CompetitionResult).filter(CompetitionResult.competition_id == participates_in).first()

    if not comp_result:
        raise HTTPException(status_code=403, detail=f"Other participants' prediction for competition {request_data.participates_in} is prohibited")

    PAGE_SIZE = 24

    base_query = db.query(Participant).filter(Participant.participates_in == participates_in)

    total = base_query.count()

    if (page - 1) * PAGE_SIZE >= total and total > 0:
        raise HTTPException(status_code=400, detail="Page out of range")

    participants = base_query.order_by(Participant.created_at.desc()).offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()

    for participant in participants:
        participant.podium_prediction = json.loads(participant.podium_prediction)

    return {
        "data": participants,
        "pagination": {
            "page": page,
            "page_size": PAGE_SIZE,
            "total": total,
            "total_pages": ceil(total / PAGE_SIZE)
        }
    }


@router.get("/admin/{participates_in}", response_model=ParticipantsList)
def get_participants_of_a_prediction_game_admin(participates_in: str, page: int = Query(1, ge=1), db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    PAGE_SIZE = 24

    base_query = db.query(Participant).filter(Participant.participates_in == participates_in)

    total = base_query.count()

    if (page - 1) * PAGE_SIZE >= total and total > 0:
        raise HTTPException(status_code=400, detail="Page out of range")

    participants = base_query.order_by(Participant.created_at.desc()).offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()

    for participant in participants:
        participant.podium_prediction = json.loads(participant.podium_prediction)

    return {
        "data": participants,
        "pagination": {
            "page": page,
            "page_size": PAGE_SIZE,
            "total": total,
            "total_pages": ceil(total / PAGE_SIZE)
        }
    }


@router.delete("/client")
def delete_participant(payload: DeleteParticipantPayload, db: Session = Depends(get_db)):
    email = payload.email
    participates_in = payload.participates_in

    try:
        query = delete(Participant).where(Participant.email == email, Participant.participates_in == participates_in)

        db.execute(query)
        db.commit()
    
    except Exception:
        db.rollback()

    finally:
        db.close()

    return {
        "message": "Deletion successful"
    }