from typing import List, Optional, Dict, Any, Literal, TypedDict
from pydantic import BaseModel, Field


# ─────────────────────────────────────────
# Structured Output Schemas
# Used by Groq with_structured_output()
# ─────────────────────────────────────────

class Issue(BaseModel):
    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    file: str
    description: str


class AnalysisOutput(BaseModel):
    bugs: List[Issue]                  = Field(default_factory=list)
    anti_patterns: List[Issue]         = Field(default_factory=list)
    security_issues: List[Issue]       = Field(default_factory=list)
    performance_issues: List[Issue]    = Field(default_factory=list)
    summary: str                       = ""
    total_issues: int                  = 0
    health_score: int                  = 5


class Fix(BaseModel):
    file: str
    what_was_wrong: str
    corrected_code: str
    why_better: str


class ImprovementOutput(BaseModel):
    bug_fixes: List[Fix]               = Field(default_factory=list)
    refactoring: List[Fix]             = Field(default_factory=list)
    security_fixes: List[Fix]          = Field(default_factory=list)
    priority_list: List[str]           = Field(default_factory=list)


# ─────────────────────────────────────────
# LangGraph Shared Agent State
# Passed between all 4 agents
# ─────────────────────────────────────────

class AgentState(TypedDict):
    # Input
    repo_url:   str
    repo_name:  str
    code_files: dict

    # Raw text outputs (for display)
    analysis_result:    Optional[str]
    improvement_result: Optional[str]
    test_result:        Optional[str]
    evaluation_result:  Optional[str]

    # Structured outputs (for data layer)
    structured_analysis:     Optional[dict]
    structured_improvements: Optional[dict]

    # Scoring
    scores: dict
    total_score: int

    # Memory / Feedback
    feedback:   Optional[str]
    session_id: str
    iteration:  int

    # Safety tracking
    recursion_count: int
    errors:          List[str]


# ─────────────────────────────────────────
# API Request / Response Models
# ─────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    repo_url:   str
    session_id: Optional[str] = None


class AgentScores(BaseModel):
    analyzer:  int = 0
    improver:  int = 0
    tester:    int = 0
    evaluator: int = 0
    total:     int = 0


class AnalyzeResponse(BaseModel):
    session_id:   str
    repo_name:    str
    analysis:     str
    improvements: str
    tests:        str
    evaluation:   str
    scores:       AgentScores
    feedback:     str
    iteration:    int


class ChatRequest(BaseModel):
    question: str
    context:  dict