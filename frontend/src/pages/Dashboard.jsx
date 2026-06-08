import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'

// ─────────────────────────────────────────
// Dashboard Page — Organization Overview
// ─────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="card hover:border-primary/50 transition-all duration-300
                    hover:shadow-lg hover:shadow-primary/10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-4xl font-black ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  )
}

function getVerdict(score) {
  if (score >= 90) return { label: 'EXCELLENT', color: 'text-green-400',  bg: 'bg-green-500/10'  }
  if (score >= 70) return { label: 'GOOD',       color: 'text-blue-400',   bg: 'bg-blue-500/10'   }
  if (score >= 50) return { label: 'NEEDS WORK', color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
  return                   { label: 'POOR',       color: 'text-red-400',    bg: 'bg-red-500/10'    }
}

export default function Dashboard() {
  const navigate              = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    axios.get('/sessions')
      .then(res => setSessions(res.data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  // ── Computed Stats ──
  const totalSessions = sessions.length
  const avgScore      = totalSessions
    ? Math.round(sessions.reduce((a, b) => a + b.total_score, 0) / totalSessions)
    : 0
  const bestScore     = totalSessions ? Math.max(...sessions.map(s => s.total_score)) : 0
  const totalRepos    = new Set(sessions.map(s => s.repo_name)).size
  const improving     = sessions.length >= 2
    ? sessions[0]?.total_score > sessions[sessions.length - 1]?.total_score
    : false

  // ── Chart Data ──
  const trendData = [...sessions]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-10)
    .map((s, i) => ({
      session:  `#${i + 1}`,
      score:    s.total_score,
      repo:     s.repo_name,
    }))

  const repoData = Object.entries(
    sessions.reduce((acc, s) => {
      acc[s.repo_name] = acc[s.repo_name] || []
      acc[s.repo_name].push(s.total_score)
      return acc
    }, {})
  ).map(([repo, scores]) => ({
    repo:  repo.length > 12 ? repo.slice(0, 12) + '...' : repo,
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    runs:  scores.length,
  }))

  const radarData = [
    { subject: 'Analysis',    score: avgScore * 0.9  },
    { subject: 'Improvements',score: avgScore * 0.85 },
    { subject: 'Testing',     score: avgScore * 1.1  },
    { subject: 'Evaluation',  score: avgScore        },
    { subject: 'Memory',      score: Math.min(totalSessions * 10, 100) },
  ]

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-6 space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            📊 Organization Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time overview of all code analyses and agent performance
          </p>
        </div>
        <button
          onClick={() => navigate('/analyze')}
          className="btn-primary flex items-center gap-2"
        >
          🚀 New Analysis
        </button>
      </div>

      {/* ── Org Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="📊" label="Total Analyses"
          value={totalSessions}
          color="text-primary"
          sub="All time runs"
        />
        <StatCard
          icon="⭐" label="Average Score"
          value={avgScore}
          color="text-yellow-400"
          sub={`Out of 290 pts`}
        />
        <StatCard
          icon="🏆" label="Best Score"
          value={bestScore}
          color="text-green-400"
          sub="Highest achieved"
        />
        <StatCard
          icon="📁" label="Repos Analyzed"
          value={totalRepos}
          color="text-accent"
          sub="Unique repositories"
        />
      </div>

      {/* ── Trend + Radar Charts ── */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Score Trend */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">📈 Score Trend</h3>
              <span className={`badge ${improving ? 'badge-green' : 'badge-yellow'}`}>
                {improving ? '↗ Improving' : '→ Stable'}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="session" stroke="#4b5563" tick={{ fontSize: 11 }} />
                <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} domain={[0, 290]} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="score"
                  stroke="#6366f1" strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Agent Radar */}
          <div className="card space-y-4">
            <h3 className="font-bold text-white">🤖 Agent Performance Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2a2a4a" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <Radar
                  dataKey="score"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      {/* ── Repo Bar Chart ── */}
      {repoData.length > 0 && (
        <div className="card space-y-4">
          <h3 className="font-bold text-white">📁 Score by Repository</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={repoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="repo" stroke="#4b5563" tick={{ fontSize: 11 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} domain={[0, 290]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Recent Activity ── */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">🕐 Recent Activity</h3>
          <button
            onClick={() => navigate('/memory')}
            className="btn-secondary text-xs"
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 animate-pulse">
            Loading sessions...
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl">📭</div>
            <p className="text-gray-400">No analyses yet</p>
            <button
              onClick={() => navigate('/analyze')}
              className="btn-primary px-6 py-2 text-sm"
            >
              🚀 Run First Analysis
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session, i) => {
              const verdict = getVerdict(session.total_score)
              const date    = new Date(session.timestamp).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short',
                hour: '2-digit', minute: '2-digit',
              })
              return (
                <div key={session.session_id}
                  className="flex items-center justify-between p-4
                             rounded-xl bg-black/20 border border-border
                             hover:border-primary/30 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20
                                    flex items-center justify-center
                                    text-sm font-bold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {session.repo_name}
                      </div>
                      <div className="text-xs text-gray-500">{date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="score-bar w-24 hidden md:block">
                      <div
                        className="score-fill bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${Math.min(session.total_score / 2.9, 100)}%` }}
                      />
                    </div>
                    <div className={`text-lg font-black ${verdict.color}`}>
                      {session.total_score}
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg
                                      ${verdict.bg} ${verdict.color}`}>
                      {verdict.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: '🔍', title: 'Analyze Repo',
            desc: 'Run 4 AI agents on any GitHub repo',
            action: () => navigate('/analyze'),
            color: 'border-primary/20',
          },
          {
            icon: '🧠', title: 'View Memory',
            desc: 'Browse ChromaDB session history',
            action: () => navigate('/memory'),
            color: 'border-secondary/20',
          },
          {
            icon: 'ℹ️', title: 'How It Works',
            desc: 'Learn about the agent architecture',
            action: () => navigate('/about'),
            color: 'border-accent/20',
          },
        ].map((card) => (
          <div
            key={card.title}
            onClick={card.action}
            className={`card ${card.color} cursor-pointer
                        hover:scale-105 transition-all duration-300
                        hover:shadow-lg space-y-2`}
          >
            <div className="text-3xl">{card.icon}</div>
            <div className="font-bold text-white">{card.title}</div>
            <div className="text-sm text-gray-400">{card.desc}</div>
          </div>
        ))}
      </div>

    </div>
  )
}