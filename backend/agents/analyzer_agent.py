import logging
from core.llm import get_llm
from core.state import AgentState, AnalysisOutput, Issue
from utils.github_fetcher import format_code_for_prompt

logger = logging.getLogger("devagent.analyzer")

# ─────────────────────────────────────────
# Agent 1: Code Analyzer
# Uses Groq structured output to return
# typed Pydantic schema instead of raw text
# ─────────────────────────────────────────

ANALYZER_SYSTEM_PROMPT = """
You are an expert Code Analyzer Agent.
Analyze the given codebase and return a structured analysis.

You MUST classify every issue with exactly one of these severity levels:
- CRITICAL: Security vulnerabilities, crashes, data loss risks
- HIGH: Major bugs, broken functionality, serious anti-patterns
- MEDIUM: Code quality issues, minor bugs, performance problems
- LOW: Style issues, minor improvements, documentation gaps

Be specific with file names.
Find as many real issues as possible.
Calculate health_score from 1-10 (10 = perfect code).
"""

ANALYZER_USER_PROMPT = """
PAST FEEDBACK FROM MEMORY (learn from this):
{past_feedback}

CODEBASE TO ANALYZE:
{code}

Analyze this codebase thoroughly and return structured JSON output.
"""


def _format_analysis_output(structured: AnalysisOutput) -> str:
    """
    Convert structured Pydantic output to
    readable text for frontend display.
    """
    lines = []

    if structured.bugs:
        lines.append("## 🐛 BUGS")
        for issue in structured.bugs:
            lines.append(f"[{issue.severity}] {issue.file} - {issue.description}")

    if structured.anti_patterns:
        lines.append("\n## ⚠️ ANTI-PATTERNS")
        for issue in structured.anti_patterns:
            lines.append(f"[{issue.severity}] {issue.file} - {issue.description}")

    if structured.security_issues:
        lines.append("\n## 🔒 SECURITY ISSUES")
        for issue in structured.security_issues:
            lines.append(f"[{issue.severity}] {issue.file} - {issue.description}")

    if structured.performance_issues:
        lines.append("\n## ⚡ PERFORMANCE ISSUES")
        for issue in structured.performance_issues:
            lines.append(f"[{issue.severity}] {issue.file} - {issue.description}")

    lines.append(f"\n## 📋 SUMMARY")
    lines.append(f"- Total Issues: {structured.total_issues}")

    # Count severities
    all_issues = (
        structured.bugs +
        structured.anti_patterns +
        structured.security_issues +
        structured.performance_issues
    )
    critical = sum(1 for i in all_issues if i.severity == "CRITICAL")
    high     = sum(1 for i in all_issues if i.severity == "HIGH")
    medium   = sum(1 for i in all_issues if i.severity == "MEDIUM")
    low      = sum(1 for i in all_issues if i.severity == "LOW")

    lines.append(f"- Critical: {critical} | High: {high} | Medium: {medium} | Low: {low}")
    lines.append(f"- Overall Health: {structured.health_score}/10")
    lines.append(f"- Summary: {structured.summary}")

    return "\n".join(lines)


def _calculate_score(structured: AnalysisOutput) -> int:
    """
    Calculate analyzer score based on
    severity of issues found.
    """
    all_issues = (
        structured.bugs +
        structured.anti_patterns +
        structured.security_issues +
        structured.performance_issues
    )

    critical = sum(1 for i in all_issues if i.severity == "CRITICAL")
    high     = sum(1 for i in all_issues if i.severity == "HIGH")
    medium   = sum(1 for i in all_issues if i.severity == "MEDIUM")
    low      = sum(1 for i in all_issues if i.severity == "LOW")

    score = min(
        (critical * 10) + (high * 7) + (medium * 4) + (low * 2),
        50
    )
    return score


def run_analyzer(state: AgentState) -> AgentState:
    """
    Agent 1: Analyzes codebase using
    Groq structured output with Pydantic schema.
    Falls back to text mode if structured fails.
    """
    logger.info("🔍 Analyzer Agent running...")

    try:
        llm          = get_llm(temperature=0.1)
        code_files   = state["code_files"]
        past_feedback = state.get("feedback", "No past feedback yet.")

        # Format and limit code
        formatted_code = format_code_for_prompt(code_files)
        formatted_code = formatted_code[:3000]

        # ── Try structured output first ──
        try:
            structured_llm = llm.with_structured_output(AnalysisOutput)

            structured: AnalysisOutput = structured_llm.invoke([
                {"role": "system", "content": ANALYZER_SYSTEM_PROMPT},
                {"role": "user",   "content": ANALYZER_USER_PROMPT.format(
                    past_feedback=past_feedback,
                    code=formatted_code,
                )},
            ])

            # Convert to display text
            analysis = _format_analysis_output(structured)
            score    = _calculate_score(structured)

            # Store structured data
            state["structured_analysis"] = structured.model_dump()

            logger.info(f"✅ Analyzer done (structured)! Score: {score}")

        except Exception as struct_err:
            # ── Fallback to plain text ──
            logger.warning(f"⚠️ Structured output failed, using text mode: {struct_err}")

            plain_prompt = f"""
{ANALYZER_SYSTEM_PROMPT}

PAST FEEDBACK: {past_feedback}

CODEBASE:
{formatted_code}

Format each issue as: [SEVERITY] filename - description
Use sections: BUGS, ANTI-PATTERNS, SECURITY ISSUES, PERFORMANCE ISSUES, SUMMARY
"""
            response = llm.invoke(plain_prompt)
            analysis = response.content

            # Score from text
            critical = analysis.upper().count("[CRITICAL]")
            high     = analysis.upper().count("[HIGH]")
            medium   = analysis.upper().count("[MEDIUM]")
            low      = analysis.upper().count("[LOW]")
            score    = min((critical*10)+(high*7)+(medium*4)+(low*2), 50)

            state["structured_analysis"] = None
            logger.info(f"✅ Analyzer done (text fallback)! Score: {score}")

    except Exception as e:
        logger.error(f"❌ Analyzer failed: {e}")
        analysis = f"❌ Analyzer failed: {str(e)}"
        score    = 0
        state["errors"] = state.get("errors", []) + [f"Analyzer: {str(e)}"]

    # ── Update state ──
    state["analysis_result"]      = analysis
    state["scores"]["analyzer"]   = score
    state["total_score"]         += score

    return state