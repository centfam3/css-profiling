import { useState, useEffect, useRef } from 'react'
import { FaBell, FaUserCircle } from 'react-icons/fa'
import { MdSearch, MdLogout } from 'react-icons/md'

export default function StudentNavbar({ onLogout, notifications = [], unreadCount = 0, onProfileOpen = () => {}, user }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const notificationRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <div className="h-16 bg-white border-b border-orange-100 px-6 flex items-center justify-between shadow-sm">
        {/* Left Section */}
        <div className="flex-1">
          <p className="text-base font-bold text-black">Student Dashboard</p>
          <p className="text-xs text-gray-400 mt-0.5">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-8">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 w-52 transition-all duration-200 focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]">
            <MdSearch className="text-gray-300 text-base" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-xs text-black placeholder-gray-300 w-full"
            />
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 cursor-pointer"
            >
              <FaBell className="text-gray-500 text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-white font-semibold flex justify-between items-center">
                  <span>Notifications</span>
                  <span className="text-sm">{notifications.length}</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="border-b border-gray-100 px-4 py-3 hover:bg-orange-50 cursor-pointer transition">
                        <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                onProfileOpen();
                setIsProfileOpen(false);
              }}
              className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-all duration-300 text-white overflow-hidden shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-105 active:scale-95 group"
            >
              {user?.photo ? (
                <img 
                  src={`http://localhost:5000/uploads/${user.photo}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                />
              ) : (
                <FaUserCircle className="text-xl transition-transform group-hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
