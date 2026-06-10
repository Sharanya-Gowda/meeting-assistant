import os
os.environ["GEMINI_API_KEY"] = "mock_testing_dummy_gemini_api_key_placeholder"
import json
import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from google.genai import errors

# Import the core function under test
from app.services.ai_pipeline import process_meeting_text

# Reusable mock response layout mimicking the requested Gemini JSON structure
MOCK_GEMINI_JSON_RETURN = {
    "short_summary": "The team reviewed architectural guidelines for cloud migration.",
    "detailed_summary": "The discussion centered around upgrading the server tier and managing configuration states.",
    "decisions": [
        {"description": "Migrate from local storage to Neon Postgres serverless instances.", "decided_by": "Group"}
    ],
    "action_items": [
        {"description": "Update data engine connection properties", "owner": "Sarah", "deadline": "Friday", "priority": "high"}
    ],
    "blockers": [
        {"description": "AWS network container alignment lag", "type": "risk", "raised_by": "David"}
    ],
    "followup_email": "Subject: Architecture Alignment Review Summary..."
}


# 1. Test Case: Successful Pipeline Execution (Happy Path with Markdown Cleaning)
@patch("app.services.ai_pipeline.client.models.generate_content")
def test_process_meeting_text_success(mock_generate_content):
    """
    Verifies that valid text passing the initial keyword heuristic checks
    is sent to Gemini, and markdown backticks are cleanly stripped before JSON parsing.
    """
    # Arrange: Simulate Gemini returning code blocks ```json ... ```
    mock_response = MagicMock()
    mock_response.text = f"```json\n{json.dumps(MOCK_GEMINI_JSON_RETURN)}\n```"
    mock_generate_content.return_value = mock_response

    # Act: Pass text containing valid substantive keywords ("discuss", "team", "meeting")
    substantive_text = "Let us discuss the latest team updates regarding our project roadmap meeting."
    result = process_meeting_text(substantive_text)

    # Assert
    assert result == MOCK_GEMINI_JSON_RETURN
    mock_generate_content.assert_called_once()


# 2. Test Case: Perimeter Guard Heuristic Failure (Filler text with no substance)
def test_process_meeting_text_filler_heuristic_error():
    """
    Validates that casual text containing no professional roadmap keywords
    is immediately rejected at the border layer without hitting the API.
    """
    filler_text = "Hello hello! Good morning. Um, testing one two three. Is this microphone working fine?"
    
    with pytest.raises(HTTPException) as exc_info:
        process_meeting_text(filler_text)
        
    assert exc_info.value.status_code == 400
    assert "Transcript lacks substantive meeting context" in exc_info.value.detail


# 3. Test Case: External API Error Retry Loop and Final 502 Throw
@patch("app.services.ai_pipeline.client.models.generate_content")
@patch("time.sleep")  # Patch sleep to make tests run instantly without delay loops
def test_process_meeting_text_api_error_retry_exhausted(mock_sleep, mock_generate_content):
    """
    Assures that if the Gemini gateway throws a network API error, the loop tries 
    3 total times (1 initial + 2 retries) before transforming it into a clean 502 exception.
    """
    # Arrange: Force generate_content to throw an APIError across all retry loops
    # FIXED: Supplied correct parameters 'code' and 'response_json' required by google.genai.errors.APIError
    mock_generate_content.side_effect = errors.APIError(
        code=429, 
        response_json={"error": {"message": "Rate Limit Exceeded or Quota Blocked"}}
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        process_meeting_text("Let's discuss the team meeting updates.")

    assert exc_info.value.status_code == 502
    assert "Gemini API rate limit or connection timeout exceeded" in exc_info.value.detail
    
    # 1 original attempt + 2 retries = 3 total invocations
    assert mock_generate_content.call_count == 3
    assert mock_sleep.call_count == 2


# 4. Test Case: Malformed Unparseable JSON Retry Loop and Final 500 Throw
@patch("app.services.ai_pipeline.client.models.generate_content")
@patch("time.sleep")
def test_process_meeting_text_malformed_json_retry_exhausted(mock_sleep, mock_generate_content):
    """
    Validates that if the model returns broken unparseable text strings, the engine 
    retries to self-correct before terminating with a clear 500 structure exception.
    """
    # Arrange: Return malformed strings that fail json.loads()
    mock_response = MagicMock()
    mock_response.text = "{ broken malformed json object structure string "
    mock_generate_content.return_value = mock_response

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        process_meeting_text("Let's decide on the team actions for the next meeting.")

    assert exc_info.value.status_code == 500
    assert "Received malformed, unparseable JSON structure" in exc_info.value.detail
    assert mock_generate_content.call_count == 3


# 5. Test Case: In-Flight Processing Timeout Boundary (504 Gateway Timeout)
@patch("app.services.ai_pipeline.client.models.generate_content")
@patch("time.time")
def test_process_meeting_text_processing_timeout(mock_time, mock_generate_content):
    """
    Tests the strict time-guard policy. If processing exceeds 60 seconds during
    the execution loops, it must instantly raise a 504 Gateway Timeout.
    """
    # Arrange: Mock sequential time traces to simulate a 100-second jump on the second check
    mock_time.side_effect = [100.0, 200.0]

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        process_meeting_text("Let's update the team on the current action item statuses.")

    assert exc_info.value.status_code == 504
    assert "Processing timeout" in exc_info.value.detail


# 6. Test Case: Catch-All Unexpected Exception Fallback
@patch("app.services.ai_pipeline.client.models.generate_content")
def test_process_meeting_text_generic_fallback_exception(mock_generate_content):
    """
    Ensures that unexpected internal Python environment exceptions do not leak
    raw stack messages, but are safely wrapped into an internal server error.
    """
    # Arrange: Force a hard unexpected runtime error
    mock_generate_content.side_effect = RuntimeError("Fatal local memory allocation leakage")

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        process_meeting_text("Let's discuss the team meeting updates.")

    assert exc_info.value.status_code == 500
    assert "AI Pipeline Execution Core Failure" in exc_info.value.detail