import uuid
from sqlalchemy import Column, String, Date, DateTime, Integer, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=True)
    meeting_date = Column(Date, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    input_type = Column(String(50), nullable=False)
    raw_input_text = Column(Text, nullable=False)
    original_filename = Column(String(500), nullable=True)
    status = Column(String(50), default="pending", index=True)
    error_message = Column(Text, nullable=True)
    word_count = Column(Integer, nullable=True)
    short_summary = Column(Text, nullable=True)
    detailed_summary = Column(Text, nullable=True)
    followup_email = Column(Text, nullable=True)

    # Relationships mapped to cascading constraints
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    decisions = relationship("Decision", back_populates="meeting", cascade="all, delete-orphan")
    blockers = relationship("Blocker", back_populates="meeting", cascade="all, delete-orphan")
    processing_logs = relationship("ProcessingLog", back_populates="meeting", cascade="all, delete-orphan")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    owner = Column(String(200), default="Not identified", nullable=True)
    deadline = Column(String(200), default="Not specified", nullable=True)
    priority = Column(String(50), default="not specified", nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    meeting = relationship("Meeting", back_populates="action_items")

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    decided_by = Column(String(200), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    meeting = relationship("Meeting", back_populates="decisions")

class Blocker(Base):
    __tablename__ = "blockers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # "blocker" / "risk" / "open_question"
    raised_by = Column(String(200), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    meeting = relationship("Meeting", back_populates="blockers")

class ProcessingLog(Base):
    __tablename__ = "processing_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    model_used = Column(String(100), default="gemini-1.5-flash")
    prompt_tokens = Column(Integer, nullable=True)
    response_tokens = Column(Integer, nullable=True)
    success = Column(Boolean, default=True)
    error_details = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)

    meeting = relationship("Meeting", back_populates="processing_logs")