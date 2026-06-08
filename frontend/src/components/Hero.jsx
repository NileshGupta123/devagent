import { useState } from 'react'
import axios from 'axios'

// ─────────────────────────────────────────
// Hero — Repo Input + Trigger Analysis
// ─────────────────────────────────────────

export default function Hero({ onStart, onComplete, onError, loading }) {
  const [repoUrl, setRepoUrl] = useState('')
  const [error, setError]     = useState('')

  const exampleRepos = [
    'https://github.com/tiangolo/fastapi',
    'https://github.com/pallets/flask',
    'https://github.com/psf/requests',
  ]

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError('❌ Please enter a GitHub repo URL')
      return
    }
    if (!repoUrl.includes('github.com')) {
      setError('❌ Please enter a valid GitHub URL')
      return
    }

    setError('')
    onStart()

    try {
      const response = await axios.post('/analyze', {
        repo_url: repoUrl.trim(),
      }, {
        timeout: 120000, // 2 min timeout
      })

      onComplete(response.data)

    } catch (err) {
      const message = err.response?.data?.detail || 'Analysis failed. Please try again.'
      setError(`❌ ${message}`)
      onError()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handleAnalyze()
  }

  return (
    <div className="card text-center space-y-6 animate-fade-in">

      {/* Title */}
      <div className="space-y-3">
        <h2 className="text-4xl font-bold gradient-text">
          Code Intelligence at Scale
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Paste any public GitHub repo URL. Our 4 specialized AI agents will
          analyze, improve, test, and evaluate your codebase automatically.
        </p>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 text-center">
        {[
          { icon: '🔍', label: 'Bug Detection',    value: 'Agent 1' },
          { icon: '🛠️', label: 'Code Improvement', value: 'Agent 2' },
          { icon: '🧪', label: 'Test Generation',  value: 'Agent 3' },
          { icon: '📊', label: 'Quality Scoring',  value: 'Agent 4' },
        ].map((stat) => (
          <div key={stat.label} className="space-y-1">
            <div className="text-2xl">{stat.icon}</div>
            <div className="text-xs text-gray-500">{stat.value}</div>
            <div className="text-sm font-medium text-gray-300">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://github.com/owner/repository"
            className="input text-sm"
            disabled={loading}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !repoUrl.trim()}
            className="btn-primary whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span> Analyzing...
              </span>
            ) : (
              '🚀 Analyze'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm animate-fade-in">{error}</p>
        )}

        {/* Example repos */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-xs text-gray-600">Try:</span>
          {exampleRepos.map((repo) => (
            <button
              key={repo}
              onClick={() => setRepoUrl(repo)}
              disabled={loading}
              className="text-xs text-primary hover:text-secondary transition-colors duration-200"
            >
              {repo.split('/').slice(-1)[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="animate-fade-in space-y-2">
          <div className="flex justify-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            Agents are working... this may take 30-60 seconds ⏳
          </p>
        </div>
      )}

    </div>
  )
}