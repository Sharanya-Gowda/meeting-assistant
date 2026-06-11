# AI Pipeline & Prompt Engineering Design

## 1. Model Selection
**Google Gemini 2.5 Flash** was chosen as the core reasoning engine. It provides a massive context window (ideal for 10,000-word transcripts), executes highly accurate JSON formatting, and processes text up to 3x faster than comparable enterprise models.

## 2. The Prompt Architecture
The system prompt acts as a "Senior Executive Assistant". It is divided into three critical sections:

### A. Persona & Role Assignment
Establishes the LLM's boundary constraints, forcing it to act strictly as an analytical parser rather than a conversational chatbot.

### B. Strict Extraction Rules
* **Short & Detailed Summaries:** Enforces sentence and paragraph constraints.
* **Decisions:** Instructs the model to ignore "proposed" ideas and only fetch "final" verdicts.
* **Action Items:** Requires an actionable verb, an owner (or "Not identified" if vague), a deadline, and priority inference based on context keywords.
* **Blockers:** Classifies roadblocks as "blocker", "risk", or "open_question".

### C. Anti-Hallucination Guardrails
To prevent the model from inventing data to please the user, the prompt explicitly states:
> *"If the meeting has NO action items, return an empty list `[]`. Do NOT invent tasks. Base your extraction ONLY on the provided text. Do not use outside knowledge."*

## 3. Pre-Processing & Security Heuristics
Before calling the expensive LLM API, the backend runs local validations:
1. **Word Count Constraints:** Rejects payloads under 50 words or over 10,000 words.
2. **Substance Checks:** Scans for keywords (`discuss`, `action`, `decide`, `team`). If the text is purely small talk or filler (e.g., "Hello, testing microphone"), the backend blocks it with a `400 Bad Request` without querying Gemini.

## 4. Fallback Mechanisms
* **Markdown Stripping:** If the LLM wraps the response in markdown backticks (````json ````), a custom parser regex cleanly strips them before running `json.loads()`.
* **Retry Loops:** Network timeouts and rate limits trigger an automatic sleep-and-retry sequence (up to 3 times) before officially returning a `502 Bad Gateway`.