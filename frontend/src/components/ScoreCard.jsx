import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'

// ─────────────────────────────────────────
// ScoreCard — Shows agent scores
// with animated progress bars
// ─────────────────────────────────────────

function ScoreBar({ label, icon, score, maxScore, color }) {
  const percentage = Math.round((score / maxScore) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{score}</span>
          <span className="text-xs text-gray-500">/ {maxScore}</span>
        </div>
      </div>
      <div className="score-bar">
        <div
          className="score-fill"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
    </div>
  )
}

function getVerdict(total) {
  if (total >= 200) return { label: 'EXCELLENT',  color: 'text-green-400',  bg: 'bg-green-500/20',  icon: '🏆' }
  if (total >= 150) return { label: 'GOOD',        color: 'text-blue-400',   bg: 'bg-blue-500/20',   icon: '✅' }
  if (total >= 100) return { label: 'NEEDS WORK',  color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '⚠️' }
  return                    { label: 'POOR',        color: 'text-red-400',    bg: 'bg-red-500/20',    icon: '❌' }
}

export default function ScoreCard({ scores, repoName }) {
  const verdict     = getVerdict(scores?.total || 0)
  const percentage  = Math.round(((scores?.total || 0) / 290) * 100)

  const chartData = [
    { name: 'Score', value: percentage, fill: '#6366f1' },
    { name: 'Rest',  value: 100 - percentage, fill: '#2a2a4a' },
  ]

  const agentScores = [
    { label: 'Analyzer',  icon: '🔍', score: scores?.analyzer  || 0, maxScore: 50,  color: 'linear-gradient(90deg, #6366f1, #8b5cf6)' },
    { label: 'Improver',  icon: '🛠️', score: scores?.improver  || 0, maxScore: 60,  color: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' },
    { label: 'Tester',    icon: '🧪', score: scores?.tester    || 0, maxScore: 80,  color: 'linear-gradient(90deg, #06b6d4, #10b981)' },
    { label: 'Evaluator', icon: '📊', score: scores?.evaluator || 0, maxScore: 100, color: 'linear-gradient(90deg, #10b981, #6366f1)' },
  ]

  return (
    <div className="card animate-slide-up">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">📊 Analysis Score</h3>
          <p className="text-sm text-gray-500 mt-1">
            Repository: <span className="text-primary font-medium">{repoName}</span>
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl ${verdict.bg} flex items-center gap-2`}>
          <span className="text-xl">{verdict.icon}</span>
          <span className={`font-bold text-lg ${verdict.color}`}>
            {scores?.total || 0}/290
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left — Score bars */}
        <div className="space-y-4">
          {agentScores.map((agent) => (
            <ScoreBar key={agent.label} {...agent} />
          ))}
        </div>

        {/* Right — Radial chart */}
        <div className="flex flex-col items-center justify-center gap-4">

          {/* Chart */}
          <div className="relative" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="90%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={8} />
                <Tooltip
                  contentStyle={{
                    background:   '#1a1a2e',
                    border:       '1px solid #2a2a4a',
                    borderRadius: '8px',
                    color:        '#fff',
                  }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${verdict.color}`}>
                {percentage}%
              </span>
              <span className="text-xs text-gray-500 mt-1">Score</span>
            </div>
          </div>

          {/* Verdict */}
          <div className="text-center space-y-1">
            <div className={`text-2xl font-bold ${verdict.color}`}>
              {verdict.icon} {verdict.label}
            </div>
            <div className="text-gray-500 text-sm">Overall Code Quality</div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {agentScores.map((a) => (
              <div key={a.label}
                className="bg-black/30 rounded-lg p-2 text-center border border-border">
                <div className="text-xs text-gray-500">{a.icon} {a.label}</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {a.score}<span className="text-gray-600">/{a.maxScore}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}