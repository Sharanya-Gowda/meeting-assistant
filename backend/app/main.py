from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.config import settings
from app.db.database import engine, Base
import app.db.models as models
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Meeting
from app.schemas.meetings import MeetingCreateText, MeetingResponse

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

router = APIRouter()

@app.post("/api/meetings/text", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def submit_meeting_text(meeting_in: MeetingCreateText, db: Session = Depends(get_db)):
    # 1. Handle Error Case: Empty text -> 400 error
    stripped_text = meeting_in.text.strip()
    if not stripped_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Meeting text cannot be empty."
        )
    
    # 2. Validate: Must be at least 20 characters
    if len(stripped_text) < 20:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail="Meeting text must be at least 20 characters long."
        )

    # 3. Create the database record
    new_meeting = Meeting(
        title=meeting_in.title,
        meeting_date=meeting_in.meeting_date,
        raw_input_text=stripped_text,
        input_type="text",
        status="pending"
    )
    
    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)

    # 4. Return the new meeting ID and status
    return new_meeting