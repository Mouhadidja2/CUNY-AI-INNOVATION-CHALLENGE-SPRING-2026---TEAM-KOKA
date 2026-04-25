from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .ai_service import get_compliance_coaching
import json

@csrf_exempt  # This allows the frontend (and curl) to talk to the API without CSRF issues
def analyze_proposal_api(request):
    if request.method == 'POST':
        try:
            # 1. Parse the incoming JSON data
            data = json.loads(request.body)
            description = data.get('description', '')
            amount = data.get('amount', 0)
            headcount = data.get('headcount', 1)

            # 2. Call your Gemini service logic
            feedback = get_compliance_coaching(description, amount, headcount)

            # 3. Return the AI's response as JSON
            return JsonResponse(feedback, safe=False)
            
        except Exception as e:
            # If something goes wrong (like a bad API key), send the error back
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Only POST requests are allowed.'}, status=405)
