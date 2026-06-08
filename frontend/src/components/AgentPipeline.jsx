import ReactFlow, { Background, Controls } from 'reactflow'
import 'reactflow/dist/style.css'

// ─────────────────────────────────────────
// Agent Pipeline — React Flow Visualization
// Shows the 4 agents and their connections
// ─────────────────────────────────────────

const statusColors = {
  idle:    '#2a2a4a',
  running: '#f59e0b',
  done:    '#10b981',
  error:   '#ef4444',
}

const statusIcons = {
  idle:    '⏸️',
  running: '⚙️',
  done:    '✅',
  error:   '❌',
}

function AgentNode({ data }) {
  const color = statusColors[data.status] || statusColors.idle

  return (
    <div
      style={{ borderColor: color }}
      className="bg-card border-2 rounded-xl p-4 min-w-[160px] text-center shadow-lg transition-all duration-500"
    >
      <div className="text-2xl mb-1">{data.icon}</div>
      <div className="text-sm font-semibold text-white">{data.label}</div>
      <div className="text-xs text-gray-400 mt-1">{data.description}</div>
      <div
        className="mt-2 text-xs font-medium px-2 py-1 rounded-full inline-block"
        style={{ backgroundColor: `${color}30`, color }}
      >
        {statusIcons[data.status]} {data.status.toUpperCase()}
      </div>
      {data.score > 0 && (
        <div className="mt-1 text-xs text-primary font-bold">
          +{data.score} pts
        </div>
      )}
    </div>
  )
}

const nodeTypes = { agentNode: AgentNode }

export default function AgentPipeline({ agentStatus, loading, results }) {

  const nodes = [
    {
      id: '1',
      type: 'agentNode',
      position: { x: 50,  y: 100 },
      data: {
        label:       'Analyzer Agent',
        icon:        '🔍',
        description: 'Bug & issue detection',
        status:      agentStatus.analyzer,
        score:       results?.scores?.analyzer || 0,
      },
    },
    {
      id: '2',
      type: 'agentNode',
      position: { x: 280, y: 100 },
      data: {
        label:       'Improvement Agent',
        icon:        '🛠️',
        description: 'Refactor & optimize',
        status:      agentStatus.improver,
        score:       results?.scores?.improver || 0,
      },
    },
    {
      id: '3',
      type: 'agentNode',
      position: { x: 510, y: 100 },
      data: {
        label:       'Test Agent',
        icon:        '🧪',
        description: 'Generate unit tests',
        status:      agentStatus.tester,
        score:       results?.scores?.tester || 0,
      },
    },
    {
      id: '4',
      type: 'agentNode',
      position: { x: 740, y: 100 },
      data: {
        label:       'Evaluator Agent',
        icon:        '📊',
        description: 'Score & feedback',
        status:      agentStatus.evaluator,
        score:       results?.scores?.evaluator || 0,
      },
    },
    {
      id: '5',
      type: 'default',
      position: { x: 395, y: 260 },
      data: { label: '🧠 ChromaDB Memory' },
      style: {
        background:   '#1a1a2e',
        border:       '1px solid #6366f1',
        borderRadius: '8px',
        color:        '#a5b4fc',
        fontSize:     '12px',
        padding:      '8px 16px',
      },
    },
  ]

  const edges = [
    { id: 'e1-2', source: '1', target: '2', animated: loading, style: { stroke: '#6366f1' } },
    { id: 'e2-3', source: '2', target: '3', animated: loading, style: { stroke: '#6366f1' } },
    { id: 'e3-4', source: '3', target: '4', animated: loading, style: { stroke: '#6366f1' } },
    { id: 'e4-5', source: '4', target: '5', animated: loading, style: { stroke: '#8b5cf6', strokeDasharray: '5,5' } },
    { id: 'e5-1', source: '5', target: '1', animated: loading, style: { stroke: '#8b5cf6', strokeDasharray: '5,5' } },
  ]

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">
          🔄 Agent Pipeline
        </h3>
        <span className="text-xs text-gray-500">
          Powered by LangGraph
        </span>
      </div>

      <div style={{ height: '320px' }} className="rounded-lg overflow-hidden border border-border">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#2a2a4a" gap={16} />
          <Controls
            style={{
              background: '#1a1a2e',
              border:     '1px solid #2a2a4a',
            }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}