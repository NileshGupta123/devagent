from core.llm import get_llm
from core.state import AgentState
from utils.github_fetcher import format_code_for_prompt

# ─────────────────────────────────────────
# Agent 3: Test Generator Agent
# Generates unit tests and edge cases
# for the codebase
# ─────────────────────────────────────────

TEST_PROMPT = """
You are an expert Test Generator Agent. Your job is to write comprehensive unit tests.

CODEBASE:
{code}

IMPROVEMENTS SUGGESTED:
{improvements}

Generate complete, runnable unit tests that cover:
1. ✅ HAPPY PATH TESTS — Normal expected behavior
2. ❌ EDGE CASE TESTS — Boundary values, empty inputs, null values
3. 💥 ERROR HANDLING TESTS — Exception handling, invalid inputs
4. 🔄 INTEGRATION TESTS — How functions work together
5. 📊 COVERAGE REPORT — Which functions are covered

Rules:
- Use pytest for Python code
- Use Jest for JavaScript/TypeScript code
- Write REAL runnable test code, not pseudocode
- Include test file name at the top
- Add comments explaining what each test checks
- Each test function must have a clear descriptive name

Example format:
# test_filename.py
import pytest
from module import function

def test_function_happy_path():
    # Tests normal expected behavior
    assert function(input) == expected_output

def test_function_empty_input():
    # Tests edge case with empty input
    with pytest.raises(ValueError):
        function("")
"""


def run_tester(state: AgentState) -> AgentState:
    """
    Agent 3: Generates unit tests and edge cases
    based on the codebase and improvements.
    Updates state with test_result and score.
    """

    print("🧪 Test Generator Agent running...")

    llm          = get_llm(temperature=0.2)
    code_files   = state["code_files"]
    improvements = state.get("improvement_result", "No improvements available.")

    # Format code for prompt
    formatted_code = format_code_for_prompt(code_files)

    # Build prompt
    prompt = TEST_PROMPT.format(
        code=formatted_code,
        improvements=improvements[:2000],  # limit to save tokens
    )

    # Run LLM
    try:
        response = llm.invoke(prompt)
        tests    = response.content

        # Score: +20 per test case generated (max 80)
        test_count = (
            tests.lower().count("def test_") +
            tests.lower().count("it(") +
            tests.lower().count("test(")
        )
        score = min(test_count * 10, 80)

        print(f"✅ Tester done! Score: {score}")

    except Exception as e:
        tests = f"❌ Test Generator failed: {str(e)}"
        score = 0

    # Update state
    state["test_result"]       = tests
    state["scores"]["tester"]  = score
    state["total_score"]      += score

    return state