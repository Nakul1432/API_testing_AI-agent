import os
import json
from pydantic import BaseModel, Field 
from typing import Optional, Dict, Any
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace, HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_core.runnables import RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()


HF_TOKEN = os.getenv("API_KEY")
REPO_ID = "meta-llama/Llama-3.1-8B-Instruct"


embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = Chroma(persist_directory="./api_docs_db", embedding_function=embeddings)
retriever = vector_db.as_retriever(search_kwargs={"k": 3})


http_llm = HuggingFaceEndpoint(
    repo_id=REPO_ID,
    huggingfacehub_api_token=HF_TOKEN,
    temperature=0.1,
)
llm = ChatHuggingFace(llm=http_llm)

#pydantic model
class APIResponseSchema(BaseModel):
    explanation: str = Field(description="A clear technical explanation of the endpoint's purpose.")
    python_code: str = Field(description="The full Python 'requests' code snippet for the user.")
    method: str = Field(description="The HTTP method (GET, POST, PUT, DELETE).")
    url: str = Field(description="The full, absolute URL for the API call based on documentation.")
    body: Optional[Dict[str, Any]] = Field(default=None, description="The JSON request body if required, otherwise null.")

parser = JsonOutputParser(pydantic_object=APIResponseSchema)

#template
prompt = ChatPromptTemplate([
    ("system", (
        "You are a professional API assistant. Use the provided documentation context to answer the user's question.\n"
        "STRICT JSON RULES:\n"
        "1. Your entire response must be a SINGLE JSON object.\n"
        "2. Provide fields 'explanation', 'python_code', 'method', 'url', and 'body' directly at the root.\n"
        "3. Use absolute URLs based on the context.\n"
        "4. If the info is missing, set 'explanation' to 'I don't know'.\n\n"
        "Format instructions: {format_instructions}\n\n"
        "Context: {context}"
    )),
    ("human", "{question}")
]).partial(format_instructions=parser.get_format_instructions())


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

extract_question = RunnableLambda(lambda x: x["question"])

#RAg
rag_chain = (
    {
        "context": extract_question | retriever | format_docs,
        "question": extract_question
    }
    | prompt
    | llm
    | StrOutputParser()
)

def answer_api_question(question_text, context=""):
    try:
       
        raw_response = rag_chain.invoke({"question": question_text})
        
        
        cleaned = raw_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned.split("```json")[1].split("```")[0].strip()
        elif cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1].split("```")[0].strip()
            
        return cleaned
        
    except Exception as e:
        error_resp = {
            "explanation": f"Connection Error: {str(e)}",
            "python_code": "",
            "method": "GET",
            "url": "",
            "body": None
        }
        return json.dumps(error_resp)

if __name__ == "__main__":
    test_query = "How do I create a new pet?"
    print(answer_api_question(test_query))