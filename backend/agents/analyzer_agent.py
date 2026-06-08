from core.llm import get_llm
from core.state import AgentState
from utils.github_fetcher import format_code_for_prompt

ANALYZER_PROMPT = """
You are an expert Code Analyzer Agent. Analyze the given codebase.

PAST FEEDBACK FROM MEMORY (learn from this):
{past_feedback}

CODEBASE TO ANALYZE:
{code}

Your analysis MUST follow this EXACT format:

## 🐛 BUGS
[CRITICAL] filename.py - Description of critical bug
[HIGH] filename.py - Description of high severity bug
[MEDIUM] filename.py - Description of medium severity issue
[LOW] filename.py - Description of low severity issue

## ⚠️ ANTI-PATTERNS
[HIGH] filename.py - Description of anti-pattern
[MEDIUM] filename.py - Description of anti-pattern

## 🔒 SECURITY ISSUES
[CRITICAL] filename.py - Description of security vulnerability
[HIGH] filename.py - Description of security issue

## ⚡ PERFORMANCE ISSUES
[HIGH] filename.py - Description of performance issue
[MEDIUM] filename.py - Description of performance issue

## 📋 SUMMARY
- Total Issues: X
- Critical: X | High: X | Medium: X | Low: X
- Overall Health: X/10
- Top Priority Fix: description

Use ONLY these severity levels: CRITICAL, HIGH, MEDIUM, LOW
Be specific with file names. Be thorough but concise.
"""


def run_analyzer(state: AgentState) -> AgentState:
    print("🔍 Analyzer Agent running...")

    try:
        llm           = get_llm(temperature=0.2)
        code_files    = state["code_files"]
        past_feedback = state.get("feedback", "No past feedback yet.")

        formatted_code = format_code_for_prompt(code_files)
        formatted_code = formatted_code[:3000]

        prompt = ANALYZER_PROMPT.format(
            past_feedback=past_feedback,
            code=formatted_code,
        )

        response = llm.invoke(prompt)
        analysis = response.content

        # Score based on severity
        critical = analysis.upper().count("[CRITICAL]")
        high     = analysis.upper().count("[HIGH]")
        medium   = analysis.upper().count("[MEDIUM]")
        low      = analysis.upper().count("[LOW]")

        # More issues found = better analyzer performance
        score = min((critical * 10) + (high * 7) + (medium * 4) + (low * 2), 50)

        print(f"✅ Analyzer done! Found C:{critical} H:{high} M:{medium} L:{low} Score:{score}")

    except Exception as e:
        analysis = f"❌ Analyzer failed: {str(e)}"
        score    = 0
        print(f"❌ Analyzer error: {e}")

    state["analysis_result"]    = analysis
    state["scores"]["analyzer"] = score
    state["total_score"]       += score

    return state