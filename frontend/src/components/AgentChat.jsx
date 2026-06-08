import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

// ─────────────────────────────────────────
// AgentChat — Ask questions about analysis
// Powered by Groq via backend
// ─────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  '🔴 Which bug is most critical?',
  '🔒 How do I fix the security issue?',
  '⚡ What is the biggest performance problem?',
  '🧪 Which function needs tests the most?',
  '🛠️ What should I fix first?',
  '📊 How can I improve the score?',
]

function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 animate-fade-in
                     ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center
                       text-sm shrink-0 mt-1
                       ${isUser
                         ? 'bg-primary/20 border border-primary/30'
                         : 'bg-secondary/20 border border-secondary/30'
                       }`}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                       ${isUser
                         ? 'bg-primary/20 border border-primary/30 text-white rounded-tr-sm'
                         : 'bg-card border border-border text-gray-200 rounded-tl-sm'
                       }`}>
        {message.content}
        <div className="text-xs text-gray-600 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>

    </div>
  )
}

export default function AgentChat({ results }) {
  const [messages,  setMessages]  = useState([
    {
      role:      'assistant',
      content:   `Hi! I've analyzed the **${results?.repo_name}** repository. I can answer questions about the bugs found, security issues, improvements, or test coverage. What would you like to know?`,
      timestamp: Date.now(),
    }
  ])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef               = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const question = text || input.trim()
    if (!question || loading) return

    const userMsg = { role: 'user', content: question, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post('/chat', {
        question,
        context: {
          repo_name:   results?.repo_name,
          analysis:    results?.analysis?.slice(0, 2000),
          improvements:results?.improvements?.slice(0, 1000),
          tests:       results?.tests?.slice(0, 1000),
          evaluation:  results?.evaluation?.slice(0, 1000),
          scores:      results?.scores,
        }
      })

      setMessages(prev => [...prev, {
        role:      'assistant',
        content:   response.data.answer,
        timestamp: Date.now(),
      }])

    } catch (err) {
      setMessages(prev => [...prev, {
        role:      'assistant',
        content:   '❌ Sorry, I could not process that. Please try again.',
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-secondary/30
                          flex items-center justify-center text-xl">
            💬
          </div>
          <div>
            <h3 className="font-bold text-white">Ask the Agent</h3>
            <p className="text-xs text-gray-500">
              Ask anything about the analysis
            </p>
          </div>
        </div>
        <span className="badge badge-green">● Online</span>
      </div>

      {/* Suggested questions */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q.slice(2).trim())}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full border border-border
                       text-gray-400 hover:text-white hover:border-primary/50
                       transition-all duration-200 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-secondary/20 border
                            border-secondary/30 flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="bg-card border border-border rounded-2xl
                            rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 pt-2 border-t border-border">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about bugs, fixes, tests..."
          className="input text-sm"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn-primary px-4 whitespace-nowrap"
        >
          {loading ? '⚙️' : '→'}
        </button>
      </div>

    </div>
  )
}