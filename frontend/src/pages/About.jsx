import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────
// About Page — How It Works + Tech Stack
// ─────────────────────────────────────────

const agents = [
  {
    number: '01',
    icon:    '🔍',
    name:    'Analyzer Agent',
    role:    'Bug & Issue Detection',
    color:   'border-red-500/30 bg-red-500/5',
    badge:   'badge-red',
    capabilities: [
      'Reads entire codebase across multiple files',
      'Detects bugs, anti-patterns & code smells',
      'Identifies security vulnerabilities',
      'Flags performance bottlenecks',
      'Checks dependency issues',
    ],
    prompt: 'Static code analysis + multi-file reasoning',
  },
  {
    number: '02',
    icon:    '🛠️',
    name:    'Improvement Agent',
    role:    'Code Refactoring & Fixes',
    color:   'border-blue-500/30 bg-blue-500/5',
    badge:   'badge-blue',
    capabilities: [
      'Generates concrete bug fix snippets',
      'Refactors messy code to clean patterns',
      'Enforces SOLID & clean code principles',
      'Optimizes performance-critical sections',
      'Prioritizes fixes by impact',
    ],
    prompt: 'Code generation + best practices enforcement',
  },
  {
    number: '03',
    icon:    '🧪',
    name:    'Test Generator Agent',
    role:    'Unit Test Creation',
    color:   'border-green-500/30 bg-green-500/5',
    badge:   'badge-green',
    capabilities: [
      'Generates pytest (Python) & Jest (JS) tests',
      'Covers happy path scenarios',
      'Creates edge case & boundary tests',
      'Adds error handling test coverage',
      'Writes descriptive test function names',
    ],
    prompt: 'Function-level understanding + edge case detection',
  },
  {
    number: '04',
    icon:    '📊',
    name:    'Evaluator Agent',
    role:    'Quality Scoring & Feedback',
    color:   'border-purple-500/30 bg-purple-500/5',
    badge:   'badge-purple',
    capabilities: [
      'Scores each agent output (0-100)',
      'Validates correctness of suggestions',
      'Generates actionable improvement feedback',
      'Stores results in ChromaDB memory',
      'Powers the self-improvement loop',
    ],
    prompt: 'Code correctness validation + quality assessment',
  },
]

const techStack = [
  {
    category: '🤖 AI & Agents',
    color:    'border-purple-500/20',
    items: [
      { name: 'LangGraph',          desc: 'Multi-agent state machine orchestration' },
      { name: 'LangChain',          desc: 'LLM chaining and prompt management'       },
      { name: 'Groq API',           desc: 'Ultra-fast llama-3.3-70b inference'       },
      { name: 'ChromaDB',           desc: 'Vector DB for agent memory & RAG'         },
    ],
  },
  {
    category: '⚙️ Backend',
    color:    'border-green-500/20',
    items: [
      { name: 'FastAPI',            desc: 'High-performance async Python API'        },
      { name: 'Python 3.11',        desc: 'Core language for all agents'             },
      { name: 'GitHub REST API',    desc: 'Fetches real repo code files'             },
      { name: 'SSE Starlette',      desc: 'Server-Sent Events for live streaming'    },
    ],
  },
  {
    category: '🎨 Frontend',
    color:    'border-blue-500/20',
    items: [
      { name: 'React 19 + Vite',    desc: 'Fast modern UI with hot reload'           },
      { name: 'Tailwind CSS v3',    desc: 'Utility-first responsive styling'         },
      { name: 'React Flow',         desc: 'Interactive agent pipeline visualization' },
      { name: 'Recharts',           desc: 'Score dashboards and data charts'         },
    ],
  },
  {
    category: '🐳 DevOps',
    color:    'border-yellow-500/20',
    items: [
      { name: 'Docker',             desc: 'Containerized backend & frontend'         },
      { name: 'docker-compose',     desc: 'Multi-service orchestration'              },
      { name: 'Nginx',              desc: 'Production frontend serving & proxy'      },
      { name: 'Render / Railway',   desc: 'Cloud deployment platform'                },
    ],
  },
]

const timeline = [
  { icon: '📦', step: '1', title: 'Input',      desc: 'User pastes any public GitHub repo URL'              },
  { icon: '🔗', step: '2', title: 'Fetch',       desc: 'GitHub API fetches up to 15 code files'             },
  { icon: '🔍', step: '3', title: 'Analyze',     desc: 'Analyzer agent scans for bugs & issues'             },
  { icon: '🛠️', step: '4', title: 'Improve',     desc: 'Improver agent suggests fixes & refactors'          },
  { icon: '🧪', step: '5', title: 'Test',         desc: 'Test agent generates unit tests & edge cases'       },
  { icon: '📊', step: '6', title: 'Evaluate',    desc: 'Evaluator scores everything & gives feedback'       },
  { icon: '💾', step: '7', title: 'Remember',    desc: 'Results stored in ChromaDB for future improvement'  },
  { icon: '🔄', step: '8', title: 'Improve',     desc: 'Next run uses past feedback to do better'           },
]

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-6 space-y-16">

      {/* ── Header ── */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black gradient-text">
          How DevAgent Works
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          A deep dive into the multi-agent architecture, tech stack,
          and self-improvement loop that powers DevAgent.
        </p>
      </div>

      {/* ── Timeline ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          🔄 Full Pipeline — Step by Step
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {timeline.map((item) => (
            <div key={item.step}
              className="card text-center space-y-3 hover:border-primary/50
                         hover:scale-105 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30
                              flex items-center justify-center text-sm font-bold text-primary
                              mx-auto">
                {item.step}
              </div>
              <div className="text-2xl">{item.icon}</div>
              <div className="font-bold text-white text-sm">{item.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Agents ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          🤖 The 4 Specialized Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div key={agent.name}
              className={`card border ${agent.color} space-y-4
                          hover:scale-[1.02] transition-all duration-300`}>

              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="text-5xl">{agent.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">
                      Agent {agent.number}
                    </span>
                    <span className={`badge ${agent.badge}`}>{agent.role}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{agent.name}</h3>
                </div>
              </div>

              {/* Capabilities */}
              <ul className="space-y-2">
                {agent.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-primary mt-0.5">→</span>
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>

              {/* Prompt strategy */}
              <div className="flex items-center gap-2 p-3 rounded-lg
                              bg-black/30 border border-border">
                <span className="text-xs text-gray-500">🧠 Strategy:</span>
                <span className="text-xs text-primary font-medium">{agent.prompt}</span>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          ⚙️ Tech Stack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {techStack.map((category) => (
            <div key={category.category}
              className={`card border ${category.color} space-y-4`}>
              <h3 className="font-bold text-white text-lg">{category.category}</h3>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div key={item.name}
                    className="flex items-center gap-3 p-3 rounded-lg
                               bg-black/20 border border-border">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                    </div>
                    <span className="text-primary text-lg">→</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scoring System ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          🏆 Scoring System
        </h2>
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { agent: 'Analyzer',  icon: '🔍', max: 50,  color: 'text-red-400',    criteria: 'Bugs & issues detected'      },
              { agent: 'Improver',  icon: '🛠️', max: 60,  color: 'text-blue-400',   criteria: 'Fixes & refactors suggested'  },
              { agent: 'Tester',    icon: '🧪', max: 80,  color: 'text-green-400',  criteria: 'Test cases generated'         },
              { agent: 'Evaluator', icon: '📊', max: 100, color: 'text-purple-400', criteria: 'Overall quality score'        },
            ].map((item) => (
              <div key={item.agent}
                className="card text-center space-y-3 hover:border-primary/50
                           transition-all duration-300">
                <div className="text-3xl">{item.icon}</div>
                <div className="font-bold text-white">{item.agent}</div>
                <div className={`text-3xl font-black ${item.color}`}>
                  {item.max}
                  <span className="text-sm text-gray-500"> pts</span>
                </div>
                <div className="text-xs text-gray-400">{item.criteria}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 pt-4
                          border-t border-border flex-wrap">
            {[
              { label: 'EXCELLENT', range: '90-290', color: 'badge-green'  },
              { label: 'GOOD',      range: '70-89',  color: 'badge-blue'   },
              { label: 'NEEDS WORK',range: '50-69',  color: 'badge-yellow' },
              { label: 'POOR',      range: '0-49',   color: 'badge-red'    },
            ].map((v) => (
              <div key={v.label} className="flex items-center gap-2">
                <span className={`badge ${v.color}`}>{v.label}</span>
                <span className="text-xs text-gray-500">{v.range} pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="card text-center space-y-6
                          bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10
                          border-primary/20">
        <h2 className="text-3xl font-black text-white">
          Ready to Try It?
        </h2>
        <p className="text-gray-400">
          Analyze any public GitHub repo in under 60 seconds.
        </p>
        <button
          onClick={() => navigate('/analyze')}
          className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2
                     shadow-lg shadow-primary/30 hover:scale-105 transition-all duration-300"
        >
          🚀 Start Analyzing
        </button>
      </section>

    </div>
  )
}