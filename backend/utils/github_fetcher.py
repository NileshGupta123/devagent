import os
import re
from github import Github
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────
# GitHub Fetcher
# Fetches code files from any public repo
# using the GitHub REST API
# ─────────────────────────────────────────

SUPPORTED_EXTENSIONS = [
    ".py", ".js", ".ts", ".jsx", ".tsx",
    ".java", ".cpp", ".c", ".go", ".rs",
    ".rb", ".php", ".swift", ".kt", ".cs"
]

MAX_FILE_SIZE = 50000   # 50KB per file max
MAX_FILES     = 8    # max files to analyze


def parse_repo_url(repo_url: str) -> tuple:
    """
    Extract owner and repo name from GitHub URL.
    e.g. https://github.com/owner/repo → ("owner", "repo")
    """
    repo_url = repo_url.strip().rstrip("/")

    # Handle different URL formats
    patterns = [
        r"github\.com/([^/]+)/([^/]+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, repo_url)
        if match:
            owner = match.group(1)
            repo  = match.group(2).replace(".git", "")
            return owner, repo

    raise ValueError(f"❌ Invalid GitHub URL: {repo_url}")


def fetch_repo_files(repo_url: str) -> tuple[dict, str]:
    """
    Fetch all supported code files from a GitHub repo.
    Returns:
        - code_files: dict { "filename": "code content" }
        - repo_name:  str
    """
    token = os.getenv("GITHUB_TOKEN")
    g     = Github(token) if token else Github()

    owner, repo_name = parse_repo_url(repo_url)

    try:
        repo = g.get_repo(f"{owner}/{repo_name}")
    except Exception as e:
        raise ValueError(f"❌ Could not access repo: {e}")

    code_files = {}
    _fetch_directory(repo, "", code_files)

    if not code_files:
        raise ValueError("❌ No supported code files found in this repo!")

    return code_files, repo_name


def _fetch_directory(repo, path: str, code_files: dict, depth: int = 0):
    """Recursively fetch files from repo directory."""

    # Limit depth and file count
    if depth > 3:
        return
    if len(code_files) >= MAX_FILES:
        return

    try:
        contents = repo.get_contents(path)
    except Exception:
        return

    for item in contents:
        if len(code_files) >= MAX_FILES:
            break

        # Skip common non-essential folders
        skip_dirs = [
            "node_modules", ".git", "__pycache__",
            "venv", ".venv", "dist", "build",
            ".next", "coverage", ".pytest_cache"
        ]

        if item.type == "dir":
            if item.name not in skip_dirs:
                _fetch_directory(repo, item.path, code_files, depth + 1)

        elif item.type == "file":
            # Check extension
            ext = "." + item.name.split(".")[-1] if "." in item.name else ""
            if ext not in SUPPORTED_EXTENSIONS:
                continue

            # Check file size
            if item.size > MAX_FILE_SIZE:
                continue

            try:
                content = item.decoded_content.decode("utf-8", errors="ignore")
                code_files[item.path] = content
            except Exception:
                continue


def format_code_for_prompt(code_files: dict) -> str:
    """
    Format code files into a single string
    for passing to LLM agents.
    """
    formatted = ""
    for filename, content in code_files.items():
        formatted += f"\n\n{'='*50}\n"
        formatted += f"FILE: {filename}\n"
        formatted += f"{'='*50}\n"
        formatted += content[:1000]  # limit per file for token management

    return formatted