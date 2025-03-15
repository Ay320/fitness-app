from fastapi import FastAPI
from app.routes import auth_routes, user_routes
from app import firebase_config

app = FastAPI()

app.include_router(auth_routes.router)
app.include_router(user_routes.router)

@app.get("/")
async def root():
    return {"message": "FitTrack Backend (Testing Mode)"}