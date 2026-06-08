import { useState } from 'react'
import axios from 'axios'

// ─────────────────────────────────────────
// useAnalysis Hook
// Handles API call to /analyze endpoint
// ─────────────────────────────────────────

export function useAnalysis() {
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [results,  setResults]  = useState(null)

  const analyze = async (repoUrl, sessionId = null) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await axios.post('/analyze', {
        repo_url:   repoUrl,
        session_id: sessionId,
      }, {
        timeout: 120000, // 2 minutes
      })

      setResults(response.data)
      return response.data

    } catch (err) {
      const message = err.response?.data?.detail || 'Analysis failed'
      setError(message)
      throw new Error(message)

    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setLoading(false)
    setError(null)
    setResults(null)
  }

  return { analyze, loading, error, results, reset }
}