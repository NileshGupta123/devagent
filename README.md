# 🤖 DevAgent — Self-Improving Multi-Agent Code Intelligence System

![DevAgent](https://img.shields.io/badge/DevAgent-v1.0.0-6366f1?style=for-the-badge)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2.56-8b5cf6?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-06b6d4?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-10b981?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?style=for-the-badge)

> A self-improving multi-agent system where 4 specialized AI agents
> collaborate to analyze, improve, test, and evaluate any GitHub codebase —
> then learn from results using ChromaDB vector memory.

---

## 🚀 Live Demo
👉 **[devagent.onrender.com](https://devagent-frontend.onrender.com
)** ← coming soon

---

## 🎯 What Makes DevAgent Unique

| Feature | Description |
|---|---|
| 🤖 **4 Specialized Agents** | Analyzer → Improver → Tester → Evaluator in LangGraph pipeline |
| 🔴 **Severity System** | Every issue tagged CRITICAL / HIGH / MEDIUM / LOW |
| 🧠 **Self-Improving Memory** | ChromaDB stores feedback, agents learn from past runs |
| 📊 **Live Dashboard** | Charts, trends, radar graph of agent performance |
| 💬 **Ask the Agent** | Chat with AI about any finding in the analysis |
| 📄 **Export Reports** | Download full JSON report or copy to clipboard |
| ⚡ **Real-time Logs** | Watch agents work live with streaming logs |
| 🐳 **Docker Ready** | One command deployment |

---

## 🧠 How It Works

```
GitHub Repo URL
      ↓
🔍 Analyzer Agent    → Finds bugs, anti-patterns, security issues (CRITICAL/HIGH/MEDIUM/LOW)
      ↓
🛠️  Improver Agent   → Suggests fixes, refactors, code snippets
      ↓
🧪 Test Agent        → Generates pytest/Jest unit tests + edge cases
      ↓
📊 Evaluator Agent   → Scores output, generates feedback
      ↓
🧠 ChromaDB Memory   → Stores feedback for self-improvement loop
      ↓
💬 Agent Chat        → Ask questions about the analysis
```

---

## 🖥️ Pages

| Page | Route | Description |
|---|---|---|
| 🏠 Home | `/` | Landing page with features & pipeline |
| 📊 Dashboard | `/dashboard` | Org overview, charts, recent activity |
| 🔍 Analyze | `/analyze` | Repo input + live agent progress |
| 📈 Results | `/results` | Full analysis with severity badges |
| 🧠 Memory | `/memory` | ChromaDB session history |
| ℹ️ About | `/about` | Architecture + tech stack |

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| LLM | Groq API (llama-3.3-70b-versatile) |
| Agents | LangGraph + LangChain |
| Backend | FastAPI + Python 3.11 |
| Memory | ChromaDB (Vector DB + RAG) |
| Frontend | React 19 + Vite + Tailwind CSS v3 |
| Charts | Recharts + React Flow |
| Deploy | Docker + docker-compose + Render |

---

## 🏃 Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/NileshGupta123/devagent.git
cd devagent
```

### 2. Set up environment
```bash
copy .env.example .env
# Fill in GROQ_API_KEY and GITHUB_TOKEN
```

### 3. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 4. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Open in browser
```
http://localhost:5173   → Frontend
http://localhost:8000   → Backend API
http://localhost:8000/docs → Swagger UI
```

---

## 🐳 Run with Docker

```bash
# Copy and fill env file
copy .env.example .env

# Build and run
docker-compose up --build

# Open
http://localhost:80
```

---

## 🤖 Agent Details

### Agent 1 — Code Analyzer 🔍
- Reads entire codebase across multiple files
- Tags every issue with CRITICAL / HIGH / MEDIUM / LOW
- Detects bugs, security vulnerabilities, anti-patterns
- Uses past ChromaDB feedback to improve

### Agent 2 — Improvement Agent 🛠️
- Generates concrete bug fix code snippets
- Refactors messy code to follow best practices
- Enforces SOLID principles and clean code
- Prioritizes fixes by severity

### Agent 3 — Test Generator 🧪
- Generates complete pytest / Jest test files
- Covers happy path + edge cases + error handling
- Writes descriptive test function names
- Improves code coverage automatically

### Agent 4 — Evaluator Agent 📊
- Scores each agent output (0-100)
- Generates actionable improvement feedback
- Stores results in ChromaDB for self-improvement
- Powers the feedback loop

---

## 📊 Scoring System

| Agent | Max Score | Criteria |
|---|---|---|
| Analyzer | 50 | Bugs & severity detected |
| Improver | 60 | Fixes & refactors suggested |
| Tester | 80 | Test cases generated |
| Evaluator | 100 | Overall quality score |
| **Total** | **290** | **Combined score** |

### Verdicts
- 🏆 **EXCELLENT** → 200-290 pts
- ✅ **GOOD** → 150-199 pts
- ⚠️ **NEEDS WORK** → 100-149 pts
- ❌ **POOR** → 0-99 pts

---

## 🌍 Deploy to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. New → Web Service → connect repo
4. Set environment variables:
   - `GROQ_API_KEY`
   - `GITHUB_TOKEN`
5. Deploy! 🚀

---

## 📁 Project Structure

```
devagent/
├── backend/
│   ├── main.py                    # FastAPI + all endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── agents/
│   │   ├── analyzer_agent.py      # Bug detection + severity
│   │   ├── improvement_agent.py   # Code fixes
│   │   ├── test_agent.py          # Test generation
│   │   └── evaluator_agent.py     # Scoring + feedback
│   ├── core/
│   │   ├── llm.py                 # Groq setup
│   │   ├── memory.py              # ChromaDB RAG
│   │   ├── pipeline.py            # LangGraph state machine
│   │   └── state.py               # Shared agent state
│   └── utils/
│       └── github_fetcher.py      # GitHub API
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analyze.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── Memory.jsx
│   │   │   └── About.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── AgentPipeline.jsx
│   │   │   ├── AgentChat.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   ├── ResultsPanel.jsx
│   │   │   ├── MemoryPanel.jsx
│   │   │   └── CodeDiff.jsx
│   │   └── hooks/
│   │       ├── useAnalysis.js
│   │       └── useSSE.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 👨‍💻 Built By
**Nilesh Gupta** — AI/GenAI Developer
- 🔗 [GitHub](https://github.com/NileshGupta123)
