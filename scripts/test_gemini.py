import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

# 1. Force load the backend environment variables relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(script_dir, "../backend/.env")
load_dotenv(dotenv_path=dotenv_path)

# 2. Extract and verify key injection
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("❌ ERROR: GEMINI_API_KEY not found in backend/.env file!")
    exit(1)

# 3. Initialize the modern GenAI Client explicitly passing the loaded key
client = genai.Client(api_key=api_key)

def process_meeting(text_input):
    # Construct prompt based strictly on Section 3.6 structural guidelines
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
    {text_input}
    """
    
    try:
        # Generate structured content using modern Client methods and strict low temperature
        response = client.models.generate_content(
            model="gemini-2.5-flash",  # Ensure this exact naming string is passed
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json" # Forces the model to respond with clean, valid JSON
            )
        )
        
        # Parse the structured text output
        parsed_json = json.loads(response.text)
        print("\n✅ SUCCESS: Successfully parsed JSON from Gemini!")
        print(json.dumps(parsed_json, indent=2))
        
    except Exception as e:
        print("\n❌ ERROR: Processing failed.")
        print("Exception details:", e)

# --- TEST CASE ---
sample_1_short = """
- Met with Sarah and John regarding the UI update.
- Decided to go with the dark theme.
- John will mock up the new buttons by Friday.
- Blocked on waiting for the final logo asset from marketing.
"""

print("Running Test 1 (Short Bullet Points)...")
process_meeting(sample_1_short)