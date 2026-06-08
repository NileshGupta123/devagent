import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// ─────────────────────────────────────────
// Memory Page — ChromaDB Session History
// Shows self-improvement over time
// ─────────────────────────────────────────

function getVerdict(score) {
  if (score >= 90) return { label: 'EXCELLENT', color: 'text-green-400',  badge: 'badge-green',  icon: '🏆' }
  if (score >= 70) return { label: 'GOOD',       color: 'text-blue-400',   badge: 'badge-blue',   icon: '✅' }
  if (score >= 50) return { label: 'NEEDS WORK', color: 'text-yellow-400', badge: 'badge-yellow', icon: '⚠️' }
  return                   { label: 'POOR',       color: 'text-red-400',    badge: 'badge-red',    icon: '❌' }
}

function SessionCard({ session, index }) {
  const verdict = getVerdict(session.total_score)
  const date    = new Date(session.timestamp).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="card-hover animate-fade-in space-y-4"
         style={{ animationDelay: `${index * 0.05}s` }}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30
                          flex items-center justify-center text-lg font-bold text-primary">
            {index + 1}
          </div>
          <div>
            <div className="font-semibold text-white">{session.repo_name}</div>
            <div className="text-xs text-gray-500 mt-0.5">🕐 {date}</div>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className={`text-3xl font-black ${verdict.color}`}>
            {session.total_score}
          </div>
          <span className={`badge ${verdict.badge} mt-1`}>
            {verdict.icon} {verdict.label}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Score</span>
          <span>{Math.round(session.total_score / 2.9)}%</span>
        </div>
        <div className="score-bar">
          <div
            className="score-fill bg-gradient-to-r from-primary to-secondary"
            style={{ width: `${Math.min(session.total_score / 2.9, 100)}%` }}
          />
        </div>
      </div>

      {/* Session ID */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>🔑</span>
        <span className="font-mono">{session.session_id}</span>
      </div>

    </div>
  )
}


export default function Memory() {
  const navigate              = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [sortBy,   setSortBy]   = useState('date') // date | score

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/sessions')
      setSessions(res.data.sessions || [])
    } catch {
      setError('Failed to load sessions from ChromaDB')
    } finally {
      setLoading(false)
    }
  }

  const clearSessions = async () => {
    if (!confirm('Clear ALL memory sessions? This cannot be undone.')) return
    try {
      await axios.delete('/sessions')
      setSessions([])
    } catch {
      setError('Failed to clear sessions')
    }
  }

  useEffect(() => { fetchSessions() }, [])

  // Computed stats
  const avgScore   = sessions.length
    ? Math.round(sessions.reduce((a, b) => a + b.total_score, 0) / sessions.length)
    : 0
  const bestScore  = sessions.length ? Math.max(...sessions.map(s => s.total_score)) : 0
  const totalRepos = new Set(sessions.map(s => s.repo_name)).size

  // Sorted sessions
  const sorted = [...sessions].sort((a, b) =>
    sortBy === 'score'
      ? b.total_score - a.total_score
      : new Date(b.timestamp) - new Date(a.timestamp)
  )

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-6 space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            🧠 Agent Memory
          </h1>
          <p className="text-gray-400 mt-1">
            ChromaDB vector store — agents learn from every analysis
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSessions}
            className="btn-secondary flex items-center gap-2"
          >
            🔄 Refresh
          </button>
          {sessions.length > 0 && (
            <button
              onClick={clearSessions}
              className="btn-secondary text-red-400 flex items-center gap-2"
            >
              🗑️ Clear All
            </button>
          )}
          <button
            onClick={() => navigate('/analyze')}
            className="btn-primary flex items-center gap-2"
          >
            🚀 New Analysis
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '📊', label: 'Total Sessions',  value: sessions.length, color: 'text-primary'  },
          { icon: '⭐', label: 'Average Score',    value: avgScore,        color: 'text-yellow-400' },
          { icon: '🏆', label: 'Best Score',       value: bestScore,       color: 'text-green-400'  },
          { icon: '📁', label: 'Repos Analyzed',  value: totalRepos,      color: 'text-accent'     },
        ].map((stat) => (
          <div key={stat.label}
            className="card text-center space-y-2 hover:border-primary/50
                       transition-all duration-300">
            <div className="text-2xl">{stat.icon}</div>
            <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── How Memory Works ── */}
      <div className="card border-primary/20 bg-primary/5 space-y-4">
        <h3 className="font-bold text-primary text-lg">
          🔄 How Self-Improvement Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: '1',
              icon: '📊',
              title: 'Evaluator scores output',
              desc: 'After each analysis, the evaluator agent generates detailed feedback on what was good and what needs improvement.',
            },
            {
              step: '2',
              icon: '💾',
              title: 'Stored in ChromaDB',
              desc: 'Feedback is embedded and stored as vectors in ChromaDB. Each session builds on the knowledge of all previous ones.',
            },
            {
              step: '3',
              icon: '🧠',
              title: 'Agents learn & improve',
              desc: 'On the next run, agents retrieve relevant past feedback and use it to produce better analysis, fixes, and tests.',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30
                              flex items-center justify-center text-sm font-bold text-primary
                              shrink-0 mt-0.5">
                {item.step}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="font-semibold text-white text-sm">{item.title}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sessions List ── */}
      <div className="space-y-4">

        {/* List header */}
        {sessions.length > 0 && (
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">
              📋 Past Sessions ({sessions.length})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              <div className="flex bg-card border border-border rounded-lg p-1 gap-1">
                {['date', 'score'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1 rounded text-xs font-medium
                                transition-colors duration-200 capitalize
                                ${sortBy === s
                                  ? 'bg-primary text-white'
                                  : 'text-gray-400 hover:text-white'
                                }`}
                  >
                    {s === 'date' ? '🕐 Date' : '⭐ Score'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card text-center py-12 space-y-3">
            <div className="text-4xl animate-spin">⚙️</div>
            <p className="text-gray-400">Loading sessions from ChromaDB...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card border-red-500/20 bg-red-500/5 text-red-400 text-center py-8">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && sessions.length === 0 && (
          <div className="card text-center py-20 space-y-4">
            <div className="text-6xl">🧠</div>
            <h3 className="text-xl font-bold text-white">Memory is Empty</h3>
            <p className="text-gray-400">
              No sessions yet. Analyze a repo to start building agent memory!
            </p>
            <button
              onClick={() => navigate('/analyze')}
              className="btn-primary px-8 py-3 inline-flex items-center gap-2"
            >
              🚀 Analyze First Repo
            </button>
          </div>
        )}

        {/* Sessions grid */}
        {!loading && sorted.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sorted.map((session, i) => (
              <SessionCard key={session.session_id} session={session} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}