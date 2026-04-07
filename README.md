AI-Powered API Documentation QnA Agent

Transforming Static Specifications into Conversational Intelligence

Overview

This project is about building an AI agent that helps with API documentation. It was made for the Faculty of Engineering at Teerthanker Mahaveer University, or TMU for short. Developers often struggle with those thick Swagger files, they are machine friendly but not so much for people reading them. The agent kind of steps in like a technical architect, not just pulling text but figuring out the API logic to give useful answers.

How the Model Works

The way it works involves this recursive synthesis thing, which sounds fancy but basically means it builds up the understanding step by step. First, it takes in Swagger JSON files or even PDF manuals. When you upload the JSON, it breaks everything down into parts like paths, methods, and schemas. Then the Llama-3.1-8B model comes in, acting like a writer to turn that raw stuff into plain English summaries for each chunk.

Those summaries get put together into a new PDF, what they call the Master API Manual. It is more readable than the original tech spec. After that, it indexes this PDF in ChromaDB using sentence transformers. So instead of searching messy JSON, it looks through the business logic summaries, which helps a lot with queries that are not super precise.

Query Processing 

For user questions, there is a query refiner that turns casual stuff like how to add a user into something technical, like details on the POST users endpoint. And it always spits out code snippets in Python, Java, or JavaScript. I think that is pretty handy for developers switching languages.

Clone the repository:

.git clone [https://github.com/Nakul1432/API_testing_AI-agent.git](https://github.com/Nakul1432/API_testing_AI-agent.git)
.cd API_testing_AI-agent

Create a Virtual Environment:
.python -m venv venv

# Windows   venv\Scripts\activate

# Mac/Linux  source venv/bin/activate

Install Dependencies:
pip install -r requirements.txt

Environment Variables:
Create a .env file in the root directory and add your Hugging Face API Token:
HF_TOKEN=your_huggingface_token_here

Run the Server:
python api_testing/manage.py runserver




 Key Advantages

.Intent Mapping (Semantic Search): Maps human concepts to technical paths. If a user asks for a "Social Wall," the agent understands the semantic intent matches the /posts endpoint.
.Developer Productivity: Reduces "Time-to-First-Call" by generating runnable boilerplate code across three major languages instantly.
.Self-Documenting: Automatically generates a downloadable, readable Developer Reference PDF from any raw JSON file.
.Interactive Verification: Unlike static docs, the agent can actually test the endpoint in real-time through the built-in Tester Panel to verify server status.

Technical Stack

.Backend: Django Python
.AI Orchestration: LangChain ,LangGraph
.LLM: Meta Llama-3.1-8B-Instruct 
.Vector DB: ChromaDB
.PDF Generation: ReportLab & PyPDF2
.Frontend: Tailwind CSS & JavaScript


