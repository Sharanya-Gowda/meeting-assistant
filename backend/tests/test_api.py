from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

# Global safe mock data for Gemini response mapping
MOCK_AI_RESULTS = {
    "short_summary": "Test short summary",
    "detailed_summary": "Test detailed summary",
    "action_items": [],
    "decisions": [],
    "blockers": []
}

VALID_LONG_TEXT = (
    "This is an officially verified, highly detailed, and completely valid meeting transcript "
    "intended to be processed by the automated backend unit test suites of the meeting assistant application. "
    "We are discussing the core engineering milestones for the project, assigning clear action items to team members, "
    "resolving architecture blockages, and setting explicit deadlines to align with our production roadmap constraints seamlessly."
)

@patch("app.main.process_meeting_text")
@patch("app.main.save_extraction_results")
def test_create_meeting_text_success(mock_save, mock_ai):
    """Test that valid input successfully creates a pending meeting."""
    mock_ai.return_value = MOCK_AI_RESULTS
    mock_save.return_value = True
    
    response = client.post(
        "/api/meetings/text",
        json={
            "title": "Week 2 Sprint Planning",
            "meeting_date": "2026-05-25",
            "text": VALID_LONG_TEXT
        }
    )
    assert response.status_code == 201
    assert "id" in response.json()

def test_create_meeting_text_empty_error():
    """Test that empty text triggers a 400 error when structurally complete."""
    response = client.post(
        "/api/meetings/text",
        json={
            "title": "Empty Meeting",
            "meeting_date": "2026-05-25", # Added to bypass Pydantic 422 checks
            "text": "   "
        }
    )
    assert response.status_code == 400

def test_create_meeting_text_missing_field_error():
    """Test that missing required fields triggers a 422 validation error."""
    response = client.post(
        "/api/meetings/text",
        json={
            "title": "Missing Fields"
        }
    )
    assert response.status_code == 422

def test_very_short_input():
    """Test that short input returns 400 error."""
    response = client.post(
        "/api/meetings/text",
        json={
            "title": "Short Input Test",
            "meeting_date": "2026-05-25",
            "text": "Too short snippet text."
        }
    )
    assert response.status_code == 400

def test_filler_no_substance_input():
    """Test that input with less than 20 total chars is caught."""
    response = client.post(
        "/api/meetings/text",
        json={
            "title": "Substance Test",
            "meeting_date": "2026-05-25",
            "text": "abc"
        }
    )
    assert response.status_code == 400