import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import VoiceSessionPage from './pages/VoiceSessionPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/session" element={<VoiceSessionPage />} />
        {/* Fallback to Dashboard for other routes */}
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </Router>
  )
}

export default App
