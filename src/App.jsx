import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import StudentRegistration from './components/StudentRegistration'
import FacultyDashboard from './page/FacultyDashboard'
import StudentDashboard from './page/StudentDashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = (email, password) => {
    if (email && password) {
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<StudentRegistration />} />
        <Route path="/dashboard" element={<FacultyDashboard onLogout={handleLogout} />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
