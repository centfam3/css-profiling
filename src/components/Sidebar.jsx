import { useState } from 'react'
import { FaUsers, FaCalendarAlt, FaClipboardList, FaEye, FaBullhorn, FaBell } from 'react-icons/fa'
import { MdLogout, MdDashboard, MdPeople, MdMenuBook, MdCalendarToday, MdBarChart, MdCheckCircle, MdAssignment, MdChat, MdAccountCircle, MdSettings } from 'react-icons/md'
import { HiMenuAlt2 } from 'react-icons/hi'

const navItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard Overview', icon: <MdDashboard />, page: 'dashboard' },
      { label: 'Student Management', icon: <FaUsers />, page: 'students' },
      { label: 'Event Management', icon: <FaCalendarAlt />, page: 'events' },
      { label: 'Event Assignment', icon: <FaClipboardList />, page: 'assignment' },
      { label: 'Event Handler View', icon: <FaEye />, page: 'handler-view' },
      { label: 'Announcements', icon: <FaBullhorn />, page: 'announcements' },
    ],
  },
  {
    section: 'Academic',
    items: [
      { label: 'My Subjects', icon: <MdMenuBook />, page: 'subjects' },
      { label: 'Grades', icon: <MdBarChart />, page: 'grades' },
      { label: 'Attendance', icon: <MdCheckCircle />, page: 'attendance' },
      { label: 'Enrollment', icon: <MdAssignment />, page: 'enrollment' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Messages', icon: <MdChat />, page: 'messages' },
      { label: 'Notifications', icon: <FaBell />, page: 'notifications' },
    ],
  },
  {
    section: 'Other',
    items: [
      { label: 'Settings', icon: <MdSettings />, page: 'settings' },
    ],
  },
]

export default function Sidebar({ isCollapsed: externalIsCollapsed, onToggle, activePage, onNavigate, onLogout }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalCollapsed(!internalCollapsed)
    }
  }

  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page)
    }
  }

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-orange-100 flex flex-col transition-all duration-300 overflow-hidden shadow-sm`}>
      {/* Header */}
      <div className="h-16 border-b border-orange-100 flex items-center justify-between px-3 py-3">
        <div className={`flex items-center gap-2.5 ${isCollapsed ? 'hidden' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            PS
          </div>
          <div>
            <p className="text-sm font-bold text-black">ProfilingSystem</p>
            <p className="text-xs text-gray-500">Faculty Panel</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className="p-1.5 text-gray-400 hover:text-black hover:bg-orange-50 rounded-lg transition-all duration-200"
        >
          <HiMenuAlt2 size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-3">
        {navItems.map((section, idx) => (
          <div key={section.section}>
            {!isCollapsed && (
              <p className="px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-semibold text-gray-400">
                {section.section}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activePage === item.page
                return (
                  <button
                    key={item.page}
                    onClick={() => handleNavigate(item.page)}
                    className={`w-full flex items-center gap-3 mx-2 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-orange-500 text-white font-semibold shadow-sm'
                        : 'text-gray-600 font-normal hover:bg-orange-50 hover:text-black'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-base transition-all ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2 flex-1">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`ml-auto text-[10px] font-bold rounded-full px-2 py-0.5 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-orange-100 text-black'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            {idx < navItems.length - 1 && !isCollapsed && (
              <div className="mx-3 my-2 border-t border-orange-100"></div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="bg-orange-50 border-t border-orange-100 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 relative">
            MR
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border-2 border-white"></span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-xs font-semibold text-black">Mr. Reyes</p>
              <p className="text-xs text-gray-500">Faculty</p>
            </div>
          )}
          {!isCollapsed && (
            <button 
              onClick={onLogout}
              className="ml-auto text-gray-300 hover:text-black transition-colors cursor-pointer text-base"
            >
              <MdLogout size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
