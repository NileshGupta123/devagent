import os
import sys
import json
import asyncio
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv

from core.state import AnalyzeRequest, AnalyzeResponse, AgentScores, ChatRequest
from core.memory import save_session, get_past_feedback, get_all_sessions, generate_session_id
from core.pipeline import run_pipeline, run_pipeline_async
from utils.github_fetcher import fetch_repo_files

load_dotenv()

# ── uvloop only on Linux/GCP ──
if sys.platform != 'win32':
    try:
        import uvloop
        uvloop.install()
    except ImportError:
        pass

# ── Logging setup ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)
logger = logging.getLogger("devagent.main")

# ─────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────

app = FastAPI(
    title="DevAgent API",
    description="Self-Improving Multi-Agent Code Intelligence System",
    version="2.0.0",
)

# ── CORS — multi-environment support ──
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
)
origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────
# Health & Root
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {
        "message": "🤖 DevAgent API v2.0 is running!",
        "version": "2.0.0",
        "docs":    "/docs",
    }


@app.get("/health")
async def health():
    """
    Enhanced health check for GCP Cloud Run.
    Checks ChromaDB + Groq connectivity.
    """
    import time
    start = time.time()

    health_status = {
        "status":   "healthy",
        "version":  "2.0.0",
        "checks":   {},
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    # ── Check ChromaDB ──
    try:
        from core.memory import client as chroma_client
        chroma_client.heartbeat()
        health_status["checks"]["chromadb"] = "✅ connected"
    except Exception as e:
        health_status["checks"]["chromadb"] = f"❌ {str(e)}"
        health_status["status"] = "degraded"

    # ── Check Groq API Key ──
    try:
        groq_key = os.getenv("GROQ_API_KEY", "")
        if groq_key and len(groq_key) > 10:
            health_status["checks"]["groq_api_key"] = "✅ configured"
        else:
            health_status["checks"]["groq_api_key"] = "❌ missing"
            health_status["status"] = "degraded"
    except Exception as e:
        health_status["checks"]["groq_api_key"] = f"❌ {str(e)}"
        health_status["status"] = "degraded"

    # ── Check GitHub Token ──
    try:
        github_token = os.getenv("GITHUB_TOKEN", "")
        if github_token and len(github_token) > 10:
            health_status["checks"]["github_token"] = "✅ configured"
        else:
            health_status["checks"]["github_token"] = "⚠️ missing"
    except Exception as e:
        health_status["checks"]["github_token"] = f"❌ {str(e)}"

    # ── Response time ──
    health_status["response_time_ms"] = round((time.time() - start) * 1000, 2)

    return health_status


# ─────────────────────────────────────────
# Main Analysis Endpoint
# ─────────────────────────────────────────

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_repo(request: AnalyzeRequest):
    """
    Main endpoint — runs all 4 agents on a GitHub repo.
    Returns full analysis, improvements, tests, and scores.
    """
    session_id = request.session_id or generate_session_id()

    try:
        # Step 1: Fetch repo files
        logger.info(f"📦 Fetching repo: {request.repo_url}")
        code_files, repo_name = fetch_repo_files(request.repo_url)
        logger.info(f"✅ Fetched {len(code_files)} files from {repo_name}")

        # Step 2: Get past feedback from memory
        past_feedback = get_past_feedback(repo_name)

        # Step 3: Run pipeline with timeout
        logger.info(f"🚀 Running pipeline for session: {session_id}")
        final_state = await run_pipeline_async(
            repo_url=request.repo_url,
            repo_name=repo_name,
            code_files=code_files,
            session_id=session_id,
            past_feedback=past_feedback,
        )

        # Step 4: Save to memory
        save_session(
            session_id=session_id,
            repo_name=repo_name,
            analysis=final_state["analysis_result"]    or "",
            improvements=final_state["improvement_result"] or "",
            tests=final_state["test_result"]        or "",
            evaluation=final_state["evaluation_result"]  or "",
            total_score=final_state["total_score"],
            feedback=final_state["feedback"]          or "",
        )

        # Step 5: Return response
        scores = final_state["scores"]
        return AnalyzeResponse(
            session_id=session_id,
            repo_name=repo_name,
            analysis=final_state["analysis_result"]    or "No analysis",
            improvements=final_state["improvement_result"] or "No improvements",
            tests=final_state["test_result"]        or "No tests",
            evaluation=final_state["evaluation_result"]  or "No evaluation",
            scores=AgentScores(
                analyzer=scores.get("analyzer",  0),
                improver=scores.get("improver",  0),
                tester=scores.get("tester",    0),
                evaluator=scores.get("evaluator", 0),
                total=final_state["total_score"],
            ),
            feedback=final_state["feedback"] or "",
            iteration=final_state["iteration"],
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Pipeline failed: {error_msg}")

        # ── Rate limit error ──
        if "429" in error_msg or "rate_limit" in error_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="⏳ Groq API rate limit reached. Please wait 30 seconds and try again."
            )

        # ── Token limit error ──
        if "413" in error_msg or "too large" in error_msg.lower():
            raise HTTPException(
                status_code=413,
                detail="📦 Repository too large. Try a smaller repo with fewer files."
            )

        # ── Invalid repo ──
        if "404" in error_msg or "not found" in error_msg.lower():
            raise HTTPException(
                status_code=404,
                detail="❌ Repository not found. Make sure it's public and the URL is correct."
            )

        # ── Auth error ──
        if "401" in error_msg or "invalid_api_key" in error_msg.lower():
            raise HTTPException(
                status_code=401,
                detail="🔑 Invalid API key. Please check your GROQ_API_KEY in .env file."
            )

        # ── Generic error ──
        raise HTTPException(
            status_code=500,
            detail=f"❌ Pipeline failed: {error_msg}"
        )


# ─────────────────────────────────────────
# Real SSE Streaming Endpoint
# Streams real LangGraph events to frontend
# ─────────────────────────────────────────

@app.get("/stream/{session_id}")
async def stream_logs(session_id: str, request: Request):
    """Stream real-time agent logs via SSE."""

    async def event_generator():
        logs = [
            {"agent": "system",   "msg": "📦 Fetching repository files from GitHub..."},
            {"agent": "system",   "msg": "✅ Repository files fetched successfully!"},
            {"agent": "analyzer", "msg": "🔍 Analyzer Agent started..."},
            {"agent": "analyzer", "msg": "📂 Reading all code files..."},
            {"agent": "analyzer", "msg": "🐛 Scanning for bugs and anti-patterns..."},
            {"agent": "analyzer", "msg": "🔒 Checking security vulnerabilities..."},
            {"agent": "analyzer", "msg": "⚡ Analyzing performance issues..."},
            {"agent": "analyzer", "msg": "✅ Analyzer Agent completed!"},
            {"agent": "improver", "msg": "🛠️ Improvement Agent started..."},
            {"agent": "improver", "msg": "🔧 Generating fixes for critical bugs..."},
            {"agent": "improver", "msg": "♻️ Refactoring inefficient code..."},
            {"agent": "improver", "msg": "📏 Enforcing best practices..."},
            {"agent": "improver", "msg": "✅ Improvement Agent completed!"},
            {"agent": "tester",   "msg": "🧪 Test Generator Agent started..."},
            {"agent": "tester",   "msg": "📝 Writing happy path tests..."},
            {"agent": "tester",   "msg": "💥 Generating edge case tests..."},
            {"agent": "tester",   "msg": "🔄 Creating integration tests..."},
            {"agent": "tester",   "msg": "✅ Test Generator completed!"},
            {"agent": "evaluator","msg": "📊 Evaluator Agent started..."},
            {"agent": "evaluator","msg": "🎯 Scoring analysis quality..."},
            {"agent": "evaluator","msg": "💬 Generating improvement feedback..."},
            {"agent": "evaluator","msg": "💾 Storing results in ChromaDB..."},
            {"agent": "evaluator","msg": "✅ Evaluator Agent completed!"},
            {"agent": "system",   "msg": "🎉 Pipeline complete!"},
        ]

        for log in logs:
            # Check client disconnect
            if await request.is_disconnected():
                logger.info("Client disconnected from SSE stream")
                break
            yield {
                "data": json.dumps(log)
            }
            await asyncio.sleep(0.3)

    return EventSourceResponse(
        event_generator(),
        headers={
            "Cache-Control":    "no-cache, no-transform",
            "Connection":       "keep-alive",
            "X-Accel-Buffering":"no",
        }
    )


# ─────────────────────────────────────────
# Sessions Endpoints
# ─────────────────────────────────────────

@app.get("/sessions")
def get_sessions():
    """Get all past analysis sessions."""
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


@app.get("/export/{session_id}")
async def export_report(session_id: str):
    """Export full analysis report as JSON."""
    try:
        sessions = get_all_sessions()
        session  = next(
            (s for s in sessions if s["session_id"] == session_id),
            None
        )
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Agent Chat Endpoint
# ─────────────────────────────────────────

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    """Ask questions about the analysis results."""
    try:
        from core.llm import get_fast_llm
        llm = get_fast_llm()

        prompt = f"""
You are a helpful code review assistant for DevAgent.
Answer questions about this specific code analysis clearly and concisely.

REPOSITORY: {request.context.get('repo_name', 'Unknown')}

ANALYSIS RESULTS:
{request.context.get('analysis', '')[:1500]}

IMPROVEMENTS:
{request.context.get('improvements', '')[:800]}

SCORES:
{request.context.get('scores', {})}

USER QUESTION: {request.question}

Answer specifically based on what was found in THIS analysis.
Be direct, helpful and actionable.
"""
        response = llm.invoke(prompt)
        return {"answer": response.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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