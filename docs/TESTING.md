# Meeting-to-Execution Assistant: Quality Assurance & Testing Manual

This document provides a comprehensive log of the automated test coverage matrix, manual verification checklists, and perimeter validation bounds designed for the Meeting-to-Execution Assistant.

---

## 1. Quality Assurance Strategy & Test Architecture
To preserve engineering performance, save network resources, and prevent live data contamination, the testing layer completely decouples core components from third-party systems. 
* All API tests leverage the FastAPI `TestClient`.
* Large Language Model operations are intercepted via `unittest.mock.patch` handlers to replicate Google Gemini behaviors without hitting the live `gemini-2.5-flash` endpoint.
* Top-level configuration environments are stabilized via `conftest.py` initialization arrays to isolate environment requirements.

---

## 2. Automated Test Matrix

### A. Core AI Pipeline Engine (`tests/test_ai_pipeline.py`)
This suite evaluates processing thresholds, JSON block formatting, parsing recovery routines, and error-handling pipelines.

* **`test_process_meeting_text_success`**: Confirms valid transcripts containing roadmap keys parse correctly. Verifies that markdown backticks (````json ... ````) are cleanly stripped by internal fallback cleaners before executing dictionary transformations.
* **`test_process_meeting_text_filler_heuristic_error`**: Validates that casual greetings or random talk with zero business substance are caught immediately by the perimeter layer, returning a `400 Bad Request`.
* **`test_process_meeting_text_api_error_retry_exhausted`**: Simulates structural `google.genai.errors.APIError` metrics (passing formal `code=429` and `response_json` blocks). Assures the loop runs exactly three times (1 primary attempt + 2 retry sequences) before raising a structured `502 Bad Gateway` exception.
* **`test_process_meeting_text_malformed_json_retry_exhausted`**: Passes unparseable strings through the decoder block to confirm that broken structures trigger retry logic up to the maximum limit before failing cleanly with a `500 Internal Server Error`.
* **`test_process_meeting_text_processing_timeout`**: Mocks the internal clock engine (`time.time`) to track execution time. Verifies that if loops exceed the 60-second processing constraint, the script immediately throws a `504 Gateway Timeout`.
* **`test_process_meeting_text_generic_fallback_exception`**: Tests system resilience by forcing unexpected runtime errors, verifying they are caught and wrapped into a standard `500` error message.

### B. Endpoint Router Architecture (`tests/test_meetings.py`)
This suite validates route mapping tables, data type parsing, database interaction hooks, and cascade delete rules.

* **`test_health_check`**: Asserts the main infrastructure gateway `/health` responds with a `200 OK` and returns a valid tracking trace block (`"status": "healthy"`).
* **`test_create_meeting_text_success`**: Verifies that structured text transcript payloads securely pass into the backend database register, producing a `201 Created` code and generating a unique tracking entity UUID.
* **`test_submit_meeting_text_too_short`**: Confirms that sending texts under 50 words is intercepted at the router layer and rejected with a `400 Bad Request`.
* **`test_upload_meeting_file_success`**: Simulates HTML multipart data structures (`multipart/form-data`) to assure valid document attachment formats parse text parameters correctly into status logs.
* **`test_upload_meeting_file_invalid_type`**: Intentionally passes an unsafe attachment structure (`.exe`) to confirm the security validation layer blocks the request with a `400 Bad Request`.
* **`test_meeting_lifecycle_and_not_found`**: Tests single row lookups. Verifies valid database keys fetch detailed record maps (`200 OK`), while incorrect or modified UUID selectors return a clean `404 Not Found`.
* **`test_search_scenarios`**: Tests global keyword indexers. Verifies that empty search queries or lookups with no results return empty lists safely without throwing system exceptions.
* **`test_delete_meeting_lifecycle`**: Tests the cascade wipe operation. Verifies that executing a delete command clears the parent row, cascades through all child relationship tables (Action Items, Decisions, Blockers), and makes subsequent lookup requests return a `404 Not Found`.

### C. Input Perimeter Guards (`tests/test_api.py`)
This suite focuses on Pydantic request body validation controls and strict length verification bounds.

* **`test_create_meeting_text_success`**: Assures that complete payloads containing all mandatory data formats pass smoothly.
* **`test_create_meeting_text_empty_error`**: Passes whitespace-filled input bodies to prove that text fields cannot be bypassed with blank spacing (`400 Bad Request`).
* **`test_create_meeting_text_missing_field_error`**: Validates schema compliance by omitting key fields, ensuring Pydantic returns a standard `422 Unprocessable Entity` response.
* **`test_very_short_input`**: Evaluates boundary limitations for transcripts beneath the 50-word rule threshold.
* **`test_filler_no_substance_input`**: Evaluates character constraints, ensuring inputs with less than 20 characters are caught at the entry perimeter.

---

## 3. Manual Testing Checklist (Production Deployment)
Manual testing checklists were performed end-to-end on the live product instances (**Vercel Frontend** + **Render Backend** + **Neon Serverless PostgreSQL DB**).

| Test ID | System Target Path | Input Parameter / Action | Observed Behavior & Performance | Status |
| :--- | :--- | :--- | :--- | :--- |
| **MT-01** | Home Ingestion Panel | Paste valid transcript (> 50 words) | Loading indicator overlay appears, processing completes, and user is redirected to the detail dashboard. | **PASSED** |
| **MT-02** | Upload Component | Drag and drop a standard `.docx` transcript file | Client extracts document text content and pushes metadata directly into the summary table. | **PASSED** |
| **MT-03** | History Ledger Panel | Type `"Sprint"` in the global search bar | Table rows filter instantly to show matching items. Empty input states reset to show the full paginated list. | **PASSED** |
| **MT-04** | Detail Panel | Click the primary "Delete Meeting" trash button | System confirmation alert triggers. Upon confirmation, data cascades and clears smoothly, and user is redirected home. | **PASSED** |

---

## 4. Handled Edge Cases Summary
1. **Conversational Banter Mitigation**: Structured prompt criteria prevent jokes, weather commentary, or greeting chatter from creating false action items or contaminating the summaries.
2. **Double Prefix Prefix Routing Protection**: Axios client interceptors clean base URL configuration strings automatically to prevent duplicate path concatenations (e.g., `/api/api/meetings`).
3. **Pydantic Validation Defenses**: Strict date-formatting models intercept malformed timestamp sequences before they ever hit downstream database workflows.

---

## 5. Execution Reference
To run the full automated test suite locally, activate your virtual environment (`.venv`) from the `backend/` directory and execute:
```bash
python -m pytest tests/ -v