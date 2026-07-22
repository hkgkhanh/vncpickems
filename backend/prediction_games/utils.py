from fastapi import HTTPException
from urllib.request import urlopen
from urllib.error import HTTPError, URLError
import json
from concurrent.futures import ThreadPoolExecutor

def retrieve_from_url(url: str) -> any:
    try:
        with urlopen(url) as response:
            data = json.load(response)

    except HTTPError as e:
        if e.code == 404:
            raise HTTPException(
                status_code=404,
                detail="Data not found."
            )
        raise HTTPException(
            status_code=e.code,
            detail="Failed to retrieve data."
        )

    except URLError:
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to host API."
        )

    return data


from concurrent.futures import ThreadPoolExecutor


def fetch_psych_sheet(competition_id: str, event_id: str, country_iso2: str):
    psych_sheet = retrieve_from_url(f"https://www.worldcubeassociation.org/api/v0/competitions/{competition_id}/psych-sheet/{event_id}")

    return {
        "event_id": event_id,
        "psych_sheet": [
            {
                "name": record["name"],
                "user_id": record["user_id"],
                "country_iso2": record["country_iso2"],
                "average_best": record["average_best"],
                "single_best": record["single_best"],
                "pos": record["pos"],
            }
            for record in psych_sheet["sorted_rankings"]
            if record["country_iso2"] == country_iso2
        ],
    }


def fetch_competition_info(competition_id: str):
    competition = retrieve_from_url(f"https://www.worldcubeassociation.org/api/v0/competitions/{competition_id}")

    competition_name = competition.get("name", "No name")
    event_ids = competition.get("event_ids", [])
    country_iso2 = competition.get("country_iso2", "VN")
    competition_start_date = competition.get("start_date", "1970-01-01")
    competition_end_date = competition.get("end_date", "1970-01-01")
    competition_registration_open = competition.get("registration_open", "1970-01-01")
    competition_registration_close = competition.get("registration_close", "1970-01-01")
    psych_sheets = []

    # Get psych sheet for each event_id
    with ThreadPoolExecutor(max_workers=8) as executor:
        psych_sheets = list(
            executor.map(
                lambda event_id: fetch_psych_sheet(competition_id, event_id, country_iso2),
                event_ids,
            )
        )

    return competition_name, event_ids, country_iso2, competition_start_date, competition_end_date, competition_registration_open, competition_registration_close, psych_sheets