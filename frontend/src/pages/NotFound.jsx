import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

// ─────────────────────────────────────────
// 404 Not Found Page
// ─────────────────────────────────────────

export default function NotFound() {
  const navigate        = useNavigate()
  const [count, setCount] = useState(5)

  // Auto redirect after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <div className="text-center space-y-8 animate-fade-in max-w-lg">

        {/* Glitch number */}
        <div className="relative">
          <h1 className="text-[10rem] font-black leading-none
                         text-transparent bg-clip-text
                         bg-gradient-to-b from-primary to-secondary
                         select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl animate-pulse-slow opacity-20
                             font-black text-primary">
              404
            </span>
          </div>
        </div>

        {/* Robot emoji */}
        <div className="text-6xl animate-bounce">🤖</div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">
            Page Not Found
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Looks like our AI agents couldn't find this page.
            Maybe it was refactored out of existence? 😄
          </p>
        </div>

        {/* Auto redirect countdown */}
        <div className="flex items-center justify-center gap-2
                        px-4 py-2 rounded-full bg-primary/10
                        border border-primary/20 w-fit mx-auto">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-primary">
            Redirecting to Home in {count}s...
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/')}
            className="btn-primary flex items-center gap-2"
          >
            🏠 Go Home
          </button>
          <button
            onClick={() => navigate('/analyze')}
            className="btn-secondary flex items-center gap-2"
          >
            🔍 Analyze Repo
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center gap-2"
          >
            ← Go Back
          </button>
        </div>

        {/* Fun agent message */}
        <div className="card border-border/50 bg-black/20 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>🔍</span>
            <span>Analyzer Agent Log:</span>
          </div>
          <p className="text-xs text-green-400 font-mono">
            {'>'} Scanning requested URL...<br />
            {'>'} Route not found in pipeline<br />
            {'>'} [CRITICAL] 404 error detected<br />
            {'>'} Redirecting to safe state...
          </p>
        </div>

      </div>
    </div>
  )
}