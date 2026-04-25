from google import genai
from google.genai import types # Import types for explicit config
import os
import json

def get_compliance_coaching(description, amount, headcount):
    # Force the client to use the stable v1 API
    client = genai.Client(
        api_key=os.getenv("GEMINI_API_KEY"),
        http_options={'api_version': 'v1'}
    )
    
    # Use the most generic model name possible
    model_id = 'gemini-1.5-flash' 
    
    prompt = f"""
    Act as the York College SGA Budget Auditor. 
    Analyze: {description}, Total: ${amount}, Students: {headcount}
    Rules: Food <$20/person. Professional language.
    Return JSON ONLY:
    {{
      "score": int,
      "is_compliant": bool,
      "feedback": "string",
      "better_description": "string"
    }}
    """
    
    try:
        response = client.models.generate_content(
            model=model_id,
            contents=prompt
        )
        
        # New SDK sometimes puts the text in a nested candidate
        response_text = response.text
        clean_json = response_text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)
        
    except Exception as e:
        # Final fallback: If even v1 fails, return a calculated response 
        # so the demo doesn't break.
        per_person = amount / headcount
        compliant = per_person <= 20
        return {
            "score": 90 if compliant else 45,
            "is_compliant": compliant,
            "feedback": f"System in fallback mode. Cost: ${per_person:.2f}/person. Limit: $20.",
            "better_description": f"Academic networking event featuring {description}."
        }