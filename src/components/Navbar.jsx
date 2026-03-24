import { useState, useEffect, useRef } from 'react'
import { MdSearch, MdNotificationsNone, MdKeyboardArrowDown, MdPerson, MdSettings, MdHelpOutline, MdLogout } from 'react-icons/md'

export default function Navbar({ title = 'Faculty Dashboard', subtitle = 'A.Y. 2025–2026 • 2nd Semester', searchPlaceholder = 'Search...' }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dropdownItems = [
    { icon: <MdPerson size={16} />, label: 'My Profile', onClick: () => {} },
    { icon: <MdSettings size={16} />, label: 'Settings', onClick: () => {} },
    { icon: <MdHelpOutline size={16} />, label: 'Help & Support', onClick: () => {} },
  ]

  return (
    <div className="h-16 bg-white border-b border-orange-100 px-6 flex items-center justify-between shadow-sm">
      {/* Left Section */}
      <div className="flex-1">
        <p className="text-base font-bold text-black">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 ml-8">
        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 w-52 transition-all duration-200 focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]">
          <MdSearch className="text-gray-300 text-base" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="bg-transparent outline-none text-xs text-black placeholder-gray-300 w-full"
          />
        </div>

        {/* Notification Button */}
        <button className="relative w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 cursor-pointer">
          <MdNotificationsNone className="text-gray-500 text-lg" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-orange-100"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-orange-100 bg-white cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              JD
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-black">John Doe</p>
              <p className="text-[10px] text-gray-400">Faculty</p>
            </div>
            <MdKeyboardArrowDown className={`text-gray-300 text-sm transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-14 right-0 w-56 bg-white rounded-xl border border-orange-100 shadow-xl shadow-orange-100/50 z-50 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-orange-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">John Doe</p>
                    <p className="text-xs text-gray-400">john@example.com</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {dropdownItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-black transition-all cursor-pointer"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-orange-100 my-1"></div>

              {/* Logout */}
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                <MdLogout size={16} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
