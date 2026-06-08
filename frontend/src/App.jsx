import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Results from './pages/Results'
import Memory from './pages/Memory'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import { useState } from 'react'

export default function App() {
  const [results, setResults] = useState(null)

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyze"   element={<Analyze setResults={setResults} />} />
        <Route path="/results"   element={<Results results={results} />} />
        <Route path="/memory"    element={<Memory />} />
        <Route path="/about"     element={<About />} />
      </Routes>
    </div>
  )
}