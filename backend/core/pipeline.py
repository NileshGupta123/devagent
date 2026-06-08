from langgraph.graph import StateGraph, END
from core.state import AgentState
from agents.analyzer_agent import run_analyzer
from agents.improvement_agent import run_improver
from agents.test_agent import run_tester
from agents.evaluator_agent import run_evaluator

# ─────────────────────────────────────────
# LangGraph Pipeline
# Orchestrates all 4 agents in sequence
# with a feedback loop
# ─────────────────────────────────────────

def build_pipeline():
    """
    Builds and returns the LangGraph
    multi-agent pipeline.

    Flow:
    analyzer → improver → tester → evaluator → END
    """

    # Initialize the graph with our shared state
    graph = StateGraph(AgentState)

    # ── Add all 4 agent nodes ──
    graph.add_node("analyzer",  run_analyzer)
    graph.add_node("improver",  run_improver)
    graph.add_node("tester",    run_tester)
    graph.add_node("evaluator", run_evaluator)

    # ── Define the flow ──
    graph.set_entry_point("analyzer")
    graph.add_edge("analyzer", "improver")
    graph.add_edge("improver", "tester")
    graph.add_edge("tester",   "evaluator")
    graph.add_edge("evaluator", END)

    # Compile the graph
    pipeline = graph.compile()

    return pipeline


def run_pipeline(repo_url: str, repo_name: str, code_files: dict, session_id: str, past_feedback: str = "") -> AgentState:
    """
    Run the full multi-agent pipeline.
    Returns the final state with all results.
    """

    pipeline = build_pipeline()

    # Initial state
    initial_state: AgentState = {
        "repo_url":           repo_url,
        "repo_name":          repo_name,
        "code_files":         code_files,
        "analysis_result":    None,
        "improvement_result": None,
        "test_result":        None,
        "evaluation_result":  None,
        "scores": {
            "analyzer":  0,
            "improver":  0,
            "tester":    0,
            "evaluator": 0,
        },
        "total_score":  0,
        "feedback":     past_feedback,
        "session_id":   session_id,
        "iteration":    1,
    }

    # Run the pipeline
    final_state = pipeline.invoke(initial_state)

    return final_state