
from fastapi import FastAPI
from app.routes import auth_routes  # Import the router module
from app import firebase_config  # Ensures Firebase is initialized

app = FastAPI()

app.include_router(auth_routes.router) # Include the router

@app.get("/")
async def root():
    return {"message": "FitTrack Backend (Testing Mode)"}