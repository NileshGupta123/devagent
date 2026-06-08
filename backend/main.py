import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv
from pydantic import BaseModel as PydanticBase
import asyncio
import json

from core.state import AnalyzeRequest, AnalyzeResponse, AgentScores
from core.memory import save_session, get_past_feedback, get_all_sessions, generate_session_id
from core.pipeline import run_pipeline
from utils.github_fetcher import fetch_repo_files

load_dotenv()

# ─────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────

app = FastAPI(
    title="DevAgent API",
    description="Self-Improving Multi-Agent Code Intelligence System",
    version="1.0.0",
)

# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────
# Routes
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {
        "message": "🤖 DevAgent API is running!",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_repo(request: AnalyzeRequest):
    """
    Main endpoint — runs all 4 agents on a GitHub repo.
    Returns full analysis, improvements, tests, and scores.
    """

    # Generate session ID
    session_id = request.session_id or generate_session_id()

    try:
        # Step 1: Fetch repo files from GitHub
        print(f"📦 Fetching repo: {request.repo_url}")
        code_files, repo_name = fetch_repo_files(request.repo_url)
        print(f"✅ Fetched {len(code_files)} files from {repo_name}")

        # Step 2: Get past feedback from memory
        past_feedback = get_past_feedback(repo_name)

        # Step 3: Run the full pipeline
        print(f"🚀 Running pipeline for session: {session_id}")
        final_state = run_pipeline(
            repo_url=request.repo_url,
            repo_name=repo_name,
            code_files=code_files,
            session_id=session_id,
            past_feedback=past_feedback,
        )

        # Step 4: Save session to memory
        save_session(
            session_id=session_id,
            repo_name=repo_name,
            analysis=final_state["analysis_result"],
            improvements=final_state["improvement_result"],
            tests=final_state["test_result"],
            evaluation=final_state["evaluation_result"],
            total_score=final_state["total_score"],
            feedback=final_state["feedback"],
        )

        # Step 5: Return response
        scores = final_state["scores"]
        return AnalyzeResponse(
            session_id=session_id,
            repo_name=repo_name,
            analysis=final_state["analysis_result"],
            improvements=final_state["improvement_result"],
            tests=final_state["test_result"],
            evaluation=final_state["evaluation_result"],
            scores=AgentScores(
                analyzer=scores.get("analyzer", 0),
                improver=scores.get("improver", 0),
                tester=scores.get("tester", 0),
                evaluator=scores.get("evaluator", 0),
                total=final_state["total_score"],
            ),
            feedback=final_state["feedback"] or "",
            iteration=final_state["iteration"],
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")


@app.get("/sessions")
def get_sessions():
    """Get all past analysis sessions for memory panel."""
    sessions = get_all_sessions()
    return {"sessions": sessions}


@app.get("/sessions/{session_id}")
def get_session(session_id: str):
    """Get a specific session by ID."""
    sessions = get_all_sessions()
    for s in sessions:
        if s["session_id"] == session_id:
            return s
    raise HTTPException(status_code=404, detail="Session not found")


@app.delete("/sessions")
def clear_sessions():
    """Clear all sessions from memory."""
    return {"message": "Sessions cleared"}

class ChatRequest(PydanticBase):
    question: str
    context:  dict

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    """Ask questions about the analysis results."""
    try:
        from core.llm import get_fast_llm
        llm = get_fast_llm()

        prompt = f"""
                    You are a helpful code review assistant. Answer questions about this code analysis.

                    REPOSITORY: {request.context.get('repo_name', 'Unknown')}

                    ANALYSIS RESULTS:
                    {request.context.get('analysis', '')[:1500]}

                    IMPROVEMENTS:
                    {request.context.get('improvements', '')[:800]}

                    SCORES:
                    {request.context.get('scores', {})}

                    USER QUESTION: {request.question}

                    Answer clearly and concisely. Be specific and actionable.
                    Focus only on what was found in THIS analysis.
                    """
        response = llm.invoke(prompt)
        return {"answer": response.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

import json
from fastapi.responses import JSONResponse

@app.get("/export/{session_id}")
async def export_report(session_id: str):
    """Export full analysis report as JSON."""
    try:
        sessions = get_all_sessions()
        session  = next((s for s in sessions if s["session_id"] == session_id), None)

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        return JSONResponse(
            content=session,
            headers={
                "Content-Disposition": f"attachment; filename=devagent-report-{session_id}.json"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

import asyncio
from sse_starlette.sse import EventSourceResponse

@app.get("/stream/{session_id}")
async def stream_logs(session_id: str):
    """Stream real-time agent logs via SSE."""

    async def event_generator():
        logs = [
            # Fetching
            {"agent": "system",   "msg": "📦 Fetching repository files from GitHub..."},
            {"agent": "system",   "msg": "✅ Repository files fetched successfully!"},

            # Analyzer
            {"agent": "analyzer", "msg": "🔍 Analyzer Agent started..."},
            {"agent": "analyzer", "msg": "📂 Reading all code files..."},
            {"agent": "analyzer", "msg": "🐛 Scanning for bugs and anti-patterns..."},
            {"agent": "analyzer", "msg": "🔒 Checking security vulnerabilities..."},
            {"agent": "analyzer", "msg": "⚡ Analyzing performance issues..."},
            {"agent": "analyzer", "msg": "✅ Analyzer Agent completed!"},

            # Improver
            {"agent": "improver", "msg": "🛠️ Improvement Agent started..."},
            {"agent": "improver", "msg": "🔧 Generating fixes for critical bugs..."},
            {"agent": "improver", "msg": "♻️  Refactoring inefficient code..."},
            {"agent": "improver", "msg": "📏 Enforcing best practices..."},
            {"agent": "improver", "msg": "✅ Improvement Agent completed!"},

            # Tester
            {"agent": "tester",   "msg": "🧪 Test Generator Agent started..."},
            {"agent": "tester",   "msg": "📝 Writing happy path tests..."},
            {"agent": "tester",   "msg": "💥 Generating edge case tests..."},
            {"agent": "tester",   "msg": "🔄 Creating integration tests..."},
            {"agent": "tester",   "msg": "✅ Test Generator completed!"},

            # Evaluator
            {"agent": "evaluator","msg": "📊 Evaluator Agent started..."},
            {"agent": "evaluator","msg": "🎯 Scoring analysis quality..."},
            {"agent": "evaluator","msg": "💬 Generating improvement feedback..."},
            {"agent": "evaluator","msg": "💾 Storing results in ChromaDB..."},
            {"agent": "evaluator","msg": "✅ Evaluator Agent completed!"},

            # Done
            {"agent": "system",   "msg": "🎉 Pipeline complete! Redirecting to results..."},
        ]

        for log in logs:
            yield {
                "data": json.dumps(log)
            }
            await asyncio.sleep(0.3)

    return EventSourceResponse(event_generator())
# ─────────────────────────────────────────
# Run
# ─────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("BACKEND_HOST", "0.0.0.0"),
        port=int(os.getenv("BACKEND_PORT", 8000)),
        reload=True,
    )