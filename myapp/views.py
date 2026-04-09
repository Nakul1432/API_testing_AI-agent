import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


from .ai_agent.agent_graph import app as agent_app
from .ai_agent.tools import execute_api_call
from django.shortcuts import render , redirect
from django.contrib.auth.decorators import login_required

@login_required
def dashboard(request):
    # This view only opens if the user is logged in via Google (or local)
    return render(request, 'dashboard.html', {
        'user': request.user
    })

def login_page(request):
    # If already logged in, send them to the dashboard
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'login.html')





def dashboard_view(request):
    return render(request, 'dashboard.html')

@csrf_exempt
def upload_swagger(request):
    if request.method == "POST" and request.FILES.get('file'):
        file = request.FILES['file']
        try:
            data = json.loads(file.read().decode('utf-8'))
            info = data.get('info', {})
            paths = data.get('paths', {})
            formatted_paths = []
            for path, methods in paths.items():
                if isinstance(methods, dict):
                    for method in methods.keys():
                        formatted_paths.append({"method": method.upper(), "path": path})
            
            return JsonResponse({
                "status": "success",
                "title": info.get('title', 'Unknown API'),
                "description": info.get('description', 'No description.'),
                "endpoints": formatted_paths
            })
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})
    return JsonResponse({"status": "error", "message": "No file uploaded."})

@csrf_exempt
def chat_agent(request):
    """
    Fixed to parse stringified JSON from agent and filter based on user intent.
    """
    if request.method == "POST":
        try:
            body_data = json.loads(request.body)
            query = body_data.get("query", "").lower()
            final_state = agent_app.invoke({"question": query})
            raw_answer = final_state.get("answer")
            parsed_answer = {}

            if isinstance(raw_answer, str):
                try:
                    
                    cleaned_answer = raw_answer.replace("```json", "").replace("```", "").strip()
                    parsed_answer = json.loads(cleaned_answer)
                except:
                    parsed_answer = {"explanation": raw_answer}
            elif isinstance(raw_answer, dict):
                parsed_answer = raw_answer
            
            
            show_explanation = True
            show_code = True

            
            if any(word in query for word in ["code", "script", "python", "snippet"]):
                show_explanation = False
            
            
            elif any(word in query for word in ["explain", "how", "what", "describe", "summary"]):
                show_code = False

            
            response_data = {
                "status": "success",
                "explanation": parsed_answer.get("explanation") if show_explanation else None,
                "code": parsed_answer.get("python_code") if show_code else None,
                "api_result": final_state.get("api_response", {}) # Using the key from your debug log
            }

            return JsonResponse(response_data)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})

@csrf_exempt
def manual_test(request):
    if request.method == "POST":
        data = json.loads(request.body)
        method = data.get("method")
        url = data.get("url")
        body = data.get("body")
        result = execute_api_call(method, url, body)
        return JsonResponse(result)