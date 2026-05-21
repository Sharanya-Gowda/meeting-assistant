# Database Schema Specification

**Database Engine:** PostgreSQL (Relational)  
**ORM:** SQLAlchemy 2.0  

---

## 1. Entity-Relationship Definitions

### Table: `meetings`
Tracks individual meeting instances and their processing lifecycles.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary key, auto-generated |
| `title` | VARCHAR(500) | User-provided or auto-generated |
| `meeting_date` | DATE | Date of the actual meeting |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last modification timestamp |
| `input_type` | VARCHAR(50) | `"text"`, `"transcript_file"`, or `"audio"` |
| `raw_input_text` | TEXT | The unparsed baseline text input |
| `original_filename` | VARCHAR(500) | Filename metadata if uploaded (Nullable) |
| `status` | VARCHAR(50) | `"pending"`, `"processing"`, `"completed"`, or `"failed"` |
| `error_message` | TEXT | Detailed error logging if processing fails (Nullable) |
| `word_count` | INTEGER | Evaluated metrics for system chunking choices |
| `short_summary` | TEXT | Generated summary snippet (3-5 sentences) |
| `detailed_summary` | TEXT | In-depth context summary paragraphs |
| `followup_email` | TEXT | Generated professional email draft markdown |

### Table: `action_items`
Actionable tasks assigned to individuals.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary key |
| `meeting_id` | UUID | Foreign key referencing `meetings.id` (ON DELETE CASCADE) |
| `description` | TEXT | Clear task instructions |
| `owner` | VARCHAR(200) | Responsible party. Defaults to `"Not identified"` |
| `deadline` | VARCHAR(200) | Due date. Stored as text to handle variable timeline phrases |
| `priority` | VARCHAR(50) | `"high"`, `"medium"`, `"low"`, or `"not specified"` |
| `status` | VARCHAR(50) | Current task status: `"pending"`, `"in_progress"`, or `"done"` |
| `created_at` | TIMESTAMP | Record creation timestamp |

### Table: `decisions`
Key assertions and agreements finalized during execution.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary key |
| `meeting_id` | UUID | Foreign key referencing `meetings.id` (ON DELETE CASCADE) |
| `description` | TEXT | Specific details of the outcome decided |
| `decided_by` | VARCHAR(200) | Individual or entity who finalized the decision (Nullable) |
| `created_at` | TIMESTAMP | Record creation timestamp |

### Table: `blockers`
Risks, friction points, or unresolved issues flagged during sessions.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary key |
| `meeting_id` | UUID | Foreign key referencing `meetings.id` (ON DELETE CASCADE) |
| `description` | TEXT | Explanation of the threat or inquiry |
| `type` | VARCHAR(50) | `"blocker"`, `"risk"`, or `"open_question"` |
| `raised_by` | VARCHAR(200) | Individual tracking/raising the issue (Nullable) |
| `created_at` | TIMESTAMP | Record creation timestamp |

### Table: `processing_logs`
System operational telemetry logs for AI evaluation.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary key |
| `meeting_id` | UUID | Foreign key referencing `meetings.id` |
| `started_at` | TIMESTAMP | Timestamp when model execution began |
| `completed_at` | TIMESTAMP | Timestamp when generation completed |
| `model_used` | VARCHAR(100) | AI variant tracking, e.g., `"gemini-1.5-flash"` |
| `prompt_tokens` | INTEGER | Token utilization metric |
| `response_tokens`| INTEGER | Token collection response metric |
| `success` | BOOLEAN | Operational execution validation check status |
| `error_details` | TEXT | Full traceback storage context if `success == false` |
| `retry_count` | INTEGER | Pipeline execution retry iteration counter |

---

## 2. Structural Relationships
* **One-to-Many Relationships:**
  * `meetings` ➔ `action_items`
  * `meetings` ➔ `decisions`
  * `meetings` ➔ `blockers`
  * `meetings` ➔ `processing_logs`

## 3. Performance Indexes
To protect system read latency during continuous production loads, the following targeted indices are required:
* `B-Tree` Index on `meetings.status` (Optimizes rapid retrieval during background UI polling state checks)
* `B-Tree` Index on `meetings.created_at` (Optimizes chronologically sorted dashboards)
* `B-Tree` Indexes on `action_items.meeting_id`, `decisions.meeting_id`, and `blockers.meeting_id` (Optimizes nested lookup aggregation performance)
* `GIN / Full-Text Search` Index on `meetings.title` and `meetings.raw_input_text` (Powers instant operational global dashboard multi-match keywords search query routines)