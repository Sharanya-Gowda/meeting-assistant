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
    and handles JSON structural parsing.
    """
    prompt = f"""
    You are an expert meeting analyst. Your job is to extract
    structured information from meeting notes or transcripts.
    Analyze the following meeting content and extract:

    1. SHORT_SUMMARY: A concise summary in 3-5 sentences.
    2. DETAILED_SUMMARY: A detailed summary in 1-3 paragraphs.
    3. DECISIONS: A list of decisions that were made during the meeting. For each decision, include:
       - description: what was decided
       - decided_by: who made or announced the decision (use "Not identified" if unclear)
    4. ACTION_ITEMS: A list of tasks or action items. For each, include:
       - description: what needs to be done
       - owner: who is responsible (use "Not identified" if unclear)
       - deadline: when it is due (use "Not specified" if not mentioned)
       - priority: high, medium, or low (use "not specified" if not inferable)
    5. BLOCKERS: A list of blockers, risks, or open questions. For each, include:
       - description: what the issue is
       - type: "blocker", "risk", or "open_question"
       - raised_by: who raised it (use "Not identified" if unclear)
    6. FOLLOWUP_EMAIL: A professional follow-up email summarizing the meeting.

    IMPORTANT RULES:
    - Only extract information explicitly present in the input. Do NOT invent information.
    - If something is unclear, mark it as such.
    - If input is too short, say so in the summary and return empty lists.
    
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