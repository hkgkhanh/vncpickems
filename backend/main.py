from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()


@app.get("/", response_class=HTMLResponse)
def root():
    return f"""
    <html>
        <head>
            <title>Cube-Comp-Prediction Backend Status</title>
        </head>
        <body>
            <p>Cube-Comp-Prediction API v0 is up and ready.</p>
        </body>
    </html>
    """
