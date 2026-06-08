// ─────────────────────────────────────────
// ResultsPanel — Shows agent outputs
// with severity badges
// ─────────────────────────────────────────

const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/30',
  HIGH:     'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  MEDIUM:   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  LOW:      'bg-blue-500/20 text-blue-400 border border-blue-500/30',
}

const SEVERITY_ICONS = {
  CRITICAL: '🔴',
  HIGH:     '🟠',
  MEDIUM:   '🟡',
  LOW:      '🔵',
}

function SeverityBadge({ level }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${SEVERITY_COLORS[level] || ''}`}>
      {SEVERITY_ICONS[level]} {level}
    </span>
  )
}

function parseSeverityLine(line) {
  const match = line.match(/\[(CRITICAL|HIGH|MEDIUM|LOW)\]/i)
  if (match) {
    const level   = match[1].toUpperCase()
    const content = line.replace(/\[(CRITICAL|HIGH|MEDIUM|LOW)\]/i, '').trim()
    return { level, content }
  }
  return null
}

function countSeverities(content) {
  if (!content) return {}
  return {
    CRITICAL: (content.match(/\[CRITICAL\]/gi) || []).length,
    HIGH:     (content.match(/\[HIGH\]/gi)     || []).length,
    MEDIUM:   (content.match(/\[MEDIUM\]/gi)   || []).length,
    LOW:      (content.match(/\[LOW\]/gi)      || []).length,
  }
}

function AnalysisContent({ content }) {
  if (!content) return <div className="text-gray-500">No content available.</div>

  const lines    = content.split('\n')
  const counts   = countSeverities(content)
  const total    = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">

      {/* Severity summary bar */}
      {total > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-black/30 rounded-xl border border-border">
          <span className="text-xs text-gray-400 w-full mb-1 font-medium">
            📊 {total} issues found:
          </span>
          {Object.entries(counts).map(([level, count]) =>
            count > 0 ? (
              <div key={level}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                            ${SEVERITY_COLORS[level]}`}>
                {SEVERITY_ICONS[level]} {level}: {count}
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Content lines */}
      <div className="space-y-1">
        {lines.map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-2" />

          // Section headers
          if (line.startsWith('##')) {
            return (
              <div key={i} className="text-primary font-bold text-sm pt-3 pb-1">
                {line.replace('##', '').trim()}
              </div>
            )
          }

          // Severity lines
          const parsed = parseSeverityLine(line)
          if (parsed) {
            return (
              <div key={i}
                className={`flex items-start gap-3 p-3 rounded-lg
                            ${SEVERITY_COLORS[parsed.level]} animate-fade-in`}>
                <SeverityBadge level={parsed.level} />
                <span className="text-sm text-gray-200 flex-1">{parsed.content}</span>
              </div>
            )
          }

          // Normal lines
          return (
            <div key={i} className="text-sm text-gray-400 px-2 leading-relaxed">
              {line}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CodeContent({ content }) {
  if (!content) return <div className="text-gray-500">No content available.</div>
  return (
    <div className="code-block text-xs leading-relaxed">
      {content}
    </div>
  )
}

export default function ResultsPanel({ results, activeTab }) {
  const tabContent = {
    analysis: {
      title:   '🔍 Code Analysis Report',
      content: results?.analysis,
      badge:   'badge-red',
      label:   'Bugs & Issues Found',
      type:    'analysis',
    },
    improvements: {
      title:   '🛠️ Improvement Suggestions',
      content: results?.improvements,
      badge:   'badge-blue',
      label:   'Fixes & Refactors',
      type:    'code',
    },
    tests: {
      title:   '🧪 Generated Test Cases',
      content: results?.tests,
      badge:   'badge-green',
      label:   'Unit Tests Generated',
      type:    'code',
    },
    evaluation: {
      title:   '📊 Quality Evaluation',
      content: results?.evaluation,
      badge:   'badge-purple',
      label:   'Evaluation Report',
      type:    'analysis',
    },
  }

  const current = tabContent[activeTab]
  if (!current) return null

  return (
    <div className="card animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold text-white">{current.title}</h3>
        <div className="flex items-center gap-3">
          <span className={`badge ${current.badge}`}>{current.label}</span>
          <button
            onClick={() => navigator.clipboard.writeText(current.content || '')}
            className="btn-secondary text-xs flex items-center gap-1"
          >
            📋 Copy
          </button>
        </div>
      </div>

      {/* Session info */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span>🔑 Session: <span className="text-primary">{results?.session_id}</span></span>
        <span>📁 Repo: <span className="text-primary">{results?.repo_name}</span></span>
        <span>🔄 Iteration: <span className="text-primary">#{results?.iteration}</span></span>
      </div>

      {/* Content */}
      {current.type === 'analysis'
        ? <AnalysisContent content={current.content} />
        : <CodeContent    content={current.content} />
      }

      {/* Feedback — evaluation tab only */}
      {activeTab === 'evaluation' && results?.feedback && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 space-y-2">
          <h4 className="text-sm font-semibold text-primary">
            🔄 Self-Improvement Feedback
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed">{results.feedback}</p>
          <p className="text-xs text-gray-500">
            💡 Stored in ChromaDB — improves future analyses
          </p>
        </div>
      )}

    </div>
  )
}