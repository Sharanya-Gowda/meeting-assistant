import os
from datetime import datetime
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from uuid import UUID
from sqlalchemy import or_

# CRITICAL: Force load environment variables BEFORE importing internal services
load_dotenv()

# Standard Framework and Database Imports 
from app.config import settings
from app.db.database import engine, Base, get_db
import app.db.models as models
from app.db.models import Meeting
from app.schemas.meetings import MeetingCreateText, MeetingResponse

# File Handling Utility Modules 
from app.utils.file_handling import validate_file, extract_text_from_file

# AI Processing & Relational Storage Services 
from app.services.ai_pipeline import process_meeting_text
from app.services.extraction import save_extraction_results
from app.schemas.meetings import MeetingCreateText, MeetingResponse, PaginatedMeetingResponse

from app.db.models import Meeting, ActionItem, Decision, Blocker
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

# --- Core Meeting Router Module ---
router = APIRouter()

@router.post("/api/meetings/text", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def submit_meeting_text(payload: MeetingCreateText, db: Session = Depends(get_db)):
    """
    Accepts raw text pasted in the request body, creates a pending database record,
    and runs the Gemini processing pipeline synchronously.
    """
    # 1. Enforce string parameters and character constraints 
    stripped_text = payload.text.strip()
    if not stripped_text or len(stripped_text) < 20:
        raise HTTPException(
            status_code=400, 
            detail="Invalid text length. Raw content text must contain at least 20 character elements."
        )
        
    # 2. Instantiate parent record placeholder setting initial status to pending 
    new_meeting = Meeting(
        title=payload.title,
        meeting_date=payload.meeting_date,
        input_type="text", 
        raw_input_text=stripped_text,
        status="pending"
    )
    
    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)
    
    # 3. Synchronous Pipeline Execution Link 
    ai_results = process_meeting_text(stripped_text)
    
    # Commit child relational lists into database structures
    success = save_extraction_results(new_meeting.id, ai_results, db)
    
    if not success:
        raise HTTPException(
            status_code=500, 
            detail="Failed to unpack and save AI analytics components safely to server database."
        )
        
    # Force refresh local memory reference state to represent the new completed database values 
    db.refresh(new_meeting)
    return new_meeting


@router.post("/api/meetings/upload", response_model=MeetingResponse, status_code=status.HTTP_202_ACCEPTED)
def upload_meeting_file(
    file: UploadFile = File(...),
    title: str = Form(...),
    meeting_date: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Ingests meeting files via multipart form data, extracts internal transcript tokens,
    and routes metadata directly through the Gemini processing ecosystem. 
    """
    # 1. Run Security Boundary Validation Constraints (.txt, .md, .docx, Max 10MB) 
    validate_file(file)
    
    # 2. Extract Document String Context Buffers safely 
    extracted_transcript = extract_text_from_file(file)
    
    # Extra verification check for minimum text density 
    if len(extracted_transcript) < 20:
        raise HTTPException(
            status_code=400,
            detail="Extracted string density is insufficient. Content stream must yield at least 20 character entries."
        )
        
    # 3. Convert incoming date string into a standard date object format
    try:
        parsed_date = datetime.strptime(meeting_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid meeting_date format. Please use the ISO-8601 standard: YYYY-MM-DD."
        )

    # 4. Instantiate Persistent Parent Ledger with status flag set to pending
    new_meeting = Meeting(
        title=title,
        meeting_date=parsed_date,
        input_type="file",
        original_filename=file.filename,
        raw_input_text=extracted_transcript,
        status="pending"
    )
    
    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)
    
    # 5. Process Content Stream Synchronously through your AI Pipeline 
    ai_results = process_meeting_text(extracted_transcript)
    
    # 6. Distribute Relational Tables Extraction Matrices (Action Items, Decisions, Blockers)
    success = save_extraction_results(new_meeting.id, ai_results, db)
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to decompose file extraction datasets cleanly into storage."
        )
        
    # Force memory state refresh to return the final parsed completed structure
    db.refresh(new_meeting)
    return new_meeting


@router.get("/api/meetings/search/query", response_model=PaginatedMeetingResponse)
def search_meetings(q: str, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    Searches meetings by title, text, summaries, and associated action items/decisions.
    """
    if not q or len(q.strip()) == 0:
        return {"total": 0, "page": 1, "size": limit, "items": []}

    search_term = f"%{q.strip()}%"

    # The magic of SQLAlchemy: Search the main table OR child tables using .any()
    search_filter = or_(
        Meeting.title.ilike(search_term),
        Meeting.raw_input_text.ilike(search_term),
        Meeting.short_summary.ilike(search_term),
        Meeting.detailed_summary.ilike(search_term),
        Meeting.action_items.any(ActionItem.description.ilike(search_term)),
        Meeting.decisions.any(Decision.description.ilike(search_term))
    )

    total_matches = db.query(Meeting).filter(search_filter).count()
    
    meetings = (
        db.query(Meeting)
        .filter(search_filter)
        .order_by(Meeting.meeting_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    current_page = (skip // limit) + 1

    return {
        "total": total_matches,
        "page": current_page,
        "size": limit,
        "items": meetings
    }

@router.get("/api/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieve full meeting data and related items.
    FastAPI will automatically gather and attach all Action Items, Decisions, and Blockers
    because of the response_model=MeetingResponse declaration!
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Meeting not found"
        )
        
    return meeting

@router.get("/api/meetings/{meeting_id}/status")
def get_meeting_status(meeting_id: UUID, db: Session = Depends(get_db)):
    """Lightweight endpoint for frontend polling."""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Meeting not found"
        )
    return {"status": meeting.status}

@router.get("/api/meetings", response_model=PaginatedMeetingResponse)
def get_all_meetings(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    Returns a paginated list of all meetings, sorted by most recent first.
    """
    # 1. Get the total count of meetings in the database
    total_meetings = db.query(Meeting).count()
    
    # 2. Fetch the limited chunk of meetings, ordered by date descending
    meetings = (
        db.query(Meeting)
        .order_by(Meeting.meeting_date.desc(), Meeting.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # 3. Calculate current page number
    current_page = (skip // limit) + 1
    
    return {
        "total": total_meetings,
        "page": current_page,
        "size": limit,
        "items": meetings
    }

# 5. Include the router into the active FastAPI app instance 
app.include_router(router)