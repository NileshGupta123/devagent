import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
import chromadb
from chromadb.config import Settings

load_dotenv()

# ─────────────────────────────────────────
# ChromaDB Memory
# Stores past analysis sessions so agents
# can learn from previous mistakes
# ─────────────────────────────────────────

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

# Initialize ChromaDB client
client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)

# Create collections
analysis_collection = client.get_or_create_collection(
    name="analysis_memory",
    metadata={"hnsw:space": "cosine"}
)

feedback_collection = client.get_or_create_collection(
    name="feedback_memory",
    metadata={"hnsw:space": "cosine"}
)


def save_session(
    session_id: str,
    repo_name: str,
    analysis: str,
    improvements: str,
    tests: str,
    evaluation: str,
    total_score: int,
    feedback: str,
):
    """Save a completed analysis session to memory."""
    doc = f"""
    Repo: {repo_name}
    Analysis: {analysis[:500]}
    Improvements: {improvements[:500]}
    Tests: {tests[:500]}
    Evaluation: {evaluation[:500]}
    Score: {total_score}
    Feedback: {feedback}
    """

    analysis_collection.upsert(
        documents=[doc],
        metadatas=[{
            "session_id": session_id,
            "repo_name": repo_name,
            "total_score": total_score,
            "timestamp": datetime.now().isoformat(),
        }],
        ids=[session_id]
    )


def get_past_feedback(repo_name: str, n_results: int = 3) -> str:
    """
    Retrieve past feedback for similar repos.
    Used by agents to self-improve.
    """
    try:
        results = analysis_collection.query(
            query_texts=[repo_name],
            n_results=n_results,
        )

        if not results["documents"][0]:
            return "No past feedback found."

        feedback_list = []
        for i, doc in enumerate(results["documents"][0]):
            score = results["metadatas"][0][i].get("total_score", 0)
            feedback_list.append(f"Past Session (Score: {score}):\n{doc[:300]}")

        return "\n\n".join(feedback_list)

    except Exception:
        return "No past feedback found."


def get_all_sessions() -> list:
    """Get all past sessions for the memory panel in frontend."""
    try:
        results = analysis_collection.get()
        sessions = []

        for i, doc_id in enumerate(results["ids"]):
            meta = results["metadatas"][i]
            sessions.append({
                "session_id": doc_id,
                "repo_name": meta.get("repo_name", "Unknown"),
                "total_score": meta.get("total_score", 0),
                "timestamp": meta.get("timestamp", ""),
            })

        return sorted(sessions, key=lambda x: x["timestamp"], reverse=True)

    except Exception:
        return []


def generate_session_id() -> str:
    """Generate a unique session ID."""
    return str(uuid.uuid4())[:8]