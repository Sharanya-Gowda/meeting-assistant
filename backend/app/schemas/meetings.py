from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date
from uuid import UUID

# 1. Create schemas for the child relational tables
class ActionItemResponse(BaseModel):
    description: str
    owner: Optional[str] = "Not identified"
    deadline: Optional[str] = "Not specified"
    priority: Optional[str] = "not specified"

    model_config = ConfigDict(from_attributes=True)

class DecisionResponse(BaseModel):
    description: str
    decided_by: Optional[str] = "Not identified"

    model_config = ConfigDict(from_attributes=True)

class BlockerResponse(BaseModel):
    description: str
    type: str
    raised_by: Optional[str] = "Not identified"

    model_config = ConfigDict(from_attributes=True)

# 2. Keep your existing creation schema
class MeetingCreateText(BaseModel):
    title: str
    meeting_date: date
    text: str

# 3. CRITICAL FIX: Add the lists to your MeetingResponse
class MeetingResponse(BaseModel):
    id: UUID
    title: str
    meeting_date: date
    status: str
    
    # Text extractions
    short_summary: Optional[str] = None
    detailed_summary: Optional[str] = None
    followup_email: Optional[str] = None
    
    # Tell FastAPI to include the relational lists in the JSON!
    action_items: List[ActionItemResponse] = []
    decisions: List[DecisionResponse] = []
    blockers: List[BlockerResponse] = []

    model_config = ConfigDict(from_attributes=True)