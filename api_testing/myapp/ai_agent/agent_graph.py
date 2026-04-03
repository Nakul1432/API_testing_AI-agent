import json
from typing import Any, Dict, TypedDict, Optional
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END


from .search import answer_api_question 
from .tools import execute_api_call

#pydantic model
class AgentResponse(BaseModel):
    """
    This schema defines the structure of the AI's response.
    By using Optional[Dict], we prevent crashes during GET requests.
    """
    explanation: str = Field(
        description="A natural language explanation of what the API call does."
    )
    python_code: str = Field(
        description="A complete, runnable Python code snippet using the requests library."
    )
    method: str = Field(
        description="The HTTP method required (e.g., GET, POST, PUT, DELETE)."
    )
    url: str = Field(
        description="The full URL for the API endpoint."
    )
    
    body: Optional[Dict[str, Any]] = Field(
        default=None, 
        description="The JSON request body. Set to None for GET or DELETE requests."
    )


def get_agent_data(json_input: str) -> AgentResponse:
    
    cleaned = json_input.replace("```json", "").replace("```", "").strip()
    data = json.loads(cleaned)
   
    if isinstance(data, str): 
        data = json.loads(data)
    return AgentResponse(**data)


class AgentState(TypedDict):
    question: str
    context: str        
    answer: str         
    api_response: Dict[str, Any]
    

    explanation: Optional[str]
    python_code: Optional[str]
    method: Optional[str]
    url: Optional[str]
    body: Optional[Dict[str, Any]]

#reading docs
def search_node(state: AgentState):
    answer = answer_api_question(state["question"], state.get("context", ""))
    return {"answer": answer}


#testing api 
def execute_node(state: AgentState):
    answer = state["answer"]
    try:
        api = get_agent_data(answer)
        response = execute_api_call(
            method=api.method,
            url=api.url,
            body=api.body   
        )
        return {"api_response": response}
    except Exception as e:
        return {"api_response": {"status": "error", "message": f"Execution failed: {str(e)}"}}

#graph
workflow = StateGraph(AgentState)


workflow.add_node("search", search_node)
workflow.add_node("execute", execute_node)


workflow.set_entry_point("search")
workflow.add_edge("search", "execute")
workflow.add_edge("execute", END)


app = workflow.compile()


if __name__ == "__main__":
    # Test query
    inputs = {
        "question": "How do I create a new pet by its id?",
        "context": "{}"
    }
    
    print(f"Starting Agent Workflow")
    for output in app.stream(inputs):
        for key, value in output.items():
            print(f"Node: {key}")
            print(value)