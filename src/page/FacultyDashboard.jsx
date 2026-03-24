import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function FacultyDashboard({ onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-orange-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          title="Faculty Dashboard"
          subtitle="A.Y. 2025–2026 • 2nd Semester"
          searchPlaceholder="Search students, subjects..."
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-orange-100 p-8 text-center">
            <h1 className="text-3xl font-bold text-black mb-4">Welcome to Faculty Dashboard</h1>
            <p className="text-black mb-4">Active Page: <span className="font-semibold text-orange-500">{activePage}</span></p>
            <p className="text-sm text-gray-500">
              {isCollapsed ? 'Sidebar is collapsed' : 'Sidebar is expanded'} — Click the menu button to toggle
            </p>
            <button
              onClick={onLogout}
              className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
