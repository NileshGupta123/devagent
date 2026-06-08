from typing import TypedDict, List, Optional
from pydantic import BaseModel


# ─────────────────────────────────────────
# Agent State — shared across all agents
# in the LangGraph pipeline
# ─────────────────────────────────────────

class AgentState(TypedDict):
    # Input
    repo_url: str
    repo_name: str
    code_files: dict           # { "filename": "code content" }

    # Agent Outputs
    analysis_result: Optional[str]
    improvement_result: Optional[str]
    test_result: Optional[str]
    evaluation_result: Optional[str]

    # Scoring
    scores: dict               # { "analyzer": 0, "improver": 0, "tester": 0, "evaluator": 0 }
    total_score: int

    # Memory / Feedback
    feedback: Optional[str]
    session_id: str
    iteration: int             # how many times pipeline has run


# ─────────────────────────────────────────
# API Request / Response Models
# ─────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    repo_url: str
    session_id: Optional[str] = None


class AgentScores(BaseModel):
    analyzer: int = 0
    improver: int = 0
    tester: int = 0
    evaluator: int = 0
    total: int = 0


class AnalyzeResponse(BaseModel):
    session_id: str
    repo_name: str
    analysis: str
    improvements: str
    tests: str
    evaluation: str
    scores: AgentScores
    feedback: str
    iteration: int