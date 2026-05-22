# AI Pipeline Design & Model Exploration

## 1. Selected Model Configuration
* **Model Used:** `gemini-2.5-flash` via the official `google-genai` SDK.
* **Cost Structure:** Google AI Studio free tier (no operational costs).
* **Configuration Parameters:**
  * `temperature`: `0.1` (Low creativity to ensure deterministic, highly accurate data extraction).
  * `response_mime_type`: `application/json` (Enforced structural response at the API routing level).

## 2. How the Prompt Works
The system uses structured zero-shot prompting with explicit data type schemas. It forces the LLM to behave like a data-extraction parser by:
* Mapping clear descriptive instructions for summaries, decisions, action items, and blocker categories.
* Instantiating explicit fallback rules to protect against AI hallucinations (e.g., instructing the model to return `"Not identified"` if an owner or deadline is missing).
* Ingesting raw unformatted strings inside a bounded `{meeting_text}` block.

## 3. Core Prototype Output Shape
Initial validation testing successfully returned a perfectly parsed JSON matrix matching the expected schema constraints:
* Short and detailed summaries parsed into clear strings.
* Hierarchical tables like `action_items` and `blockers` correctly translated as clean arrays of objects.

## 4. Observations & Operational Adjustments
* **What works well:** The model flawlessly adheres to the required key-value shapes and handles unformatted bullet points without dropping operational context.
* **What to adjust:** For ultra-short meeting dumps, a validation checkpoint must be written into the FastAPI ingestion service to assert a word count limit before hitting the API.