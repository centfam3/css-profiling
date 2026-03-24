import { useState } from 'react'
import StudentSidebar from '../components/StudentSidebar'
import StudentNavbar from '../components/StudentNavbar'
import Footer from '../components/Footer'
import ProfileModal from '../components/ProfileModal'
import MyAchievements from '../components/MyAchievements'
import EventParticipation from '../components/EventParticipation'
import StudentAnnouncements from '../components/StudentAnnouncements'
import { FaGraduationCap, FaTrophy, FaCalendarAlt, FaBullhorn, FaClock, FaMapPin } from 'react-icons/fa'

const mockNotifications = [
  { id: 1, message: 'Your achievement "Dean\'s List" has been approved', timestamp: '2 hours ago' },
  { id: 2, message: 'New announcement: Mid-year break schedule released', timestamp: '4 hours ago' },
  { id: 3, message: 'Reminder: Enrollment deadline is tomorrow', timestamp: '1 day ago' },
]

export default function StudentDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activePage, setActivePage] = useState('home')
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <DashboardHome />
      case 'achievements':
      case 'achievements-academic':
      case 'achievements-sports':
        return <MyAchievements />
      case 'events':
      case 'events-available':
      case 'events-assigned':
        return <EventParticipation />
      case 'announcements':
        return <StudentAnnouncements />
      default:
        return <DashboardHome />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-orange-50">
      {/* Sidebar */}
      <StudentSidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <StudentNavbar
          notifications={mockNotifications}
          unreadCount={3}
          onProfileOpen={() => setIsProfileModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
        <Footer />
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  )
}

function DashboardHome() {
  const studentStats = [
    {
      title: 'My Achievements',
      count: 7,
      icon: <FaTrophy className="text-2xl text-yellow-500" />,
      color: 'bg-yellow-50',
      link: 'achievements',
    },
    {
      title: 'Pending Approvals',
      count: 2,
      icon: <FaGraduationCap className="text-2xl text-blue-500" />,
      color: 'bg-blue-50',
      link: 'achievements',
    },
    {
      title: 'Upcoming Events',
      count: 4,
      icon: <FaCalendarAlt className="text-2xl text-green-500" />,
      color: 'bg-green-50',
      link: 'events',
    },
    {
      title: 'Recent Announcements',
      count: 5,
      icon: <FaBullhorn className="text-2xl text-orange-500" />,
      color: 'bg-orange-50',
      link: 'announcements',
    },
  ]

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back, John! 👋</h1>
        <p className="text-gray-600">Here's your academic progress and upcoming activities</p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {studentStats.map((stat, idx) => (
          <div key={idx} className={`${stat.color} rounded-xl p-6 border border-gray-200 hover:shadow-md transition`}>
            <div className="flex justify-between items-start mb-3">
              <div className="font-semibold text-gray-700 text-sm">{stat.title}</div>
              {stat.icon}
            </div>
            <p className="text-4xl font-bold text-gray-900">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" /> Latest Achievements
            </h3>
            <div className="space-y-3">
              {[
                { title: "Dean's List Recognition", status: 'approved' },
                { title: 'Programming Competition Winner', status: 'approved' },
                { title: 'Outstanding Thesis Defense', status: 'pending' },
              ].map((achievement, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mt-1.5 ${
                      achievement.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  ></span>
                  <div>
                    <p className="font-medium text-gray-800">{achievement.title}</p>
                    <p className={`text-xs font-semibold uppercase ${achievement.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {achievement.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-green-500" /> Upcoming Events
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Tech Summit 2024', date: 'May 15' },
                { name: 'Science Fair & Exhibition', date: 'May 20' },
                { name: 'Sports Day 2024', date: 'June 1' },
              ].map((event, idx) => (
                <div key={idx} className="flex items-start justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-800">{event.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><FaCalendarAlt className="inline text-green-500" /> {event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Announcements */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Announcements</h2>
        <div className="space-y-3">
          {[
            {
              title: 'Mid-Year Semester Break Schedule',
              date: 'April 5, 2024',
              category: 'Academic',
            },
            {
              title: 'New Library Extended Hours',
              date: 'April 3, 2024',
              category: 'Notice',
            },
          ].map((announcement, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{announcement.title}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><FaCalendarAlt className="inline text-green-500" /> {announcement.date}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {announcement.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
