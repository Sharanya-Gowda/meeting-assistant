# API Specification

**Base Path:** `/api`  
**Framework:** FastAPI (Python 3.11+)  
**Standard Format:** `application/json`

---

## 1. Meeting Ingestion Endpoints

### `POST /api/meetings/text`
Submit raw meeting notes directly as text.

**Request Body Schema:**
```json
{
  "title": "Sprint Planning - June 12",
  "meeting_date": "2025-06-12",
  "text": "We discussed the new feature timeline..."
}
```

**Response (202 Accepted):**
```json
{
  "meeting_id": "uuid-here",
  "status": "processing",
  "message": "Meeting submitted. Processing started."
}
```

**Error Responses:**
- `400 Bad Request`: Empty text or text too short (< 20 characters)
- `422 Unprocessable Entity`: Missing required fields or invalid data format

---

### `POST /api/meetings/upload`
Upload a meeting transcript file for parsing and text extraction.

**Content-Type:** `multipart/form-data`

**Form Parameters:**
- `file`: The transcript file attachment (`.txt`, `.md`, `.docx`)
- `title`: String (Optional)
- `meeting_date`: String (Optional, format: YYYY-MM-DD)

**Response (202 Accepted):**
```json
{
  "meeting_id": "uuid-here",
  "status": "processing",
  "message": "File uploaded. Processing started."
}
```

**Error Responses:**
- `400 Bad Request`: Unsupported file type, file with no readable text, or corrupted file
- `413 Payload Too Large`: File exceeds 10 MB size limit

---

## 2. Retrieval & Operational Endpoints

### `GET /api/meetings/{meeting_id}`
Retrieve the full data payload and all associated components extracted from a single meeting.

**Path Parameters:**
- `meeting_id`: UUID of the meeting

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Sprint Planning - June 12",
  "meeting_date": "2025-06-12",
  "status": "completed",
  "input_type": "text",
  "word_count": 847,
  "short_summary": "The team reviewed the Q3 marketing plan. Budget allocation for digital campaigns was approved. Launch date was set for August 15.",
  "detailed_summary": "The meeting focused on finalizing the Q3 marketing strategy...",
  "followup_email": "Hi team,Thank you for attending today's meeting...",
  "action_items": [
    {
      "id": "uuid",
      "description": "Update the API documentation",
      "owner": "Rahul",
      "deadline": "June 15",
      "priority": "high",
      "status": "pending"
    }
  ],
  "decisions": [
    {
      "id": "uuid",
      "description": "Use PostgreSQL instead of MongoDB",
      "decided_by": "Tech Lead"
    }
  ],
  "blockers": [
    {
      "id": "uuid",
      "description": "Waiting for design approval from client",
      "type": "blocker",
      "raised_by": "Priya",
      "created_at": "2025-06-12T10:30:00Z"
    }
  ],
  "created_at": "2025-06-12T10:30:00Z",
  "updated_at": "2025-06-12T10:35:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Meeting ID does not exist

---

### `GET /api/meetings`
List all recorded historical meetings with default parameters for backend pagination.

**Query Parameters:**
- `page`: Integer (default: `1`)
- `per_page`: Integer (default: `10`)
- `status`: String (Optional filter - "pending", "processing", "completed", "failed")
- `sort_by`: String (default: `"created_at"`)
- `sort_order`: String (default: `"desc"` - options: "asc", "desc")

**Response (200 OK):**
```json
{
  "meetings": [
    {
      "id": "uuid",
      "title": "Sprint Planning - June 12",
      "meeting_date": "2025-06-12",
      "status": "completed",
      "input_type": "text",
      "word_count": 847,
      "short_summary": "The team reviewed the Q3 marketing plan...",
      "action_item_count": 5,
      "decision_count": 3,
      "created_at": "2025-06-12T10:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "per_page": 10
}
```

---

### `GET /api/meetings/search`
Search across historical records using keyword parameters. This targets the `title`, `raw_input_text`, `short_summary`, action item descriptions, and decision descriptions.

**Query Parameters:**
- `q`: String (Search query phrase - required)
- `page`: Integer (default: `1`)
- `per_page`: Integer (default: `10`)

**Response (200 OK):** Same structural format as `GET /api/meetings`.

**Example Request:**
GET /api/meetings/search?q=budget&page=1&per_page=10

---

### `GET /api/meetings/{meeting_id}/status`
Check the live background processing status of a submitted meeting.

**Path Parameters:**
- `meeting_id`: UUID of the meeting

**Response (200 OK):**
```json
{
  "meeting_id": "uuid",
  "status": "processing",
  "started_at": "2025-06-12T10:30:00Z"
}
```

**Possible Status Values:**
- `pending`: Meeting created, not yet processed
- `processing`: AI extraction in progress
- `completed`: Processing finished successfully
- `failed`: Processing encountered an error

**Error Responses:**
- `404 Not Found`: Meeting ID does not exist

---

### `DELETE /api/meetings/{meeting_id}`
Delete a specific meeting record and all associated relational components permanently from the database.

**Path Parameters:**
- `meeting_id`: UUID of the meeting

**Response (200 OK):**
```json
{
  "message": "Meeting deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Meeting ID does not exist

**Note:** This operation cascades and deletes all associated action items, decisions, blockers, and processing logs.

---

## 3. Infrastructure Utilities

### `GET /api/health`
System dependency layer live health verification check.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-06-12T10:30:00Z"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "timestamp": "2025-06-12T10:30:00Z",
  "error": "Database connection failed"
}
```

---

## Error Response Format

All error responses follow this consistent format:

```json
{
  "detail": "Descriptive error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-06-12T10:30:00Z"
}
```

---

## Rate Limiting

Currently no rate limiting is enforced. Future versions may implement per-user or per-IP rate limits.

---

## Authentication

MVP version does not include authentication. All endpoints are publicly accessible. Future versions will implement API key or OAuth-based authentication.

---

## CORS Configuration

The API accepts requests from:
- `http://localhost:5173` (local development)
- Deployed frontend domain (configured via `CORS_ORIGINS` environment variable)

---

## Notes

1. All timestamps are in ISO 8601 format with timezone (UTC)
2. All UUIDs are version 4
3. File size limit for uploads: 10 MB
4. Supported file formats: `.txt`, `.md`, `.docx`
5. Minimum text length for processing: 20 characters
6. Processing timeout: 60 seconds (after which status is marked as "failed")
7. Maximum retries for AI API calls: 2

---

## Future Endpoints (Not in MVP)

The following endpoints are planned for future versions:

- `PATCH /api/meetings/{meeting_id}/action_items/{item_id}` - Update action item status
- `POST /api/meetings/{meeting_id}/export` - Export meeting to PDF or Markdown
- `POST /api/auth/login` - User authentication
- `GET /api/stats` - Usage statistics and analytics