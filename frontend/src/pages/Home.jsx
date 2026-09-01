import { Link } from 'react-router-dom'

// ─────────────────────────────────────────
// Home Page — Stunning Landing Page
// ─────────────────────────────────────────

const features = [
  {
    icon: '🔍',
    title: 'Bug Detection',
    desc: "Analyzer agent scans your entire codebase for bugs, anti-patterns, and security vulnerabilities across multiple files.",
    color: 'from-red-500/20 to-red-500/5',
    border: 'border-red-500/20',
  },
  {
    icon: '🛠️',
    title: 'Code Improvement',
    desc: "Improvement agent suggests concrete fixes, refactors messy code, and enforces best practices with real code snippets.",
    color: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/20',
  },
  {
    icon: '🧪',
    title: 'Test Generation',
    desc: "Test agent automatically generates comprehensive unit tests including edge cases and error handling using pytest or Jest.",
    color: 'from-green-500/20 to-green-500/5',
    border: 'border-green-500/20',
  },
  {
    icon: '📊',
    title: 'Quality Scoring',
    desc: "Evaluator agent scores every output, generates feedback, and stores it in ChromaDB memory for self-improvement.",
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/20',
  },
  {
    icon: '🧠',
    title: 'Self-Improving Memory',
    desc: "ChromaDB vector memory stores past analyses. Agents learn from previous mistakes and improve with every run.",
    color: 'from-yellow-500/20 to-yellow-500/5',
    border: 'border-yellow-500/20',
  },
  {
    icon: '⚡',
    title: 'Groq Powered',
    desc: "Powered by Groq ultra-fast inference with gpt-oss-120b model. Analyze entire repos in under 60 seconds.",
    color: 'from-cyan-500/20 to-cyan-500/5',
    border: 'border-cyan-500/20',
  },
]

const stats = [
  { value: '4',    label: 'AI Agents',      icon: '🤖' },
  { value: '120B', label: 'LLM Parameters', icon: '🧠' },
  { value: '<60s', label: 'Analysis Time',  icon: '⚡' },
  { value: '∞',    label: 'Self-Improving', icon: '🔄' },
]

const stack = [
  { name: 'LangGraph',  color: 'badge-purple' },
  { name: 'LangChain',  color: 'badge-blue'   },
  { name: 'Groq API',   color: 'badge-green'  },
  { name: 'FastAPI',    color: 'badge-yellow' },
  { name: 'ChromaDB',   color: 'badge-red'    },
  { name: 'React 19',   color: 'badge-blue'   },
  { name: 'React Flow', color: 'badge-purple' },
  { name: 'Docker',     color: 'badge-green'  },
]

const agentSteps = [
  { icon: '📦', label: 'GitHub Repo', sub: 'Input URL',        color: 'border-gray-500'   },
  { icon: '🔍', label: 'Analyzer',    sub: 'Find bugs',        color: 'border-red-500'    },
  { icon: '🛠️', label: 'Improver',    sub: 'Fix issues',       color: 'border-blue-500'   },
  { icon: '🧪', label: 'Tester',      sub: 'Generate tests',   color: 'border-green-500'  },
  { icon: '📊', label: 'Evaluator',   sub: 'Score & feedback', color: 'border-purple-500' },
  { icon: '🧠', label: 'Memory',      sub: 'Self-improve',     color: 'border-yellow-500' },
]

export default function Home() {
  return (
    <div className="pt-24 pb-16">

      {/* ── Hero Section ── */}
      <section className="max-w-7xl mx-auto px-6 text-center space-y-8 py-16">
        <div className="relative">

          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="w-64 h-64 bg-secondary/10 rounded-full blur-2xl
                            animate-pulse-slow absolute translate-x-32" />
          </div>

          <div className="relative space-y-8">

            {/* Badge */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full
                              bg-primary/10 border border-primary/20
                              text-sm text-primary animate-fade-in">
                <span className="animate-pulse">●</span>
                <span>Powered by LangGraph + Groq gpt-oss-120b</span>
                <span className="badge badge-green text-xs">New</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4 animate-slide-up">
              <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight">
                <span className="text-indigo-400">AI Agents</span>
                <br />
                <span className="text-white">That Improve</span>
                <br />
                <span className="text-purple-300">Your Code</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Paste any public GitHub repo URL. 4 specialized AI agents
                collaborate to analyze, fix, test, and evaluate your codebase
                {" — then "}
                <span className="text-primary font-semibold">
                  learn from the results.
                </span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in">
              <Link
                to="/analyze"
                className="btn-primary text-lg px-10 py-4 flex items-center gap-2
                           shadow-lg shadow-primary/30 hover:shadow-primary/50
                           hover:scale-105 transition-all duration-300"
              >
                🚀 Analyze a Repo
              </Link>
              <Link
                to="/dashboard"
                className="btn-secondary text-lg px-8 py-4 flex items-center gap-2
                           hover:scale-105 transition-all duration-300"
              >
                📊 View Dashboard
              </Link>
              <a
                href="https://github.com/NileshGupta123/devagent"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-lg px-8 py-4 flex items-center gap-2
                           hover:scale-105 transition-all duration-300"
              >
                ⭐ Star on GitHub
              </a>
            </div>

            {/* Tech stack badges */}
            <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
              {stack.map((s) => (
                <span key={s.name} className={`badge ${s.color} text-sm px-3 py-1`}>
                  {s.name}
                </span>
              ))}
            </div>

            {/* Agent stats bar */}
            <div className="flex items-center justify-center gap-8 flex-wrap
                            p-4 rounded-2xl bg-card/50 border border-border
                            backdrop-blur-sm max-w-2xl mx-auto">
              {[
                { icon: '🔍', label: 'Bug Detection',    value: 'Agent 1' },
                { icon: '🛠️', label: 'Code Improvement', value: 'Agent 2' },
                { icon: '🧪', label: 'Test Generation',  value: 'Agent 3' },
                { icon: '📊', label: 'Quality Scoring',  value: 'Agent 4' },
              ].map((stat) => (
                <div key={stat.label} className="text-center space-y-1">
                  <div className="text-2xl">{stat.icon}</div>
                  <div className="text-xs text-gray-500">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="card text-center space-y-2 hover:border-primary/50
                         transition-all duration-300 hover:shadow-lg
                         hover:shadow-primary/10 hover:scale-105"
            >
              <div className="text-3xl">{stat.icon}</div>
              <div className="text-4xl font-black gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pipeline Visual ── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="card space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">
              How the Pipeline Works
            </h2>
            <p className="text-gray-400">
              4 agents working in sequence with a feedback loop
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center
                          justify-between gap-4 overflow-x-auto pb-2">
            {agentSteps.map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-4 shrink-0">
                <div className={`card ${step.color} text-center min-w-[110px]
                                 space-y-1 hover:scale-105 transition-all duration-300`}>
                  <div className="text-2xl">{step.icon}</div>
                  <div className="text-sm font-semibold text-white">{step.label}</div>
                  <div className="text-xs text-gray-500">{step.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="text-primary text-xl hidden md:block">→</div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full
                            bg-yellow-500/10 border border-yellow-500/20
                            text-sm text-yellow-400">
              🔄 Feedback loop: Evaluator → Memory → Agents improve on next run
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Everything You Need
          </h2>
          <p className="text-gray-400">6 powerful capabilities in one system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`card border ${f.border} bg-gradient-to-br ${f.color}
                          hover:scale-105 transition-all duration-300
                          hover:shadow-lg cursor-default`}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Bottom ── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="card text-center space-y-6 bg-gradient-to-br
                        from-primary/10 via-secondary/5 to-accent/10
                        border-primary/20">
          <h2 className="text-4xl font-black text-white">
            Ready to Analyze Your Code?
          </h2>
          <p className="text-gray-400 text-lg">
            Paste any public GitHub URL and let the agents do the work.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/analyze"
              className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2
                         shadow-lg shadow-primary/30 hover:scale-105
                         transition-all duration-300"
            >
              🚀 Start Analyzing Now
            </Link>
            <Link
              to="/about"
              className="btn-secondary text-lg px-8 py-4 inline-flex items-center gap-2
                         hover:scale-105 transition-all duration-300"
            >
              ℹ️ How It Works
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}