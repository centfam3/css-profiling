import { useState } from 'react'
import { HiMenuAlt2 } from 'react-icons/hi'
import { FaHome, FaTrophy, FaCalendarAlt, FaBullhorn, FaSignOutAlt, FaChevronDown, FaGraduationCap, FaRunning } from 'react-icons/fa'

const studentNavItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard Home', icon: <FaHome />, page: 'home' },
    ],
  },
  {
    section: 'Academic',
    items: [
      {
        label: 'My Achievements',
        icon: <FaTrophy />,
        page: 'achievements',
        subItems: [
          { label: 'Academic Achievements', icon: <FaGraduationCap />, page: 'achievements-academic' },
          { label: 'Sports Achievements', icon: <FaRunning />, page: 'achievements-sports' },
        ],
      },
      {
        label: 'Event Participation',
        icon: <FaCalendarAlt />,
        page: 'events',
        subItems: [
          { label: 'Available Events', icon: null, page: 'events-available' },
          { label: 'Assigned Events', icon: null, page: 'events-assigned' },
        ],
      },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Announcements', icon: <FaBullhorn />, page: 'announcements' },
    ],
  },
]

export default function StudentSidebar({ isCollapsed: externalIsCollapsed, onToggle, activePage, onNavigate, onLogout }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState({})
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

  const toggleExpand = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }))
  }

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-orange-100 flex flex-col transition-all duration-300 overflow-hidden shadow-sm`}>
      {/* Header */}
      <div className="h-16 border-b border-orange-100 flex items-center justify-between px-3 py-3">
        <div className={`flex items-center gap-2.5 ${isCollapsed ? 'hidden' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            ST
          </div>
          <div>
            <p className="text-sm font-bold text-black">Student Portal</p>
            <p className="text-xs text-gray-500">Your Dashboard</p>
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
        {studentNavItems.map((section) => (
          <div key={section.section}>
            {!isCollapsed && (
              <p className="px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-semibold text-gray-400">
                {section.section}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activePage === item.page
                const isExpanded = expandedItems[item.label]

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => {
                        if (item.subItems) {
                          toggleExpand(item.label)
                        } else {
                          handleNavigate(item.page)
                        }
                      }}
                      className={`w-full mx-3 px-3 py-2 rounded-lg flex items-center justify-between transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-100 text-orange-600 font-semibold'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        {!isCollapsed && <span className="text-sm">{item.label}</span>}
                      </div>
                      {item.subItems && !isCollapsed && (
                        <FaChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {/* Sub Items */}
                    {item.subItems && isExpanded && !isCollapsed && (
                      <div className="ml-3 mt-1 space-y-0.5">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.page}
                            onClick={() => handleNavigate(subItem.page)}
                            className={`w-full mx-3 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ${
                              activePage === subItem.page
                                ? 'bg-orange-100 text-orange-600 font-semibold'
                                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                            }`}
                          >
                            {subItem.icon && <span>{subItem.icon}</span>}
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-orange-100 p-3">
        <button 
          onClick={onLogout}
          className="w-full mx-0 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer"
        >
          <FaSignOutAlt size={14} />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  )
}