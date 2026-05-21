from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.config import settings
from app.db.database import engine, Base
import app.db.models as models

# Run database schema structural generation routine checks
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Meeting-to-Execution Assistant API",
    description="Backend API skeleton for extracting structure from meeting context.",
    version="1.0.0"
)

# Configure CORS origins based on environment rules
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", tags=["Infrastructure"])
def health_check():
    """
    System dependency layer verification trace heartbeat check.
    """
    return {
        "status": "healthy",
        "database": "configuration_loaded",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }