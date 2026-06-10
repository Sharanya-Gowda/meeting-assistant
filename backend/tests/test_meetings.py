import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

VALID_LONG_TEXT = (
    "This is an officially verified, highly detailed, and completely valid meeting transcript "
    "intended to be processed by the automated backend unit test suites of the meeting assistant application. "
    "We are discussing the core engineering milestones for the project, assigning clear action items to team members, "
    "resolving architecture blockages, and setting explicit deadlines to align with our production roadmap constraints seamlessly."
)

MOCK_AI_RESULTS = {
    "short_summary": "Test short summary",
    "detailed_summary": "Test detailed summary",
    "action_items": [
        {"description": "Test action item", "owner": "Sarah", "deadline": "2026-06-30", "priority": "high"}
    ],
    "decisions": [
        {"description": "Test decision made", "decided_by": "Team"}
    ],
    "blockers": [
        {"description": "Test blocker identified", "raised_by": "Alex", "type": "technical"}
    ]
}

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@patch("app.main.process_meeting_text")
@patch("app.main.save_extraction_results")
def test_create_meeting_text_success(mock_save, mock_ai):
    mock_ai.return_value = MOCK_AI_RESULTS
    mock_save.return_value = True
    
    payload = {
        "title": "Valid Sync Transcript",
        "meeting_date": "2026-06-10",
        "text": VALID_LONG_TEXT
    }
    response = client.post("/api/meetings/text", json=payload)
    assert response.status_code == 201
    assert response.json()["title"] == "Valid Sync Transcript"

def test_submit_meeting_text_too_short():
    payload = {
        "title": "Short Failure Sync",
        "meeting_date": "2026-06-10",
        "text": "Too short input text string."
    }
    response = client.post("/api/meetings/text", json=payload)
    assert response.status_code == 400
    assert "Input is too short" in response.json()["detail"]

@patch("app.main.process_meeting_text")
@patch("app.main.extract_text_from_file")
@patch("app.main.validate_file")
@patch("app.main.save_extraction_results")
def test_upload_meeting_file_success(mock_save, mock_validate, mock_extract, mock_ai):
    mock_validate.return_value = True
    mock_extract.return_value = VALID_LONG_TEXT
    mock_ai.return_value = MOCK_AI_RESULTS
    mock_save.return_value = True

    form_data = {"title": "Valid File Upload Sync", "meeting_date": "2026-06-10"}
    files = {"file": ("transcript.txt", b"Dummy transcript contents", "text/plain")}
    
    response = client.post("/api/meetings/upload", data=form_data, files=files)
    assert response.status_code == 202

@patch("app.main.validate_file")
def test_upload_meeting_file_invalid_type(mock_validate):
    from fastapi import HTTPException
    mock_validate.side_effect = HTTPException(status_code=400, detail="Unsupported file format.")
    
    form_data = {"title": "Invalid File Sync", "meeting_date": "2026-06-10"}
    files = {"file": ("malicious.exe", b"binary", "application/x-msdownload")}
    
    response = client.post("/api/meetings/upload", data=form_data, files=files)
    assert response.status_code == 400

@patch("app.main.process_meeting_text")
@patch("app.main.save_extraction_results")
def test_meeting_lifecycle_and_not_found(mock_save, mock_ai):
    mock_ai.return_value = MOCK_AI_RESULTS
    mock_save.return_value = True
    payload = {
        "title": "Temporary Retrieval Target",
        "meeting_date": "2026-06-10",
        "text": VALID_LONG_TEXT
    }
    create_res = client.post("/api/meetings/text", json=payload)
    meeting_id = create_res.json()["id"]

    # Valid Retrieval
    get_res = client.get(f"/api/meetings/{meeting_id}")
    assert get_res.status_code == 200

    # Not Found Retrieval
    fake_id = "00000000-0000-0000-0000-000000000000"
    assert client.get(f"/api/meetings/{fake_id}").status_code == 404

def test_search_scenarios():
    no_results = client.get("/api/meetings/search/query?q=NonExistentKeywordXYZ")
    assert no_results.status_code == 200
    assert no_results.json()["items"] == []
    assert client.get("/api/meetings/search/query?q=").json()["items"] == []

@patch("app.main.process_meeting_text")
@patch("app.main.save_extraction_results")
def test_delete_meeting_lifecycle(mock_save, mock_ai):
    mock_ai.return_value = MOCK_AI_RESULTS
    mock_save.return_value = True
    payload = {
        "title": "Deletion Target Sync",
        "meeting_date": "2026-06-10",
        "text": VALID_LONG_TEXT
    }
    meeting_id = client.post("/api/meetings/text", json=payload).json()["id"]

    del_res = client.delete(f"/api/meetings/{meeting_id}")
    assert del_res.status_code == 200
    assert client.get(f"/api/meetings/{meeting_id}").status_code == 404