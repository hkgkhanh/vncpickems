import os
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

import bases.__init__ # needs this to init all models before init backend

from auth.routes import router as auth_router
from admins.routes import router as admins_router
from prediction_games.routes import router as prediction_games_router
from participants.routes import router as participants_router
from competition_results.routes import router as competition_results_router
from prediction_results.routes import router as prediction_results_router

load_dotenv()

ORIGIN = os.getenv("ORIGIN")

origins = [
    ORIGIN
]

app = FastAPI(title="VNC Pickems API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api/v0")

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(admins_router, prefix="/admins", tags=["admins"])
api_router.include_router(prediction_games_router, prefix="/prediction_games", tags=["prediction_games"])
api_router.include_router(participants_router, prefix="/participants", tags=["participants"])
api_router.include_router(competition_results_router, prefix="/competition_results", tags=["competition_results"])
api_router.include_router(prediction_results_router, prefix="/prediction_results", tags=["prediction_results"])

@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <html>
        <head>
            <title>VNC Pickems Backend Status</title>
        </head>
        <body>
            <p>VNC Pickems API v0 is up and ready.</p>
        </body>
    </html>
    """

@api_router.get("/health")
def health():
    return {"status": "ok"}

app.include_router(api_router)