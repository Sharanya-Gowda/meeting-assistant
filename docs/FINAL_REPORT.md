# Final Project Report: Meeting-to-Execution Assistant

## Project Summary
The Meeting-to-Execution Assistant is an AI-powered full-stack web application built as an internship project for Bharat Electronics Limited (BEL). The application transforms raw meeting transcripts and notes into actionable intelligence by automatically extracting structured summaries, action items, decisions, and blockers.

## What Was Built
* **Frontend:** A responsive React SPA (built with Vite) featuring transcript pasting, document uploading, a real-time processing polling state, and a searchable history ledger.
* **Backend:** A robust FastAPI REST API that handles multipart file ingestion (.txt, .md, .docx), strict Pydantic payload validation, and CORS management.
* **AI Pipeline:** Integration with the Google Gemini (2.5 Flash) API using a highly refined, strictly typed system prompt to enforce JSON output.
* **Database:** A relational PostgreSQL database (hosted on Neon) managed via SQLAlchemy, featuring cascading deletions and relationship mapping.
* **Deployment:** Fully deployed cloud architecture using Vercel (Frontend) and Render (Backend).

## What Works Well
* **AI Extraction Accuracy:** The strict prompt engineering and Pydantic validation ensure that the Gemini model consistently returns properly formatted JSON without hallucinations.
* **Full-Stack Integration:** The frontend polling mechanism gracefully handles the wait time while the backend synchronously processes the AI request.
* **Database Relational Integrity:** Using `ondelete="CASCADE"` ensures that deleting a parent meeting instantly cleans up all associated action items and decisions, preventing orphaned rows.

## What Does Not Work Well (Honest Evaluation)
* **Long File Processing:** Because the application processes data synchronously, extremely massive meeting transcripts run the risk of hitting the 60-second HTTP timeout limit on Render before the AI finishes processing.
* **Polling Overhead:** The frontend currently polls the backend every 3 seconds to check if a meeting is "completed." While functional for an MVP, this creates unnecessary network traffic compared to a real-time connection.

## Technical Decisions and Trade-offs
1. **FastAPI over Flask/Django:** Chosen for its native async support, lightning-fast execution, and automatic OpenAPI (`/docs`) generation.
2. **PostgreSQL over MongoDB:** Meeting data is inherently relational (One Meeting -> Many Action Items). Postgres allowed us to enforce strict schema constraints.
3. **Gemini 2.5 Flash over Pro models:** Traded deep-reasoning depth for faster response times and lower token costs, which is ideal for a synchronous MVP.
4. **Synchronous Processing over Async Queues:** To keep the MVP within the internship time constraints, I opted for synchronous API processing instead of deploying a background worker queue (like Celery + Redis). 

## What I Learned
* **AI Integration:** How to anchor an unpredictable LLM to output predictable, structured data using strict system prompts and fallback error handling.
* **Cloud Deployment:** How to resolve environment variable mismatches, configure cross-origin resource sharing (CORS), and fix native dependency build errors on Linux containers (Render).
* **Database Migrations:** Managing SQLAlchemy sessions, engines, and relational schema mappings.

## What I Would Do Differently
* Optimization on generating the results based on hand written text (handwriting analysis). 
* I would implement **WebSockets** (or Server-Sent Events) for the frontend-backend connection so the UI updates instantly when processing is done, eliminating the 3-second polling loop.
* I would offload the Gemini API calls to a **Background Task Queue** (Celery/RabbitMQ) so the FastAPI server can immediately return a 202 Accepted response without holding the HTTP connection open.

## Future Improvements
1. **Third-Party Integrations:** Add one-click exports to Jira, Trello, or Slack.
2. **Authentication (SSO):** Implement OAuth2 so multiple BEL employees can log in and manage their own isolated meeting histories.
3. **Audio Transcription:** Integrate an audio-to-text model (like OpenAI Whisper) so users can upload raw `.mp3` or `.wav` meeting recordings.
4. **Advanced Filtering:** Add frontend UI filters to sort history by date ranges, specific owners, or priority levels.
5. **Background Task Workers:** Refactor the architecture to use Celery for handling massive transcripts without timeout risks.

## Time Spent Breakdown (Estimate)
* **Requirements, Architecture & Setup:** 15%
* **Backend API & Database Models:** 25%
* **AI Pipeline & Prompt Engineering:** 20%
* **Frontend UI & Integration:** 25%
* **Testing, Edge Cases & Deployment:** 15%