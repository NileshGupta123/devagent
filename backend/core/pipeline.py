import sys
import asyncio
import logging
from langgraph.graph import StateGraph, END
from core.state import AgentState
from agents.analyzer_agent import run_analyzer
from agents.improvement_agent import run_improver
from agents.test_agent import run_tester
from agents.evaluator_agent import run_evaluator

# ── uvloop only on Linux/GCP, skip on Windows ──
if sys.platform != 'win32':
    try:
        import uvloop
        uvloop.install()
    except ImportError:
        pass

logger = logging.getLogger("devagent.pipeline")

# ─────────────────────────────────────────
# LangGraph Pipeline
# 4 agents in sequence with safety guards
# ─────────────────────────────────────────

def build_pipeline():
    """
    Builds and returns the LangGraph
    multi-agent pipeline with recursion safety.
    """
    graph = StateGraph(AgentState)

    # ── Add all 4 agent nodes ──
    graph.add_node("analyzer",  run_analyzer)
    graph.add_node("improver",  run_improver)
    graph.add_node("tester",    run_tester)
    graph.add_node("evaluator", run_evaluator)

    # ── Define the flow ──
    graph.set_entry_point("analyzer")
    graph.add_edge("analyzer",  "improver")
    graph.add_edge("improver",  "tester")
    graph.add_edge("tester",    "evaluator")
    graph.add_edge("evaluator", END)

    # ── Compile with recursion limit ──
    pipeline = graph.compile()

    return pipeline


def run_pipeline(
    repo_url:      str,
    repo_name:     str,
    code_files:    dict,
    session_id:    str,
    past_feedback: str = "",
) -> AgentState:
    """
    Run the full multi-agent pipeline.
    Includes recursion limit + timeout safety.
    Returns the final state with all results.
    """

    pipeline = build_pipeline()

    # ── Initial state ──
    initial_state: AgentState = {
        "repo_url":               repo_url,
        "repo_name":              repo_name,
        "code_files":             code_files,
        "analysis_result":        None,
        "improvement_result":     None,
        "test_result":            None,
        "evaluation_result":      None,
        "structured_analysis":    None,
        "structured_improvements":None,
        "scores": {
            "analyzer":  0,
            "improver":  0,
            "tester":    0,
            "evaluator": 0,
        },
        "total_score":    0,
        "feedback":       past_feedback,
        "session_id":     session_id,
        "iteration":      1,
        "recursion_count":0,
        "errors":         [],
    }

    # ── Run config with strict recursion limit ──
    config = {
        "recursion_limit": 25,
        "configurable": {
            "thread_id": session_id,
        }
    }

    try:
        # Run with 120 second timeout
        final_state = pipeline.invoke(
            initial_state,
            config=config,
        )
        return final_state

    except Exception as e:
        error_msg = str(e)

        # Check for recursion error
        if "recursion" in error_msg.lower():
            logger.error(f"❌ Pipeline recursion limit hit: {error_msg}")
            initial_state["errors"].append(
                "Max recursion depth exceeded. Pipeline safely stopped."
            )
        else:
            logger.error(f"❌ Pipeline failed: {error_msg}")
            initial_state["errors"].append(
                f"Pipeline execution failed: {error_msg}"
            )

        # Return degraded state instead of crashing
        initial_state["analysis_result"]    = initial_state["analysis_result"]    or "❌ Analysis failed"
        initial_state["improvement_result"] = initial_state["improvement_result"] or "❌ Improvements failed"
        initial_state["test_result"]        = initial_state["test_result"]        or "❌ Tests failed"
        initial_state["evaluation_result"]  = initial_state["evaluation_result"]  or "❌ Evaluation failed"
        initial_state["feedback"]           = "Pipeline encountered an error. Please try again."

        return initial_state


async def run_pipeline_async(
    repo_url:      str,
    repo_name:     str,
    code_files:    dict,
    session_id:    str,
    past_feedback: str = "",
) -> AgentState:
    """
    Async version with hard 120 second timeout.
    Used by SSE streaming endpoint.
    """
    try:
        return await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(
                None,
                lambda: run_pipeline(
                    repo_url,
                    repo_name,
                    code_files,
                    session_id,
                    past_feedback,
                )
            ),
            timeout=120.0
        )
    except asyncio.TimeoutError:
        logger.error("❌ Pipeline timed out after 120 seconds")
        return {
            "repo_url":           repo_url,
            "repo_name":          repo_name,
            "code_files":         code_files,
            "analysis_result":    "❌ Analysis timed out",
            "improvement_result": "❌ Improvements timed out",
            "test_result":        "❌ Tests timed out",
            "evaluation_result":  "❌ Evaluation timed out",
            "structured_analysis":    None,
            "structured_improvements":None,
            "scores":      {"analyzer": 0, "improver": 0, "tester": 0, "evaluator": 0},
            "total_score": 0,
            "feedback":    "Pipeline timed out after 120 seconds.",
            "session_id":  session_id,
            "iteration":   1,
            "recursion_count": 0,
            "errors":      ["Timeout after 120 seconds"],
        }