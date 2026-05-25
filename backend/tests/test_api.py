from fastapi.testclient import TestClient
from app.main import app 

client = TestClient(app)

def test_create_meeting_text_success():
    """Test that valid input successfully creates a pending meeting."""
    response = client.post(
        "/api/meetings/text",
        json={
            "title": "Week 2 Sprint Planning",
            "meeting_date": "2026-05-25",
            "text": "This is a valid meeting transcript that easily exceeds the twenty character minimum requirement for the project."
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["status"] == "pending"

def test_create_meeting_text_empty_error():
    """Test that empty text triggers a 400 error."""
    response = client.post(
        "/api/meetings/text",
        json={
            "title": "Empty Meeting",
            "text": "   "
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Meeting text cannot be empty."

def test_create_meeting_text_missing_field_error():
    """Test that missing the required 'text' field triggers a 422 error."""
    response = client.post(
        "/api/meetings/text",
        json={
            "title": "Missing Text Meeting"
            # 'text' field is missing entirely
        }
    )
    assert response.status_code == 422