from sqlalchemy.orm import Session
from app.db.models import Meeting, ActionItem, Decision, Blocker
import logging

logger = logging.getLogger("uvicorn.error")

def save_extraction_results(meeting_id, results: dict, db: Session) -> bool:
    """
    Ingests AI results, maps arrays to child relational components, 
    and updates parent status flags.
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        logger.error(f"Meeting session ID {meeting_id} not found during storage.")
        return False

    try:
        # 1. Update text summary analytics and email fragments on the meeting record
        meeting.short_summary = results.get("short_summary")
        meeting.detailed_summary = results.get("detailed_summary")
        meeting.followup_email = results.get("followup_email")
        
        # Compute dynamic word count metric for logs
        if meeting.raw_input_text:
            meeting.word_count = len(meeting.raw_input_text.split())

        # 2. Iterate and map extracted Action Items
        for item in results.get("action_items", []):
            db_item = ActionItem(
                meeting_id=meeting.id,
                description=item.get("description"),
                owner=item.get("owner", "Not identified"),
                deadline=item.get("deadline", "Not specified"),
                priority=item.get("priority", "not specified").lower()
            )
            db.add(db_item)

        # 3. Iterate and map Decisions
        for decision in results.get("decisions", []):
            db_decision = Decision(
                meeting_id=meeting.id,
                description=decision.get("description"),
                decided_by=decision.get("decided_by", "Not identified")
            )
            db.add(db_decision)

        # 4. Iterate and map Blockers
        for blocker in results.get("blockers", []):
            db_blocker = Blocker(
                meeting_id=meeting.id,
                description=blocker.get("description"),
                type=blocker.get("type", "blocker").lower(),
                raised_by=blocker.get("raised_by", "Not identified")
            )
            db.add(db_blocker)

        # 5. Flip status code to completed on atomic execution success
        meeting.status = "completed"
        db.commit()
        return True

    except Exception as e:
        db.rollback()
        logger.error(f"Storage lifecycle failure for meeting {meeting_id}: {str(e)}")
        
        # Gracefully handle internal transaction failure states natively in the database
        meeting.status = "failed"
        meeting.error_message = str(e)
        db.commit()
        return False