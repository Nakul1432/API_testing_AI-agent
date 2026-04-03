from langchain_huggingface import HuggingFaceEmbeddings , HuggingFaceEndpoint
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
import json
import os
from dotenv import load_dotenv

load_dotenv() 

#model 


HF_TOKEN = os.getenv("API_KEY") 


repo_id="meta-llama/Llama-3.1-8B-Instruct"

embeddings = HuggingFaceEmbeddings(model_name = "all-MiniLM-L6-v2")

llm = HuggingFaceEndpoint(repo_id=repo_id, task="text-generation",
                           huggingfacehub_api_token = HF_TOKEN ,
                           temperature=0.1,)  

def ingest_api_json(json_data):
    docs =[]
    paths = json_data.get("paths", {})

    for path, methods in paths.items():
        for method, details in methods.items():
           content = (
               f"Action: {method.upper()} {path}\n"
                f"Description : {details.get('Summary', 'No Summary')}\n"
                f"Requirements : {json.dumps(details.get('parameters', []))}\n"
           )

           docs.append(Document(page_content=content, metadata={"path": path,}))
    
    vector_db = Chroma.from_documents(documents=docs, 
                                     embedding = embeddings, 
                                     persist_directory="./api_docs_db"
                                     )
    return "Ingestion Complete!"


with open("swagger.json" , "r") as f:
    api_json = json.load(f)

result = ingest_api_json(api_json)
print(result)