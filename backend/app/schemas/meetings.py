from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from uuid import UUID

class MeetingCreateText(BaseModel):
    title: Optional[str] = "Untitled Meeting"
    meeting_date: Optional[date] = None
    # We require the text field, but we will handle the strict "empty" 400 error in the route
    text: str = Field(..., description="The raw transcript or notes of the meeting.")

class MeetingResponse(BaseModel):
    id: UUID
    status: str

    class Config:
        from_attributes = True  # Allows Pydantic to read SQLAlchemy models