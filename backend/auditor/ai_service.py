import google.generativeai as genai
import os
import json

# Load from your .env
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def get_compliance_coaching(description, amount, headcount):
    # flash is faster and cheaper for hackathons
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    Act as the York College SGA Budget Auditor. 
    Analyze the following student club request:
    - Item: {description}
    - Total: ${amount}
    - Students attending: {headcount}

    Rules: 
    1. Food must be under $12/person for snacks or $20/person for meals.
    2. No funding for personal items or 'vague' descriptions.
    3. Language must be professional and academic.

    Provide feedback in JSON format only:
    {{
      "score": int (0-100),
      "is_compliant": bool,
      "feedback": "string explaining why",
      "better_description": "a more professional version of their text"
    }}
    """
    
    response = model.generate_content(prompt)
    
    # Helper to clean the string in case Gemini adds markdown ```json blocks
    clean_json = response.text.replace('```json', '').replace('```', '').strip()
    return json.loads(clean_json)