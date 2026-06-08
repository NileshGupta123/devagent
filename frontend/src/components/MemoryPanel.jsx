import { useState, useEffect } from 'react'
import axios from 'axios'

// ─────────────────────────────────────────
// MemoryPanel — Shows past analysis
// sessions from ChromaDB memory
// ─────────────────────────────────────────

function getVerdict(score) {
  if (score >= 90) return { label: 'EXCELLENT', color: 'text-green-400',  badge: 'badge-green'  }
  if (score >= 70) return { label: 'GOOD',       color: 'text-blue-400',   badge: 'badge-blue'   }
  if (score >= 50) return { label: 'NEEDS WORK', color: 'text-yellow-400', badge: 'badge-yellow' }
  return                   { label: 'POOR',       color: 'text-red-400',    badge: 'badge-red'    }
}

function SessionCard({ session }) {
  const verdict = getVerdict(session.total_score)
  const date    = new Date(session.timestamp).toLocaleDateString('en-IN', {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="card-hover animate-fade-in">
      <div className="flex items-center justify-between">

        {/* Left */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">📁</span>
            <span className="font-semibold text-white">
              {session.repo_name}
            </span>
          </div>
          <div className="flex gap-3 text-xs text-gray-500">
            <span>🔑 {session.session_id}</span>
            <span>🕐 {date}</span>
          </div>
        </div>

        {/* Right — Score */}
        <div className="text-right space-y-1">
          <div className={`text-2xl font-bold ${verdict.color}`}>
            {session.total_score}
          </div>
          <span className={`badge ${verdict.badge}`}>
            {verdict.label}
          </span>
        </div>

      </div>

      {/* Score bar */}
      <div className="mt-3 score-bar">
        <div
          className="score-fill bg-gradient-to-r from-primary to-secondary"
          style={{ width: `${Math.min(session.total_score / 2.9, 100)}%` }}
        />
      </div>
    </div>
  )
}


export default function MemoryPanel() {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/sessions')
      setSessions(res.data.sessions || [])
    } catch (err) {
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const clearSessions = async () => {
    if (!confirm('Clear all memory sessions?')) return
    try {
      await axios.delete('/sessions')
      setSessions([])
    } catch (err) {
      setError('Failed to clear sessions')
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  // Stats
  const avgScore   = sessions.length
    ? Math.round(sessions.reduce((a, b) => a + b.total_score, 0) / sessions.length)
    : 0
  const bestScore  = sessions.length
    ? Math.max(...sessions.map(s => s.total_score))
    : 0
  const totalRepos = new Set(sessions.map(s => s.repo_name)).size

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              🧠 Agent Memory
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Past analyses stored in ChromaDB — agents learn from these
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchSessions} className="btn-secondary text-xs">
              🔄 Refresh
            </button>
            {sessions.length > 0 && (
              <button onClick={clearSessions} className="btn-secondary text-xs text-red-400">
                🗑️ Clear
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Sessions', value: sessions.length, icon: '📊' },
            { label: 'Avg Score',      value: avgScore,        icon: '⭐' },
            { label: 'Repos Analyzed', value: totalRepos,      icon: '📁' },
          ].map((stat) => (
            <div key={stat.label} className="bg-black/30 rounded-lg p-3 text-center">
              <div className="text-xl">{stat.icon}</div>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions list */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin text-3xl mb-2">⚙️</div>
          Loading sessions...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">{error}</div>
      ) : sessions.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <div className="text-4xl">🧠</div>
          <p className="text-gray-400 font-medium">No sessions yet</p>
          <p className="text-gray-600 text-sm">
            Analyze a repo to start building agent memory!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            {sessions.length} session{sessions.length > 1 ? 's' : ''} in memory
            · Best score: <span className="text-primary">{bestScore}</span>
          </p>
          {sessions.map((session) => (
            <SessionCard key={session.session_id} session={session} />
          ))}
        </div>
      )}

    </div>
  )
}