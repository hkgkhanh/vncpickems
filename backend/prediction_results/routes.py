from fastapi import APIRouter, Depends, Query, HTTPException
from auth.dependencies import get_current_admin, get_current_google_user
from auth.schemas import GoogleUser
from admins.models import Admin
from db.dependencies import get_db
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .models import PredictionResult
from participants.models import Participant
from prediction_games.models import PredictionGame
from .schemas import PredictionResultSchema, PredictionResultsList
import json
from math import ceil

router = APIRouter()


@router.get("/all/{competition_id}", response_model=PredictionResultsList)
def get_prediction_results_of_a_prediction_game(competition_id: str, email: str | None = Query(None), page: int = Query(1, ge=1), db: Session = Depends(get_db)):
    PAGE_SIZE = 10

    base_query = db.query(PredictionResult, Participant).join(Participant, PredictionResult.email == Participant.email).filter(PredictionResult.competition_id == competition_id)
    if email is not None:
        base_query = base_query.filter(PredictionResult.email == email)
        
    total = base_query.count()

    if (page - 1) * PAGE_SIZE >= total and total > 0:
        raise HTTPException(status_code=400, detail="Page out of range")

    prediction_results = base_query.order_by(PredictionResult.total_point.desc()).offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()

    data = []

    for prediction_result, participant in prediction_results:
        point_podium = {
            "podium": json.loads(prediction_result.point_podium)
        }

        data.append({
            "email": participant.email,
            "display_name": participant.display_name,
            "facebook_url": participant.facebook_url,
            "competition_id": prediction_result.competition_id,
            "total_point": prediction_result.total_point,
            "point_podium": point_podium,
            "point_number_of_nr": prediction_result.point_number_of_nr,
            "point_avg_to_qualify_for_333_final": prediction_result.point_avg_to_qualify_for_333_final,
            "point_avg_to_win_333_final": prediction_result.point_avg_to_win_333_final,
            "total_point": prediction_result.total_point,
            "pos": prediction_result.pos,
            "prediction_podium": json.loads(participant.podium_prediction),
            "prediction_number_of_nr": participant.additional_prediction_number_of_nr,
            "prediction_avg_to_qualify_for_333_final": participant.additional_prediction_avg_to_qualify_for_333_final,
            "prediction_avg_to_win_333_final": participant.additional_prediction_avg_to_win_333_final,
            "created_at": prediction_result.created_at,
            "updated_at": prediction_result.updated_at
        })

    return {
        "data": data,
        "pagination": {
            "page": page,
            "page_size": PAGE_SIZE,
            "total": total,
            "total_pages": ceil(total / PAGE_SIZE)
        }
    }