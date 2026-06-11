# Decisions Log

## Competitor Analysis
**Date:** [21-05-2026]
**Decision:** Focus strictly on post-meeting text extraction rather than real-time features.

**Alternatives Considered:**
1. **Otter.ai:** Best for real-time live transcription and immediate interactive search across past conversations.
2. **Fireflies.ai:** Best for deep CRM and app integrations, making it the top pick for sales and revenue operations teams.
3. **tl;dv:** Best for asynchronous video highlights and clipping specific recorded visual moments to share with others.
4. **Notion AI:** Best for centralised workspace documentation, allowing you to summarize pre-recorded or pasted transcripts directly inside your existing wiki databases.
5. **Fellow.app:** Best for comprehensive meeting management, combining agendas, action items, and task-tracking directly into a team's workflow. 

**Why Our Approach is Different:**
Our project will uniquely focus on being a single, lightweight tool that converts *existing* meeting content (pasted notes or transcripts) strictly into execution-ready structured outputs (Action Items, Decisions, Blockers). We are not building a chatbot, a real-time transcriber, or a heavy project management suite.

# Architectural & Engineering Decisions Log

This document records the major technical and design decisions made during the development of the Meeting-to-Execution Assistant MVP.

---

## Decision: Framework Choice: FastAPI
**Date:** 2026-05-25

**Decision:** We selected FastAPI as the core Python backend framework for the application.

**Alternatives Considered:**
- **Django** — Too heavy and monolithic for a lightweight REST API MVP; includes features (like template rendering and complex admin panels) that we do not need for a decoupled React frontend.
- **Flask** — Lacks native asynchronous support, built-in data validation, and automatic API documentation, requiring too many external plugins.

**Why Chosen:** FastAPI natively supports Pydantic for robust, strict data validation. It is built from the ground up for asynchronous routing (which is highly beneficial for IO-bound AI network calls) and automatically generates interactive Swagger API documentation (`/docs`), accelerating frontend integration.

**Downsides:** Smaller ecosystem of third-party plugins compared to Django; requires manual setup of database pooling and architectural patterns.

**Revisit If:** We need to pivot to a massive, monolithic application with heavy server-side rendering and built-in enterprise CMS interfaces.

---

## Decision: Database Choice: PostgreSQL
**Date:** 2026-05-26

**Decision:** We chose PostgreSQL (deployed via Neon Serverless) as our primary database engine.

**Alternatives Considered:**
- **MongoDB (NoSQL)** — Excellent for flexible document storage, but poor for enforcing strict relational integrity between meetings and their individual child action items.
- **SQLite** — Great for local development but entirely unsuitable for concurrent production deployments on ephemeral cloud containers (like Render).

**Why Chosen:** The application's data model is highly structured and relational (One Meeting has Many Action Items, Decisions, and Blockers). PostgreSQL enforces strict schema integrity, supports atomic transactions, and handles cascading deletions perfectly, ensuring no orphaned tasks are left behind when a meeting is deleted.

**Downsides:** Rigid schemas require strict migration tracking (Alembic) if the data shape needs to change in the future.

**Revisit If:** We introduce highly variable, unstructured analytics data or dynamic user-defined schemas that do not fit neatly into relational tables.

---

## Decision: AI Engine Choice: Google Gemini 2.5 Flash
**Date:** 2026-05-27

**Decision:** We integrated Google Gemini 2.5 Flash via the modern `google-genai` SDK for all transcript analysis.

**Alternatives Considered:**
- **OpenAI GPT-4o / GPT-3.5** — Highly capable, but API costs scale quickly and free-tier rate limits are often too restrictive for rapid testing.
- **Anthropic Claude 3 Haiku** — Comparable speed, but Gemini offers a massive context window and native JSON enforcement features that are highly optimized.

**Why Chosen:** Gemini 2.5 Flash offers the optimal balance of ultra-fast inference and cost efficiency. Crucially, it natively supports `response_mime_type="application/json"`, which forces the model to output reliable, structured data matching our Pydantic schemas without needing complex regex scraping.

**Downsides:** The model can occasionally hallucinate markdown backticks (````json ````) around the response, requiring custom fallback cleaners in the backend logic.

**Revisit If:** The structured JSON extraction quality degrades, or if a cost-effective, self-hosted open-source model (like Llama 3) becomes viable for our infrastructure budget.

---

## Decision: Architecture: Synchronous Processing for MVP
**Date:** 2026-05-28

**Decision:** The AI pipeline processes transcript extractions synchronously within the active HTTP request cycle.

**Alternatives Considered:**
- **Celery + Redis / Async Task Queues** — The enterprise standard, but requires provisioning and managing two extra cloud servers (a worker and a message broker), which is overkill for Week 2/3 of an MVP.
- **FastAPI BackgroundTasks** — Better than Celery for simple setups, but complicates the React frontend, which would need to implement WebSockets or polling to know when the background task finishes.

**Why Chosen:** It drastically simplifies deployment and state management. The user experiences a short wait (spinner) but receives their processed meeting data immediately in a single network round-trip.

**Downsides:** Long transcripts might cause the HTTP request to exceed gateway timeouts (Render's 60-second limit), resulting in a `504 Gateway Timeout`. It also temporarily blocks the API worker thread.

**Revisit If:** User traffic scales significantly causing thread starvation, or if we introduce audio-file transcription (which takes minutes and fundamentally requires a background queue).

---

## Decision: Prompt Engineering: Structured JSON Extraction
**Date:** 2026-05-29

**Decision:** We engineered a single, dense system prompt featuring a Persona, Strict Extraction Rules, and explicit Anti-Hallucination Guardrails mapping to a JSON schema.

**Alternatives Considered:**
- **Unstructured Summarization** — Having the AI return a block of text and trying to parse it with Regex. Highly brittle and prone to catastrophic failure.
- **Multi-Shot / Chained Prompting** — Sending one API request for the summary, a second for decisions, and a third for action items. Too slow and triples the API cost.

**Why Chosen:** A single-pass JSON extraction minimizes network latency and token costs. Explicit guardrails ("If the meeting has NO action items, return an empty list. Do NOT invent tasks.") drastically reduce the AI's tendency to hallucinate to please the user.

**Downsides:** A massive multi-task prompt dilutes the LLM's attention slightly; it may occasionally miss granular, buried details when forced to do five distinct classification tasks at once.

**Revisit If:** We notice the model consistently missing key action items in very long transcripts, requiring us to split the prompt into a Map-Reduce pipeline.

---

## Decision: Data Ingestion: Handling Long Transcripts
**Date:** 2026-06-1

**Decision:** We implemented strict perimeter boundary guards rejecting inputs under 50 words and over 10,000 words.

**Alternatives Considered:**
- **Chunked Processing** — Splitting a 50,000-word transcript into 5 pieces, processing them individually, and merging the JSONs. Too complex for the current MVP scope.
- **RAG (Retrieval-Augmented Generation)** — Useless for this use case, as RAG is for searching knowledge bases, not summarizing a single cohesive document.

**Why Chosen:** 10,000 words easily covers a 1-hour fast-paced meeting. This hard limit prevents malicious payload attacks, memory crashes on our free-tier Render container, and Gemini API quota exhaustion. 

**Downsides:** Users cannot submit massive, multi-hour conference transcripts or entire project books in a single request.

**Revisit If:** Enterprise users demand half-day workshop processing capabilities, necessitating the implementation of a chunked token-streaming architecture.

---

## Decision: Entity Resolution: Missing Owners and Deadlines
**Date:** 2026-06-2

**Decision:** We explicitly instructed the AI prompt to output "Not identified" for missing owners and "Not specified" for missing deadlines, rather than guessing.

**Alternatives Considered:**
- **Assume the Submitter is the Owner** — Highly inaccurate, as assistants often submit transcripts on behalf of executives.
- **Leave fields Null/Empty** — Can cause frontend mapping errors or make the UI look broken/unpopulated.

**Why Chosen:** Explicitly marking unknowns maintains absolute data integrity. It prevents the AI from confidently lying (hallucinating) and highlights blind spots to the team, prompting them to follow up ("Who is actually doing this task?").

**Downsides:** Can generate slightly repetitive UI tables if a disorganized meeting results in a list of 10 tasks that all say "Not identified".

**Revisit If:** We integrate the application with Active Directory or Google Workspace identity mapping, allowing the AI to intelligently cross-reference participant lists to deduce "we" or "I" statements.