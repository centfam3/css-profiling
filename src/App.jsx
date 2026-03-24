import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import StudentRegistration from './components/StudentRegistration'
import FacultyDashboard from './page/FacultyDashboard'
import StudentDashboard from './page/StudentDashboard'

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (email, password) => {
    // Basic mock login: any email/password works for now
    if (email && password) {
      setIsLoggedIn(true)
      navigate('/dashboard')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    navigate('/login')
  }

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<StudentRegistration />} />
      <Route path="/dashboard" element={isLoggedIn ? <FacultyDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
