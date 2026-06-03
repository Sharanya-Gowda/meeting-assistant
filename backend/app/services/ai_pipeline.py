import os
import json
from google import genai
from google.genai import types
from fastapi import HTTPException

# Initialize the modern GenAI Client cleanly
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not configured in the environment variables.")

client = genai.Client(api_key=api_key)

def process_meeting_text(text: str) -> dict:
    """
    Constructs the structured prompt template, invokes the Gemini API, 
    and handles JSON structural parsing with advanced guardrails.
    """
    prompt = f"""
    You are an expert executive assistant and senior meeting analyst. Your task is to extract highly accurate, structured information from the provided meeting transcript.

    STRICT EXTRACTION RULES:
    1. SHORT_SUMMARY: 3-5 sentences capturing the main objective and final outcome.
    2. DETAILED_SUMMARY: 1-3 paragraphs providing context, technical details, and discussion points.
    3. DECISIONS: Only include FINAL, agreed-upon decisions. Do NOT include proposed options that were rejected.
       - description: Be specific about what was decided.
       - decided_by: The person who made the final call. Use "Group" if collaborative, or "Not identified" if unclear.
    4. ACTION_ITEMS: Concrete tasks that must be executed after the meeting.
       - description: What needs to be done (start with an action verb if possible).
       - owner: Only extract explicit owners. If someone casually says "we should...", assign to "Not identified". Do NOT guess or hallucinate owners.
       - deadline: Extract exact or relative dates (e.g., "Next Friday"). If none mentioned, use "Not specified".
       - priority: Infer based on keywords ("critical", "urgent", "blocker" = high). Default to "medium" if unsure.
    5. BLOCKERS: Obstacles preventing progress.
       - description: Clear explanation of the roadblock.
       - type: Classify exactly as "blocker" (stopping work), "risk" (potential future blocker), or "open_question".
       - raised_by: Who brought it up.
    6. FOLLOWUP_EMAIL: A professional, ready-to-send email summarizing the meeting, addressing the team, and listing key decisions and action items cleanly.

    CRITICAL ANTI-HALLUCINATION GUARDRAILS:
    - If the meeting has NO action items (e.g., it is purely informational), return an empty list `[]` for action_items. Do NOT invent tasks.
    - If the meeting is just a discussion with NO decisions, return an empty list `[]` for decisions.
    - Base your extraction ONLY on the provided text. Do not use outside knowledge.

    Return your response as valid JSON matching this exact schema:
    {{
      "short_summary": "string",
      "detailed_summary": "string",
      "decisions": [ {{"description": "string", "decided_by": "string"}} ],
      "action_items": [ {{"description": "string", "owner": "string", "deadline": "string", "priority": "string"}} ],
      "blockers": [ {{"description": "string", "type": "string", "raised_by": "string"}} ],
      "followup_email": "string"
    }}

    MEETING CONTENT:
    {text}
    """

    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",  # Highly fast, cost-efficient for text JSON extractions
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json"
            )
        )
        
        # Safely parse the verified text output back as a native Python dictionary
        return json.loads(response.text)
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"AI Pipeline Execution Core Failure: {str(e)}"
        )