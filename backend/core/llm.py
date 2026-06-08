import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

# ─────────────────────────────────────────
# Groq LLM Setup
# Fast & Free — using llama-3.3-70b model
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
        model="llama-3.3-70b-versatile",  # best free model on Groq
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
        model="llama-3.1-8b-instant",  # fast model for scoring
        temperature=0.1,
        max_tokens=1024,
    )

    return llm