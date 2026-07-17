from fastapi import APIRouter, Depends, Query, HTTPException
from auth.dependencies import get_current_admin
from admins.models import Admin
from db.dependencies import get_db
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .models import CompetitionResult
from prediction_games.models import PredictionGame
from .schemas import CreateCompetitionResultSchema, CompetitionResultSchema
import json
from math import ceil

router = APIRouter()


@router.post("/admin", response_model=CompetitionResultSchema)
def create_competition_result(request_data: CreateCompetitionResultSchema, db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):

    db_prediction_game = db.query(PredictionGame).filter(PredictionGame.competition_id == request_data.competition_id).first()

    if not db_prediction_game:
        raise HTTPException(status_code=404, detail=f"Prediction Game for competition {request_data.competition_id} not found")

    db_competition_result = db.query(CompetitionResult).filter(CompetitionResult.competition_id == request_data.competition_id).first()

    if not db_competition_result:
        now_timestamp = datetime.now(timezone.utc)
        db_competition_result = CompetitionResult(
            competition_id = request_data.competition_id,
            podium = json.dumps(request_data.podium.model_dump()),
            additional_result_number_of_nr = request_data.additional_result_number_of_nr,
            additional_result_avg_to_qualify_for_333_final = request_data.additional_result_avg_to_qualify_for_333_final,
            additional_result_avg_to_win_333_final = request_data.additional_result_avg_to_win_333_final,
            created_at = now_timestamp,
            updated_at = now_timestamp
        )

        db.add(db_competition_result)
        db.commit()
        db.refresh(db_competition_result)
    
    else:
        update_data = request_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if field == "podium":
                setattr(db_competition_result, field, json.dumps(value))

            else:
                setattr(db_competition_result, field, value)

        db_competition_result.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(db_competition_result)

    return CompetitionResultSchema(
        competition_id = request_data.competition_id,
        podium = request_data.podium,
        additional_result_number_of_nr = request_data.additional_result_number_of_nr,
        additional_result_avg_to_qualify_for_333_final = request_data.additional_result_avg_to_qualify_for_333_final,
        additional_result_avg_to_win_333_final = request_data.additional_result_avg_to_win_333_final,
        created_at = db_competition_result.created_at,
        updated_at = db_competition_result.updated_at
    )


@router.get("/{competition_id}", response_model=CompetitionResultSchema)
def get_competition_result(competition_id: str, db: Session = Depends(get_db)):
    competition_result = db.query(CompetitionResult).filter(CompetitionResult.competition_id == competition_id).first()

    if not competition_result:
        raise HTTPException(status_code=404, detail="Competition Result not found")

    return CompetitionResultSchema(
        competition_id=competition_result.competition_id,
        podium=json.loads(competition_result.podium),
        additional_result_number_of_nr=competition_result.additional_result_number_of_nr,
        additional_result_avg_to_qualify_for_333_final=competition_result.additional_result_avg_to_qualify_for_333_final,
        additional_result_avg_to_win_333_final=competition_result.additional_result_avg_to_win_333_final,
        created_at=competition_result.created_at,
        updated_at=competition_result.updated_at
    )


@router.delete("/admin/{competition_id}")
def delete_competition_result(competition_id: str, db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    competition_result = db.query(CompetitionResult).filter(CompetitionResult.competition_id == competition_id).first()

    if competition_result is None:
        raise HTTPException(status_code=404, detail="Competition Result not found")

    db.delete(competition_result)
    db.commit()

    return {
        "message": "Deletion successful"
    }