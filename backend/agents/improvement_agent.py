from core.llm import get_llm
from core.state import AgentState
from utils.github_fetcher import format_code_for_prompt

# ─────────────────────────────────────────
# Agent 2: Improvement Agent
# Suggests fixes, refactors code,
# and enforces best practices
# ─────────────────────────────────────────

IMPROVER_PROMPT = """
You are an expert Code Improvement Agent. Your job is to suggest concrete improvements.

BUGS & ISSUES FOUND BY ANALYZER:
{analysis}

CODEBASE:
{code}

Your improvements MUST include:
1. 🔧 BUG FIXES — Exact fix for each bug found with corrected code snippets
2. ♻️  REFACTORING — Cleaner, more readable code suggestions
3. ⚡ PERFORMANCE OPTIMIZATIONS — Faster, more efficient implementations
4. 🔒 SECURITY FIXES — Patches for any vulnerabilities found
5. 📏 BEST PRACTICES — PEP8, SOLID principles, clean code suggestions
6. 🎯 PRIORITY LIST — Top 5 most important changes to make first

For each fix provide:
- File name
- What was wrong
- Corrected code snippet
- Why this is better

Be specific and actionable.
"""


def run_improver(state: AgentState) -> AgentState:
    """
    Agent 2: Suggests improvements, refactors,
    and fixes based on analyzer output.
    Updates state with improvement_result and score.
    """

    print("🛠️  Improvement Agent running...")

    llm            = get_llm(temperature=0.3)
    code_files     = state["code_files"]
    analysis       = state.get("analysis_result", "No analysis available.")

    # Format code for prompt
    formatted_code = format_code_for_prompt(code_files)

    # Build prompt
    prompt = IMPROVER_PROMPT.format(
        analysis=analysis,
        code=formatted_code,
    )

    # Run LLM
    try:
        response     = llm.invoke(prompt)
        improvements = response.content

        # Score: +15 per fix suggested (max 60)
        fix_count = (
            improvements.lower().count("fix") +
            improvements.lower().count("refactor") +
            improvements.lower().count("optimize")
        )
        score = min(fix_count * 5, 60)

        print(f"✅ Improver done! Score: {score}")

    except Exception as e:
        improvements = f"❌ Improver failed: {str(e)}"
        score        = 0

    # Update state
    state["improvement_result"] = improvements
    state["scores"]["improver"] = score
    state["total_score"]       += score

    return state