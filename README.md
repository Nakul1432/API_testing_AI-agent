# API_testing_AI-agent
🤖 AI-Powered API Documentation QnA Agent

Transforming Static Swagger Docs into Conversational Intelligence

🌟 Overview

Traditional API documentation is often dense and difficult to navigate. This project, developed for the Faculty of Engineering, Teerthanker Mahaveer University (TMU), introduces an intelligent agent that allows developers to interact with Swagger/OpenAPI documentation using natural language.

By leveraging Retrieval-Augmented Generation (RAG) and LangGraph, the agent doesn't just search for text—it understands the semantic intent behind developer queries.

🚀 Key Features

Conversational Q&A: Ask questions like "How do I register a new user?" and get precise technical answers.

Automated Code Generation: Instantly generates runnable code snippets in Python (Requests) and Java.

Semantic Search: Maps human concepts (e.g., "social wall") to technical endpoints (e.g., /posts) even if keywords don't match.

Interactive API Tester: A built-in dashboard to execute and verify API calls in real-time.

Dynamic Ingestion: Upload any Swagger JSON file to instantly re-train the agent's brain.

🛠️ Technical Stack

Category

Technology

Backend

Django (Python)

AI Orchestration

LangChain & LangGraph

LLM

Meta Llama-3.1-8B (via Hugging Face)

Vector Database

ChromaDB

Frontend

Tailwind CSS & JavaScript

⚙️ Installation & Setup

Clone the repository:

git clone [https://github.com/Nakul1432/API_testing_AI-agent.git](https://github.com/Nakul1432/API_testing_AI-agent.git)
cd API_testing_AI-agent


Create a Virtual Environment:

python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate


Install Dependencies:

pip install -r requirements.txt


Environment Variables:
Create a .env file in the root directory and add your Hugging Face API Token:

HF_TOKEN=your_huggingface_token_here


Run the Server:

python api_testing/manage.py runserver


📸 Dashboard Preview

The dashboard features a triple-panel interface:

AI Agent Chat: For natural language interaction.

Documentation Summary: Auto-parsed endpoint list.

Manual Tester: For live API execution and response verification.

📜 Acknowledgments

Special thanks to the Faculty of Engineering, TMU for providing the requirements and guidance for this "API Documentation QnA Agent" project.

Developed with ❤️ by Nakul Jain
