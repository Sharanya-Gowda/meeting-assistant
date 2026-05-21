# Project Scope

## In Scope (MVP)
* **Inputs:** Accept pasted text notes and uploaded transcript files (`.txt`, `.md`, `.docx`).
* **AI Extraction:** Use Gemini 1.5 Flash to extract:
  * Short summary (3-5 sentences)
  * Detailed summary (1-3 paragraphs)
  * Decisions made
  * Action items (with descriptions, owners, deadlines, and priorities)
  * Blockers, risks, and open questions
  * Draft follow-up email
* **Storage:** Store all raw inputs and extracted metadata in a PostgreSQL database.
* **History:** A searchable meeting history interface.

## Out of Scope
* General-purpose chatbots or fully autonomous AI agents.
* Real-time audio/video meeting transcription.
* Slack bots or calendar scheduling integrations.
* Project management features (we are not rebuilding Jira).
* Audio/Video file upload (Stretch goal only).

## Assumptions
* Users will input English text or transcripts that contain discernible meeting context.
* The Google Gemini API free tier will remain sufficient for our testing volume.

## Risks
* **AI Hallucination:** The model might invent owners or deadlines not present in the text. *Mitigation:* Strict prompting rules and returning "Not identified" or "Not specified".
* **Rate Limits:** Hitting Gemini API limits during testing.

## Success Criteria
A fully deployed, end-to-end web application (React + FastAPI) where a user can submit messy meeting notes and instantly receive a highly accurate, structured list of action items, decisions, and an email draft.