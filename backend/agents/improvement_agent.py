import logging
from core.llm import get_llm
from core.state import AgentState
from utils.github_fetcher import format_code_for_prompt

logger = logging.getLogger("devagent.improver")

# ─────────────────────────────────────────
# Agent 2: Improvement Agent
# Simplified schema to avoid JSON parse
# failures with large code snippets
# ─────────────────────────────────────────

IMPROVER_PROMPT = """
You are an expert Code Improvement Agent.
Review the analysis and generate actionable fixes.

ANALYSIS RESULTS:
{analysis}

CODEBASE:
{code}

Your improvements MUST include:
1. 🔧 BUG FIXES — Exact fix for each bug with corrected code snippets
2. ♻️  REFACTORING — Cleaner, more readable code suggestions
3. ⚡ PERFORMANCE OPTIMIZATIONS — Faster implementations
4. 🔒 SECURITY FIXES — Patches for vulnerabilities
5. 📏 BEST PRACTICES — Clean code suggestions
6. 🎯 PRIORITY LIST — Top 5 most important changes

For each fix provide:
- File name
- What was wrong
- Corrected code snippet
- Why this is better

Format each section clearly with the headers above.
Be specific and actionable.
"""


def _calculate_score(improvements: str) -> int:
    """Calculate score from improvement text."""
    fix_count = (
        improvements.lower().count("fix") +
        improvements.lower().count("refactor") +
        improvements.lower().count("optimize") +
        improvements.lower().count("security")
    )
    return min(fix_count * 4, 60)


def run_improver(state: AgentState) -> AgentState:
    """
    Agent 2: Generates improvements.
    Uses plain text mode for reliability
    with large code snippets.
    Falls back gracefully on any error.
    """
    logger.info("🛠️ Improvement Agent running...")

    try:
        llm      = get_llm(temperature=0.2)
        analysis = state.get("analysis_result", "No analysis available.")

        # Format and limit code
        code_files     = state["code_files"]
        formatted_code = format_code_for_prompt(code_files)
        formatted_code = formatted_code[:2000]

        # Build prompt
        prompt = IMPROVER_PROMPT.format(
            analysis=analysis[:1500],
            code=formatted_code,
        )

        # Run LLM
        response     = llm.invoke(prompt)
        improvements = response.content
        score        = _calculate_score(improvements)

        # Store None for structured (plain text mode)
        state["structured_improvements"] = None

        logger.info(f"✅ Improver done! Score: {score}")

    except Exception as e:
        logger.error(f"❌ Improver failed: {e}")
        improvements = f"❌ Improver failed: {str(e)}"
        score        = 0
        state["errors"] = state.get("errors", []) + [f"Improver: {str(e)}"]

    # ── Update state ──
    state["improvement_result"] = improvements
    state["scores"]["improver"] = score
    state["total_score"]       += score

    return state