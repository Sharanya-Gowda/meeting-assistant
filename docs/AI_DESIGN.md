# AI Prompt Design & Iteration Log

## Iteration 1: Baseline MVP (Day 7)
* **Goal:** Establish a baseline connection to Gemini 2.5 Flash and force a strict JSON output structure.
* **Prompt Strategy:** Basic Zero-Shot prompting with a JSON schema definition.
* **Findings:** * *Strengths:* Successfully returned valid JSON 100% of the time. Summaries were generally good.
  * *Weaknesses:* Prone to mild hallucinations. If a meeting had no action items, the model would sometimes invent one (e.g., "Schedule next meeting"). It also struggled to differentiate between a proposed idea and a final decision.

## Iteration 2: Advanced Guardrails & Persona (Day 13)
* **Goal:** Eliminate hallucinations, improve extraction accuracy for edge cases, and better attribute owners to tasks.
* **Prompt Strategy:** * Assigned an "Expert Executive Assistant" persona.
  * Added **Strict Extraction Rules** defining exactly what constitutes a "Decision" versus a "Discussion".
  * Added **Critical Anti-Hallucination Guardrails** explicitly instructing the model to return empty arrays `[]` rather than inventing data for edge-case meetings (e.g., purely informational town halls).
* **Findings:** * Action item extraction is now much stricter.
  * The model accurately ignores messy filler words in the transcript.
  * Edge case tests (no action items, conflicting decisions) now map perfectly to the database without generating false positives.