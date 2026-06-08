import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AgentPipeline from '../components/AgentPipeline'
import { useSSE } from '../hooks/useSSE'

// ─────────────────────────────────────────
// Analyze Page — Repo Input + Live Status
// ─────────────────────────────────────────

const exampleRepos = [
  { name: 'fastapi',  url: 'https://github.com/tiangolo/fastapi', lang: 'Python'     },
  { name: 'flask',    url: 'https://github.com/pallets/flask',    lang: 'Python'     },
  { name: 'requests', url: 'https://github.com/psf/requests',     lang: 'Python'     },
  { name: 'axios',    url: 'https://github.com/axios/axios',      lang: 'JavaScript' },
]

const agentSteps = [
  { key: 'analyzer',  icon: '🔍', label: 'Analyzer Agent',    desc: 'Scanning for bugs & issues...'    },
  { key: 'improver',  icon: '🛠️', label: 'Improvement Agent', desc: 'Generating fixes & refactors...'  },
  { key: 'tester',    icon: '🧪', label: 'Test Agent',         desc: 'Writing unit tests...'            },
  { key: 'evaluator', icon: '📊', label: 'Evaluator Agent',    desc: 'Scoring & generating feedback...' },
]

export default function Analyze({ setResults }) {
  const navigate    = useNavigate()
  const [repoUrl,     setRepoUrl]     = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [currentStep, setCurrentStep] = useState(-1)
  const [sessionId,   setSessionId]   = useState(null)
  const [agentStatus, setAgentStatus] = useState({
    analyzer: 'idle', improver: 'idle', tester: 'idle', evaluator: 'idle',
  })

  const { logs, clearLogs } = useSSE(sessionId, loading)

  const simulateAgentProgress = (sid) => {
    setSessionId(sid)
    const steps = ['analyzer', 'improver', 'tester', 'evaluator']
    steps.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(i)
        setAgentStatus(prev => ({ ...prev, [step]: 'running' }))
        if (i > 0) {
          setAgentStatus(prev => ({ ...prev, [steps[i - 1]]: 'done' }))
        }
      }, i * 15000)
    })
  }

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) { setError('❌ Please enter a GitHub repo URL'); return }
    if (!repoUrl.includes('github.com')) { setError('❌ Please enter a valid GitHub URL'); return }

    setError('')
    setLoading(true)
    clearLogs()
    setCurrentStep(0)
    setAgentStatus({ analyzer: 'running', improver: 'idle', tester: 'idle', evaluator: 'idle' })

    const sid = Math.random().toString(36).slice(2, 10)
    simulateAgentProgress(sid)

    try {
      const response = await axios.post('/analyze', {
        repo_url: repoUrl.trim(),
      }, { timeout: 180000 })

      setAgentStatus({ analyzer: 'done', improver: 'done', tester: 'done', evaluator: 'done' })
      setResults(response.data)
      setTimeout(() => navigate('/results'), 1000)

    } catch (err) {
      const message = err.response?.data?.detail || 'Analysis failed. Please try again.'
      setError(`❌ ${message}`)
      setAgentStatus({ analyzer: 'error', improver: 'error', tester: 'error', evaluator: 'error' })
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-6 space-y-8">

      {/* ── Header ── */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black text-white">
          🔍 Analyze a Repository
        </h1>
        <p className="text-gray-400 text-lg">
          Paste any public GitHub URL and watch 4 AI agents work in real-time
        </p>
      </div>

      {/* ── Input Card ── */}
      <div className="card space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📦</span> Enter GitHub Repository URL
        </h2>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
            placeholder="https://github.com/owner/repository"
            className="input text-sm"
            disabled={loading}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !repoUrl.trim()}
            className="btn-primary whitespace-nowrap px-8 flex items-center gap-2"
          >
            {loading
              ? <><span className="animate-spin">⚙️</span> Analyzing...</>
              : <><span>🚀</span> Analyze</>
            }
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg
                          px-4 py-3 text-red-400 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Example repos */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Try these example repos:</p>
          <div className="flex flex-wrap gap-2">
            {exampleRepos.map((repo) => (
              <button
                key={repo.name}
                onClick={() => setRepoUrl(repo.url)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                           bg-card border border-border hover:border-primary/50
                           text-sm text-gray-300 hover:text-white
                           transition-all duration-200 disabled:opacity-50"
              >
                <span className="text-xs badge badge-blue">{repo.lang}</span>
                <span>{repo.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '⏱️', title: '30-60 seconds',  desc: 'Average analysis time'   },
            { icon: '📁', title: 'Up to 8 files',  desc: 'Analyzed per repository' },
            { icon: '🔒', title: 'Public repos',   desc: 'No private repo access'  },
          ].map((info) => (
            <div key={info.title}
              className="flex items-center gap-3 p-3 rounded-lg
                         bg-black/20 border border-border">
              <span className="text-2xl">{info.icon}</span>
              <div>
                <div className="text-sm font-semibold text-white">{info.title}</div>
                <div className="text-xs text-gray-500">{info.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Agent Pipeline ── */}
      <AgentPipeline agentStatus={agentStatus} loading={loading} />

      {/* ── Live Agent Steps ── */}
      {loading && (
        <div className="card space-y-4 animate-fade-in">
          <h3 className="font-bold text-white">⚡ Live Agent Progress</h3>
          <div className="space-y-3">
            {agentSteps.map((step) => {
              const status = agentStatus[step.key]
              return (
                <div key={step.key}
                  className={`flex items-center gap-4 p-4 rounded-xl border
                              transition-all duration-500
                              ${status === 'running' ? 'border-yellow-500/50 bg-yellow-500/5' :
                                status === 'done'    ? 'border-green-500/50  bg-green-500/5'  :
                                status === 'error'   ? 'border-red-500/50    bg-red-500/5'    :
                                'border-border bg-black/10'}`}
                >
                  <div className="text-2xl">{step.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm">{step.label}</div>
                    <div className="text-xs text-gray-400">
                      {status === 'running' ? step.desc   :
                       status === 'done'    ? '✅ Completed!' :
                       status === 'error'   ? '❌ Failed'     :
                       '⏳ Waiting...'}
                    </div>
                  </div>
                  <div>
                    {status === 'running' && (
                      <div className="flex gap-1">
                        {[0, 1, 2].map(j => (
                          <div key={j}
                            className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${j * 0.15}s` }}
                          />
                        ))}
                      </div>
                    )}
                    {status === 'done'  && <span className="text-green-400 text-xl">✅</span>}
                    {status === 'error' && <span className="text-red-400   text-xl">❌</span>}
                    {status === 'idle'  && <span className="text-gray-600  text-xl">⏸️</span>}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-center text-sm text-gray-500 animate-pulse">
            🧠 Agents are collaborating... please wait
          </div>
        </div>
      )}

      {/* ── Real-time Logs ── */}
      {loading && logs.length > 0 && (
        <div className="card space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              ⚡ Live Agent Logs
            </h3>
            <span className="text-xs text-gray-500">{logs.length} events</span>
          </div>

          <div className="bg-black/50 border border-border rounded-xl
                          p-4 max-h-64 overflow-y-auto space-y-1 font-mono">
            {logs.map((log) => (
              <div key={log.id}
                className={`flex items-start gap-3 text-xs animate-fade-in
                            ${log.agent === 'analyzer'  ? 'text-red-300'    :
                              log.agent === 'improver'  ? 'text-blue-300'   :
                              log.agent === 'tester'    ? 'text-green-300'  :
                              log.agent === 'evaluator' ? 'text-purple-300' :
                              'text-gray-400'}`}
              >
                <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                <span>{log.msg}</span>
              </div>
            ))}
            <div id="log-bottom" />
          </div>
        </div>
      )}

    </div>
  )
}