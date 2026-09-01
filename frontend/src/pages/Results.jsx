import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ScoreCard from '../components/ScoreCard'
import ResultsPanel from '../components/ResultsPanel'
import AgentChat from '../components/AgentChat'

// ─────────────────────────────────────────
// Results Page — Full Analysis Results
// ─────────────────────────────────────────

const tabs = [
  { key: 'analysis',     label: 'Analysis',     icon: '🔍', color: 'text-red-400'    },
  { key: 'improvements', label: 'Improvements', icon: '🛠️', color: 'text-blue-400'   },
  { key: 'tests',        label: 'Tests',        icon: '🧪', color: 'text-green-400'  },
  { key: 'evaluation',   label: 'Evaluation',   icon: '📊', color: 'text-purple-400' },
]

export default function Results({ results }) {
  const navigate                      = useNavigate()
  const [activeTab,  setActiveTab]    = useState('analysis')
  const [exported,   setExported]     = useState(false)
  const [copied,     setCopied]       = useState(false)

  const handleExport = () => {
    const report = {
      exported_at:  new Date().toISOString(),
      session_id:   results.session_id,
      repo_name:    results.repo_name,
      iteration:    results.iteration,
      model:        'llama-3.3-70b',
      engine:       'Groq + LangGraph',
      scores:       results.scores,
      analysis:     results.analysis,
      improvements: results.improvements,
      tests:        results.tests,
      evaluation:   results.evaluation,
      feedback:     results.feedback,
    }

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      { type: 'application/json' }
    )
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `devagent-report-${results.session_id}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  const handleCopyAll = () => {
    const fullReport = `
DevAgent Analysis Report
========================
Repository:  ${results.repo_name}
Session:     ${results.session_id}
Date:        ${new Date().toLocaleString()}
Score:       ${results.scores?.total}/290

## ANALYSIS
${results.analysis}

## IMPROVEMENTS
${results.improvements}

## TESTS
${results.tests}

## EVALUATION
${results.evaluation}
    `.trim()

    navigator.clipboard.writeText(fullReport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── No results yet ──
  if (!results) {
    return (
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <div className="card text-center py-20 space-y-6">
          <div className="text-6xl">📭</div>
          <h2 className="text-2xl font-bold text-white">No Results Yet</h2>
          <p className="text-gray-400">
            You haven't analyzed any repository yet.
          </p>
          <button
            onClick={() => navigate('/analyze')}
            className="btn-primary px-8 py-3 inline-flex items-center gap-2"
          >
            🚀 Analyze a Repo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-6 space-y-8">

      {/* ── Toast notifications ── */}
      {exported && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up
                        bg-green-500/20 border border-green-500/30
                        text-green-400 px-6 py-3 rounded-xl font-medium
                        flex items-center gap-2 shadow-lg">
          ✅ Report exported successfully!
        </div>
      )}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up
                        bg-blue-500/20 border border-blue-500/30
                        text-blue-400 px-6 py-3 rounded-xl font-medium
                        flex items-center gap-2 shadow-lg">
          📋 Report copied to clipboard!
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            📊 Analysis Results
          </h1>
          <p className="text-gray-400 mt-1">
            Repository:
            <span className="text-primary font-semibold ml-2">
              {results.repo_name}
            </span>
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/analyze')}
            className="btn-secondary flex items-center gap-2"
          >
            🔍 New Analysis
          </button>
          <button
            onClick={() => navigate('/memory')}
            className="btn-secondary flex items-center gap-2"
          >
            🧠 View Memory
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2 text-green-400"
          >
            📄 Export Report
          </button>
          <button
            onClick={handleCopyAll}
            className="btn-secondary flex items-center gap-2 text-blue-400"
          >
            📋 Copy All
          </button>
        </div>
      </div>

      {/* ── Session Info Bar ── */}
      <div className="flex flex-wrap gap-4 p-4 rounded-xl
                      bg-card border border-border text-sm">
        {[
          { icon: '🔑', label: 'Session',   value: results.session_id      },
          { icon: '📁', label: 'Repo',      value: results.repo_name       },
          { icon: '🔄', label: 'Iteration', value: `#${results.iteration}` },
          { icon: '🤖', label: 'Model',     value: 'gpt-oss-120b'         },
          { icon: '⚡', label: 'Engine',    value: 'Groq + LangGraph'      },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span>{item.icon}</span>
            <span className="text-gray-500">{item.label}:</span>
            <span className="text-primary font-medium">{item.value}</span>
          </div>
        ))}
      </div>

      {/* ── Score Card ── */}
      <ScoreCard scores={results.scores} repoName={results.repo_name} />

      {/* ── Tabs ── */}
      <div className="space-y-0">
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium
                          border-b-2 transition-all duration-200 whitespace-nowrap
                          ${activeTab === tab.key
                            ? `border-primary ${tab.color} bg-primary/5`
                            : 'border-transparent text-gray-400 hover:text-white'
                          }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.key && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pt-6">
          <ResultsPanel results={results} activeTab={activeTab} />
        </div>
      </div>

      {/* ── Feedback Box ── */}
      {results.feedback && (
        <div className="card border-primary/30 bg-primary/5 space-y-3">
          <h3 className="font-bold text-primary flex items-center gap-2">
            🔄 Self-Improvement Feedback
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {results.feedback}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>💾</span>
            <span>
              Stored in ChromaDB — agents will use this to improve next analysis
            </span>
          </div>
        </div>
      )}

      {/* ── Agent Chat ── */}
      <AgentChat results={results} />

      {/* ── Bottom Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon:   '🔍',
            title:  'Analyze Another Repo',
            desc:   'Run a new analysis on a different repository',
            action: () => navigate('/analyze'),
            color:  'border-primary/20 hover:border-primary/50',
          },
          {
            icon:   '🧠',
            title:  'View Memory',
            desc:   'See all past sessions and improvement history',
            action: () => navigate('/memory'),
            color:  'border-secondary/20 hover:border-secondary/50',
          },
          {
            icon:   'ℹ️',
            title:  'How It Works',
            desc:   'Learn about the multi-agent architecture',
            action: () => navigate('/about'),
            color:  'border-accent/20 hover:border-accent/50',
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`card ${card.color} transition-all duration-300
                        hover:shadow-lg space-y-3`}
          >
            <div className="text-3xl">{card.icon}</div>
            <h3 className="font-bold text-white">{card.title}</h3>
            <p className="text-sm text-gray-400">{card.desc}</p>
            <button
              onClick={card.action}
              className="btn-secondary text-sm w-full"
            >
              {card.title.split(' ')[0]} →
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}