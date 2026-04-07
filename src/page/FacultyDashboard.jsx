import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import NotificationDropdown from '../components/admin/NotificationDropdown'
import StatCard from '../components/admin/StatCard'
import { FaUserGraduate, FaCalendarCheck, FaRunning, FaClock, FaLaptopCode, FaBookOpen } from 'react-icons/fa'

// Admin Pages
import StudentManagement from './admin/StudentManagement'
import EventManagement from './admin/EventManagement'
import EventAssignment from './admin/EventAssignment'
import EventHandlerView from './admin/EventHandlerView'
import Announcements from './admin/Announcements'
import NotificationsPage from './admin/NotificationsPage'
import Reports from './admin/Reports'
import StudentDetails from './admin/StudentDetails'
import UpcomingEvents from '../components/UpcomingEvents';

export default function FacultyDashboard({ user, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Derive activePage from location
  const activePage = useMemo(() => {
    const path = location.pathname.split('/').pop()
    return path === 'dashboard' ? 'dashboard' : path
  }, [location.pathname])

  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [students, setStudents] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, eventsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/students'),
          axios.get('http://localhost:5000/api/events')
        ]);
        setStudents(studentsRes.data)
        setEvents(eventsRes.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setStudents([])
        setEvents([])
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
      case 'reports': return 'Reports Summary'
      default: return 'Faculty Dashboard'
    }
  }, [activePage])

  const stats = useMemo(() => {
    const now = new Date();

    const upcomingOrOngoingEvents = events.filter(event => {
      const now = new Date();
      const endDate = event.endDate && event.endTime ? new Date(`${event.endDate}T${event.endTime}`) : new Date(`${event.date}T${event.time}`);
      return endDate >= now;
    });

    const activeParticipantIds = new Set();
    upcomingOrOngoingEvents.forEach(event => {
      if (event.participants) {
        event.participants.forEach(id => activeParticipantIds.add(id));
      }
    });

    return [
      { label: 'Total Students', value: students.length, icon: FaUserGraduate, color: 'blue', to: '/dashboard/students' },
      { label: 'Active Participants', value: activeParticipantIds.size, icon: FaRunning, color: 'green', to: '/dashboard/events' },
    ];
  }, [students, events]);

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
            <button 
              onClick={() => navigate('/dashboard/students')}
              className="text-indigo-600 text-sm font-semibold hover:underline cursor-pointer"
            >
              View All
            </button>
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
                {students.slice(0, 5).map((student) => (
                  <tr 
                    key={student.id} 
                    onClick={() => navigate(`/dashboard/users/${student.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {student.firstName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{student.firstName} {student.lastName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <FaLaptopCode size={10} /> {student.personalInfo?.course}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <FaBookOpen size={10} /> {student.personalInfo?.yearLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {student.skills?.slice(0, 2).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-semibold">
                            {skill}
                          </span>
                        ))}
                        {student.skills?.length > 2 && (
                          <span className="text-[10px] text-gray-400 font-bold">+{student.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Events List */}
        <UpcomingEvents onViewAll={() => navigate('/dashboard/events')} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-orange-50/30">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        activePage={activePage}
        onLogout={onLogout}
        user={user}
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
            user={user}
            onLogout={onLogout}
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
            <Routes>
              <Route path="/" element={renderDashboard()} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/events" element={<EventManagement />} />
              <Route path="/assignment" element={<EventAssignment />} />
              <Route path="/handler-view" element={<EventHandlerView />} />
              <Route path="/announcements" element={<Announcements />} />
               <Route path="/notifications" element={<NotificationsPage />} />
               <Route path="/reports" element={<Reports />} />
               <Route path="/users/:id" element={<StudentDetails />} />
               {/* Redirect any other dashboard sub-routes to main dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
