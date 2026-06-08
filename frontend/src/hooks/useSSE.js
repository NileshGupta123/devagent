import { useState, useEffect, useRef, useCallback } from 'react'

// ─────────────────────────────────────────
// useSSE Hook — Server-Sent Events
// For real-time agent log streaming
// ─────────────────────────────────────────

export function useSSE(sessionId, enabled = false) {
  const [logs,      setLogs]      = useState([])
  const [connected, setConnected] = useState(false)
  const eventSource               = useRef(null)

  const connect = useCallback(() => {
    if (!sessionId || !enabled) return

    eventSource.current = new EventSource(`/stream/${sessionId}`)

    eventSource.current.onopen = () => setConnected(true)

    eventSource.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLogs(prev => [...prev, {
          ...data,
          timestamp: new Date().toLocaleTimeString(),
          id: Date.now(),
        }])
      } catch {}
    }

    eventSource.current.onerror = () => {
      setConnected(false)
      eventSource.current?.close()
    }

  }, [sessionId, enabled])

  useEffect(() => {
    if (enabled) connect()
    return () => {
      eventSource.current?.close()
      setConnected(false)
    }
  }, [enabled, connect])

  const clearLogs = () => setLogs([])

  return { logs, connected, clearLogs }
}