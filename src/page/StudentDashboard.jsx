import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentSidebar from '../components/StudentSidebar'
import StudentNavbar from '../components/StudentNavbar'
import Footer from '../components/Footer'
import ProfileModal from '../components/ProfileModal'
import MyAchievements from '../components/MyAchievements'
import EventParticipation from '../components/EventParticipation'
import StudentAnnouncements from '../components/StudentAnnouncements'
import UpcomingEvents from '../components/UpcomingEvents';
import { FaGraduationCap, FaTrophy, FaCalendarAlt, FaBullhorn, FaClock, FaMapPin, FaUser } from 'react-icons/fa'

const mockNotifications = [
  { id: 1, message: 'Your achievement "Dean\'s List" has been approved', timestamp: '2 hours ago' },
  { id: 2, message: 'New announcement: Mid-year break schedule released', timestamp: '4 hours ago' },
  { id: 3, message: 'Reminder: Enrollment deadline is tomorrow', timestamp: '1 day ago' },
]

export default function StudentDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activePage, setActivePage] = useState('home')
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <DashboardHome student={user} onViewProfile={() => setIsProfileModalOpen(true)} />
      case 'achievements':
      case 'achievements-academic':
      case 'achievements-sports':
        return <MyAchievements student={user} />
      case 'events':
      case 'events-available':
      case 'events-assigned':
        return <EventParticipation student={user} />
      case 'announcements':
        return <StudentAnnouncements />
      default:
        return <DashboardHome student={user} onViewProfile={() => setIsProfileModalOpen(true)} />
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
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <StudentNavbar
          notifications={mockNotifications}
          unreadCount={3}
          user={user}
          onProfileOpen={() => setIsProfileModalOpen(true)}
          onLogout={onLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
        <Footer />
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={user}
      />
    </div>
  )
}

function DashboardHome({ student, onViewProfile }) {
  // Get student's actual data, with fallback values
  const firstName = student?.firstName || 'Student';
  const gradeLevelData = student?.academicHistory?.[0];
  const gpaData = gradeLevelData?.gpa || 'N/A';
  const yearLevel = student?.personalInfo?.yearLevel || 'N/A';

  const studentStats = [
    {
      title: 'Latest GPA',
      count: gpaData,
      icon: <FaGraduationCap className="text-2xl text-blue-500" />,
      color: 'bg-blue-50',
      link: 'achievements',
    },
    {
      title: 'Skills',
      count: student?.skills?.length || 0,
      icon: <FaTrophy className="text-2xl text-yellow-500" />,
      color: 'bg-yellow-50',
      link: 'achievements',
    },
    {
      title: 'Activities',
      count: student?.nonAcademicActivities?.length || 0,
      icon: <FaClock className="text-2xl text-green-500" />,
      color: 'bg-green-50',
      link: 'events',
    },
    {
      title: 'Year Level',
      count: yearLevel,
      icon: <FaCalendarAlt className="text-2xl text-purple-500" />,
      color: 'bg-purple-50',
      link: 'announcements',
    },
  ]

  return (
    <div>
      <section className="mb-8 flex justify-between items-start">
        <div className="cursor-pointer" onClick={onViewProfile}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back, {firstName}! 👋</h1>
          <p className="text-gray-600">Student ID: <span className="font-semibold">{student?.id}</span> • Course: <span className="font-semibold text-indigo-600">{student?.personalInfo?.course === 'IT' ? 'IT' : 'CS'}</span> • Year Level: <span className="font-semibold text-purple-600">{student?.personalInfo?.yearLevel || 'N/A'}</span></p>
        </div>
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

        {/* Upcoming Events Section */}
        <section className="mb-8">
          <UpcomingEvents />
        </section>

        {/* Quick Overview Sections */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Email</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{student?.personalInfo?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Gender</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{student?.personalInfo?.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Contact</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{student?.personalInfo?.contact || 'N/A'}</p>
                </div>
              </div>
            </div>

          {/* Skills List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills</h3>
            <div className="space-y-2">
              {student?.skills && student.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold border border-indigo-100">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No skills added yet</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      {student?.nonAcademicActivities && student.nonAcademicActivities.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Activities</h2>
          <div className="space-y-3">
            {student.nonAcademicActivities.map((activity, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{activity.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Role: {activity.role} • Year: {activity.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-8 text-center">
        <p className="text-gray-700 mb-4">You can view your full profile by clicking on your name and student ID above.</p>
      </section>
    </div>
  )
}
