import { useState } from 'react'

// ─────────────────────────────────────────
// CodeDiff — Before/After code comparison
// Shows original vs improved code
// ─────────────────────────────────────────

function DiffLine({ line, type }) {
  const styles = {
    added:   'bg-green-500/10 text-green-300 border-l-2 border-green-500',
    removed: 'bg-red-500/10   text-red-300   border-l-2 border-red-500',
    normal:  'text-gray-400',
  }

  const prefix = {
    added:   '+',
    removed: '-',
    normal:  ' ',
  }

  return (
    <div className={`px-4 py-0.5 font-mono text-xs ${styles[type]}`}>
      <span className="select-none mr-3 opacity-50">{prefix[type]}</span>
      {line}
    </div>
  )
}


function parseDiff(before, after) {
  if (!before || !after) return []

  const beforeLines = before.split('\n')
  const afterLines  = after.split('\n')
  const result      = []

  const maxLen = Math.max(beforeLines.length, afterLines.length)

  for (let i = 0; i < maxLen; i++) {
    const bLine = beforeLines[i]
    const aLine = afterLines[i]

    if (bLine === aLine) {
      result.push({ line: bLine || '', type: 'normal' })
    } else {
      if (bLine !== undefined) result.push({ line: bLine, type: 'removed' })
      if (aLine !== undefined) result.push({ line: aLine, type: 'added'   })
    }
  }

  return result
}


export default function CodeDiff({ beforeCode, afterCode, filename }) {
  const [view, setView] = useState('diff') // diff | before | after

  const diffLines = parseDiff(beforeCode, afterCode)

  const addedCount   = diffLines.filter(l => l.type === 'added').length
  const removedCount = diffLines.filter(l => l.type === 'removed').length

  if (!beforeCode && !afterCode) {
    return (
      <div className="card text-center py-8 text-gray-500">
        <p>No code diff available</p>
      </div>
    )
  }

  return (
    <div className="card space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-300">
            📄 {filename || 'code.py'}
          </span>
          <span className="badge badge-green">+{addedCount}</span>
          <span className="badge badge-red">-{removedCount}</span>
        </div>

        {/* View toggle */}
        <div className="flex bg-black/30 rounded-lg p-1 gap-1">
          {['diff', 'before', 'after'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                view === v
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {v === 'diff'   && '⚡ Diff'}
              {v === 'before' && '📌 Before'}
              {v === 'after'  && '✅ After'}
            </button>
          ))}
        </div>
      </div>

      {/* Code view */}
      <div className="bg-black/50 border border-border rounded-lg overflow-auto max-h-96">
        {view === 'diff' && (
          <div>
            {diffLines.map((item, i) => (
              <DiffLine key={i} line={item.line} type={item.type} />
            ))}
          </div>
        )}

        {view === 'before' && (
          <pre className="p-4 text-xs text-red-300 font-mono whitespace-pre-wrap">
            {beforeCode}
          </pre>
        )}

        {view === 'after' && (
          <pre className="p-4 text-xs text-green-300 font-mono whitespace-pre-wrap">
            {afterCode}
          </pre>
        )}
      </div>

      {/* Copy buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => navigator.clipboard.writeText(afterCode || '')}
          className="btn-secondary text-xs"
        >
          📋 Copy Improved Code
        </button>
      </div>

    </div>
  )
}