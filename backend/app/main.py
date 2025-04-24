from fastapi import FastAPI
from app.routes import auth_routes, user_routes, workout_routes, stats_routes, plans_routes
from app import firebase_config
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; adjust for production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers (e.g., Authorization)
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(workout_routes.router)
app.include_router(stats_routes.router, prefix="/stats")
app.include_router(plans_routes.router, prefix="/plans", tags=["plans"])
#app.include_router(exercises_routes.router, prefix="/exercises", tags=["exercises"])

@app.get("/")
async def root():
    return {"message": "FitTrack Backend (Testing Mode)"}