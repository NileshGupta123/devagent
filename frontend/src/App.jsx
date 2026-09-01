import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Results from './pages/Results'
import Memory from './pages/Memory'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import { useState } from 'react'

export default function App() {
  const [results, setResults] = useState(null)
  const location              = useLocation()

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PageTransition><Home /></PageTransition>
          } />
          <Route path="/dashboard" element={
            <PageTransition><Dashboard /></PageTransition>
          } />
          <Route path="/analyze" element={
            <PageTransition><Analyze setResults={setResults} /></PageTransition>
          } />
          <Route path="/results" element={
            <PageTransition><Results results={results} /></PageTransition>
          } />
          <Route path="/memory" element={
            <PageTransition><Memory /></PageTransition>
          } />
          <Route path="/about" element={
            <PageTransition><About /></PageTransition>
          } />
          <Route path="*" element={
            <PageTransition><NotFound /></PageTransition>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  )
}