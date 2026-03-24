import { useState, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import NotificationDropdown from '../components/admin/NotificationDropdown'
import { MOCK_NOTIFICATIONS, MOCK_STUDENTS, MOCK_EVENTS } from '../constants/mockData'
import StatCard from '../components/admin/StatCard'
import { FaUserGraduate, FaCalendarCheck, FaRunning, FaClock } from 'react-icons/fa'

// Admin Pages
import StudentManagement from './admin/StudentManagement'
import EventManagement from './admin/EventManagement'
import EventAssignment from './admin/EventAssignment'
import EventHandlerView from './admin/EventHandlerView'
import Announcements from './admin/Announcements'
import NotificationsPage from './admin/NotificationsPage'

export default function FacultyDashboard({ onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const pageTitle = useMemo(() => {
    switch (activePage) {
      case 'dashboard': return 'Dashboard Overview'
      case 'students': return 'Student Management'
      case 'events': return 'Event Management'
      case 'assignment': return 'Event Assignment'
      case 'handler-view': return 'Event Handler View'
      case 'announcements': return 'Announcements'
      case 'notifications': return 'Notifications Center'
      default: return 'Faculty Dashboard'
    }
  }, [activePage])

  const stats = [
    { label: 'Total Students', value: MOCK_STUDENTS.length, icon: FaUserGraduate, color: 'blue' },
    { label: 'Total Events', value: MOCK_EVENTS.length, icon: FaCalendarCheck, color: 'indigo' },
    { label: 'Active Participants', value: 42, icon: FaRunning, color: 'green' },
    { label: 'Upcoming Events', value: 3, icon: FaClock, color: 'yellow' },
  ];

  const renderDashboard = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Students</h3>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Student ID</th>
                  <th className="px-6 py-3 font-semibold">Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_STUDENTS.slice(0, 5).map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {student.skills.slice(0, 2).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Upcoming Events</h3>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="p-5 space-y-4">
            {MOCK_EVENTS.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold uppercase">{event.date.split('-')[1]}</span>
                  <span className="text-lg font-bold leading-tight">{event.date.split('-')[2]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">{event.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FaClock className="text-[10px]" /> {event.time} • {event.venue}
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">
                  {event.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard': return renderDashboard()
      case 'students': return <StudentManagement />
      case 'events': return <EventManagement />
      case 'assignment': return <EventAssignment />
      case 'handler-view': return <EventHandlerView />
      case 'announcements': return <Announcements />
      case 'notifications': return <NotificationsPage />
      default: return renderDashboard()
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-orange-50/30">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <div className="relative">
          <Navbar
            title={pageTitle}
            subtitle="A.Y. 2025–2026 • 2nd Semester"
            searchPlaceholder="Search students, events, or announcements..."
            onNotificationClick={() => setIsNotificationOpen(!isNotificationOpen)}
          />
          <NotificationDropdown 
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-[1600px] mx-auto pb-10">
            {renderActivePage()}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
