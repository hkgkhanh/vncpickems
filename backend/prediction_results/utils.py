from datetime import datetime, timezone
from .models import PredictionResult
from participants.models import Participant
from competition_results.schemas import CreateCompetitionResultSchema
from sqlalchemy.orm import Session
import json

BONUS_POINTS = {
    1: 40,
    2: 30,
    3: 20,
    4: 10,
    5: 5,
}


def calculate_podium_points(official_podium, participant_podium_prediction):
    """
    Calculate podium points for a participant.

    Rules:
    - Correct competitor appearing anywhere in the podium: +10
    - Correct competitor in the correct position: +15 extra

    Args:
        official_podium:
            Can be either:
                - dict from json.loads(CompetitionResult.podium)
                - PodiumResultSchema.model_dump()

            Example:
            {
                "podium": [
                    {
                        "event_id": "333",
                        "first_place": 3,
                        "second_place": 5,
                        "third_place": 4
                    }
                ]
            }

        participant_podium_prediction:
            Can be either:
                - JSON string stored in Participant.podium_prediction
                - dict

            Example:
            {
                "predictions": [
                    {
                        "event_id": "333",
                        "first_place": 5,
                        "second_place": 3,
                        "third_place": 4
                    }
                ]
            }

    Returns:
        point_podium:
        [
            {
                "event_id": "333",
                "point": 45
            },
            ...
        ]

        total_point:
            int
    """

    # Convert JSON string if necessary
    if isinstance(participant_podium_prediction, str):
        participant_podium_prediction = json.loads(participant_podium_prediction)

    official_lookup = {
        event["event_id"]: event
        for event in official_podium["podium"]
    }

    prediction_lookup = {
        event["event_id"]: event
        for event in participant_podium_prediction["predictions"]
    }

    point_podium = []
    total_point = 0

    for event_id, official in official_lookup.items():

        prediction = prediction_lookup.get(event_id)

        if prediction is None:
            point_podium.append({
                "event_id": event_id,
                "point": 0
            })
            continue

        official_places = [
            official["first_place"],
            official["second_place"],
            official["third_place"],
        ]

        prediction_places = [
            prediction["first_place"],
            prediction["second_place"],
            prediction["third_place"],
        ]

        event_point = 0

        # +10 for every correct competitor appearing in podium
        for competitor in prediction_places:
            if competitor in official_places:
                event_point += 10

        # +15 for every correct position
        if prediction["first_place"] == official["first_place"]:
            event_point += 15

        if prediction["second_place"] == official["second_place"]:
            event_point += 15

        if prediction["third_place"] == official["third_place"]:
            event_point += 15

        point_podium.append({
            "event_id": event_id,
            "point": event_point
        })

        total_point += event_point

    return point_podium, total_point


def apply_bonus_ranking(results, prediction_field, actual_value, result_field):
    """
    Apply ranking and bonus points for one bonus prediction.

    Parameters
    ----------
    results : list[dict]

        Each item should look like:

        {
            "participant": Participant,
            "point_podium": [...],
            "point_number_of_nr": 0,
            "point_avg_to_qualify_for_333_final": 0,
            "point_avg_to_win_333_final": 0,
            "total_point": 120,
        }

    prediction_field : str

        Name of the field inside Participant.

        Examples:
            "additional_prediction_number_of_nr"
            "additional_prediction_avg_to_qualify_for_333_final"
            "additional_prediction_avg_to_win_333_final"

    actual_value : int

        Official result.

    result_field : str

        Name of the score field inside results.

        Examples:
            "point_number_of_nr"
            "point_avg_to_qualify_for_333_final"
            "point_avg_to_win_333_final"
    """

    ranking = []

    for result in results:

        participant = result["participant"]

        prediction = getattr(participant, prediction_field)

        ranking.append({
            "result": result,
            "error": abs(prediction - actual_value)
        })

    # smallest error first
    ranking.sort(key=lambda x: x["error"])

    previous_error = None
    current_rank = 0

    for index, item in enumerate(ranking):
        if previous_error is None:
            current_rank = 1

        elif item["error"] != previous_error:
            current_rank = index + 1

        previous_error = item["error"]

        point = BONUS_POINTS.get(current_rank, 0)

        item["result"][result_field] = point
        item["result"]["total_point"] += point


def save_prediction_result(db, competition_id: str, result: dict):
    """
    Create or update one PredictionResult.

    Parameters
    ----------
    db : Session
    competition_id : str
    result : dict
        {
            "participant": Participant,
            "point_podium": [...],
            "point_number_of_nr": int,
            "point_avg_to_qualify_for_333_final": int,
            "point_avg_to_win_333_final": int,
            "total_point": int
        }
    """

    participant = result["participant"]

    prediction_result = (
        db.query(PredictionResult)
        .filter(
            PredictionResult.email == participant.email,
            PredictionResult.competition_id == competition_id,
        )
        .first()
    )

    now = datetime.now(timezone.utc)

    if prediction_result is None:
        prediction_result = PredictionResult(
            email=participant.email,
            competition_id=competition_id,
            point_podium=json.dumps(result["point_podium"]),
            point_number_of_nr=result["point_number_of_nr"],
            point_avg_to_qualify_for_333_final=result["point_avg_to_qualify_for_333_final"],
            point_avg_to_win_333_final=result["point_avg_to_win_333_final"],
            total_point=result["total_point"],
            pos=0,          # assign_positions() will update this later
            updated_at=now,
        )

        db.add(prediction_result)

    else:
        prediction_result.point_podium = json.dumps(result["point_podium"])
        prediction_result.point_number_of_nr = result["point_number_of_nr"]
        prediction_result.point_avg_to_qualify_for_333_final = result["point_avg_to_qualify_for_333_final"]
        prediction_result.point_avg_to_win_333_final = result["point_avg_to_win_333_final"]
        prediction_result.total_point = result["total_point"]
        prediction_result.updated_at = now

    return prediction_result


def assign_positions(db, competition_id: str):
    """
    Assign overall positions for a competition.
    """

    prediction_results = (
        db.query(PredictionResult)
        .filter(PredictionResult.competition_id == competition_id)
        .order_by(
            PredictionResult.total_point.desc(),
            PredictionResult.updated_at.asc(),
            PredictionResult.email.asc(),
        )
        .all()
    )

    previous_score = None
    current_rank = 0

    for index, prediction_result in enumerate(prediction_results):

        if previous_score is None:
            current_rank = 1

        elif prediction_result.total_point != previous_score:
            current_rank = index + 1

        prediction_result.pos = current_rank

        previous_score = prediction_result.total_point


def calculate_prediction_results(competition_result: CreateCompetitionResultSchema, db: Session):
    """
    Recalculate every participant's prediction result for one competition.

    Parameters
    ----------
    db : sqlalchemy.orm.Session

    competition_result : CreateCompetitionResultSchema
    """

    participants = db.query(Participant).filter(Participant.participates_in == competition_result.competition_id).all()

    official_podium = competition_result.podium.model_dump()

    results = []

    # --------------------------------------------------------
    # Calculate podium points
    # --------------------------------------------------------

    for participant in participants:

        point_podium, podium_total = calculate_podium_points(
            official_podium=official_podium,
            participant_podium_prediction=participant.podium_prediction,
        )

        results.append({
            "participant": participant,
            "point_podium": point_podium,
            "point_number_of_nr": 0,
            "point_avg_to_qualify_for_333_final": 0,
            "point_avg_to_win_333_final": 0,
            "total_point": podium_total,
        })

    # --------------------------------------------------------
    # Apply bonus rankings
    # --------------------------------------------------------

    apply_bonus_ranking(
        results=results,
        prediction_field="additional_prediction_number_of_nr",
        actual_value=competition_result.additional_result_number_of_nr,
        result_field="point_number_of_nr",
    )

    apply_bonus_ranking(
        results=results,
        prediction_field="additional_prediction_avg_to_qualify_for_333_final",
        actual_value=competition_result.additional_result_avg_to_qualify_for_333_final,
        result_field="point_avg_to_qualify_for_333_final",
    )

    apply_bonus_ranking(
        results=results,
        prediction_field="additional_prediction_avg_to_win_333_final",
        actual_value=competition_result.additional_result_avg_to_win_333_final,
        result_field="point_avg_to_win_333_final",
    )

    # --------------------------------------------------------
    # Save prediction results
    # --------------------------------------------------------

    for result in results:
        save_prediction_result(
            db=db,
            competition_id=competition_result.competition_id,
            result=result,
        )

    # Flush INSERTs before querying in assign_positions()
    db.flush()

    # --------------------------------------------------------
    # Assign leaderboard positions
    # --------------------------------------------------------

    assign_positions(db=db, competition_id=competition_result.competition_id)

    db.commit()