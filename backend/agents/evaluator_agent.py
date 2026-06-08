from core.llm import get_fast_llm
from core.state import AgentState

# ─────────────────────────────────────────
# Agent 4: Evaluator Agent
# Evaluates quality of all agent outputs
# Generates final score and feedback
# ─────────────────────────────────────────

EVALUATOR_PROMPT = """
You are an expert Code Quality Evaluator Agent. Your job is to evaluate the work done by other agents.

ORIGINAL ANALYSIS:
{analysis}

SUGGESTED IMPROVEMENTS:
{improvements}

GENERATED TESTS:
{tests}

Evaluate the overall quality and provide:

1. 📊 ANALYSIS QUALITY (0-25 points)
   - Were bugs identified correctly?
   - Was the analysis thorough?
   - Score: X/25

2. 🔧 IMPROVEMENT QUALITY (0-25 points)
   - Are the fixes correct and actionable?
   - Are code snippets provided?
   - Score: X/25

3. 🧪 TEST QUALITY (0-25 points)
   - Are tests comprehensive?
   - Do they cover edge cases?
   - Score: X/25

4. 🎯 OVERALL CODE HEALTH (0-25 points)
   - General assessment of the codebase
   - Production readiness
   - Score: X/25

5. 💬 FEEDBACK FOR AGENTS (very important)
   - What should agents do better next time?
   - What patterns should be remembered?
   - Specific improvements for each agent

6. ✅ FINAL VERDICT
   - EXCELLENT (90-100) / GOOD (70-89) / NEEDS WORK (50-69) / POOR (below 50)
   - One paragraph summary

Be strict but fair. Give exact scores.
"""


def parse_evaluator_score(evaluation: str) -> int:
    """
    Parse the evaluator's text to extract
    total score out of 100.
    """
    import re

    # Look for patterns like "Score: 20/25"
    scores = re.findall(r"(\d+)/25", evaluation)

    if scores:
        total = sum(int(s) for s in scores[:4])  # max 4 sections × 25
        return min(total, 100)

    # Fallback: look for percentage
    percent = re.findall(r"(\d+)%", evaluation)
    if percent:
        return min(int(percent[0]), 100)

    return 50  # default score


def run_evaluator(state: AgentState) -> AgentState:
    """
    Agent 4: Evaluates all agent outputs,
    generates final score and feedback
    for the self-improvement loop.
    Updates state with evaluation_result and score.
    """

    print("📊 Evaluator Agent running...")

    llm          = get_fast_llm()
    analysis     = state.get("analysis_result",    "No analysis.")
    improvements = state.get("improvement_result", "No improvements.")
    tests        = state.get("test_result",        "No tests.")

    # Build prompt
    prompt = EVALUATOR_PROMPT.format(
        analysis=analysis[:2000],
        improvements=improvements[:2000],
        tests=tests[:2000],
    )

    # Run LLM
    try:
        response   = llm.invoke(prompt)
        evaluation = response.content

        # Parse score from evaluation text
        eval_score = parse_evaluator_score(evaluation)
        score      = min(eval_score, 100)

        print(f"✅ Evaluator done! Final Score: {score}/100")

    except Exception as e:
        evaluation = f"❌ Evaluator failed: {str(e)}"
        score      = 0

    # Extract feedback for self-improvement loop
    feedback = ""
    if "FEEDBACK FOR AGENTS" in evaluation:
        parts    = evaluation.split("FEEDBACK FOR AGENTS")
        feedback = parts[1][:500] if len(parts) > 1 else ""

    # Update state
    state["evaluation_result"]    = evaluation
    state["scores"]["evaluator"]  = score
    state["total_score"]          = sum(state["scores"].values())
    state["feedback"]             = feedback

    return state