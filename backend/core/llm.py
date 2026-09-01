import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

# ─────────────────────────────────────────
# Groq LLM Setup
# Updated models — Sept 2026
# ─────────────────────────────────────────

def get_llm(temperature: float = 0.3):
    """
    Returns a Groq LLM instance.
    Used by all 4 agents.
    """
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError("❌ GROQ_API_KEY not found in .env file!")

    llm = ChatGroq(
        api_key=api_key,
        model="openai/gpt-oss-120b",  # replaces llama-3.3-70b-versatile
        temperature=temperature,
        max_tokens=2048,
    )

    return llm


def get_fast_llm():
    """
    Faster smaller model for quick tasks
    like scoring and evaluation.
    """
    api_key = os.getenv("GROQ_API_KEY")

    llm = ChatGroq(
        api_key=api_key,
        model="openai/gpt-oss-20b",  # replaces llama-3.1-8b-instant
        temperature=0.1,
        max_tokens=1024,
    )

    return llm