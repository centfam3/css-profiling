import { useState } from 'react'
import { FaTimes, FaUpload, FaEdit } from 'react-icons/fa'

const mockStudentProfile = {
  studentId: 'ST-2024-001',
  fullName: 'John Michael Doe',
  email: 'john.doe@student.edu',
  phoneNumber: '+63 917 1234567',
  guardianName: 'Maria Doe',
  guardianContact: '+63 917 9876543',
  hobbies: ['Reading', 'Basketball', 'Photography', 'Coding'],
  medicalInfo: 'Blood Type: O+, No known allergies, Asthmatic (requires inhaler)',
  course: 'BS Information Technology',
  year: 'Third Year',
  section: 'A',
}

export default function ProfileModal({ isOpen, onClose }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(mockStudentProfile)
  const [hobbiesInput, setHobbiesInput] = useState(profile.hobbies.join(', '))

  if (!isOpen) return null

  const handleSave = () => {
    setProfile({
      ...profile,
      hobbies: hobbiesInput.split(',').map((h) => h.trim().filter(Boolean)),
    })
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center sticky top-0">
          <h2 className="text-2xl font-bold text-white">Student Profile</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 p-2 rounded-lg transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Photo */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4 text-orange-500 text-4xl">
              JD
            </div>
            {isEditing && (
              <label className="cursor-pointer">
                <input type="file" className="hidden" accept="image/*" />
                <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition inline-flex items-center gap-2">
                  <FaUpload /> Upload Photo
                </span>
              </label>
            )}
          </div>

          {/* Info Sections */}
          <div className="grid grid-cols-2 gap-6">
            {/* Student ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Student ID
              </label>
              <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                {profile.studentId}
              </p>
            </div>

            {/* Course */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Course
              </label>
              <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                {profile.course}
              </p>
            </div>

            {/* Full Name */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                  {profile.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                  {profile.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                  {profile.phoneNumber}
                </p>
              )}
            </div>

            {/* Year & Section */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Year / Section
              </label>
              <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                {profile.year} - {profile.section}
              </p>
            </div>
          </div>

          {/* Guardian Info */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Guardian / Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Guardian Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.guardianName}
                    onChange={(e) => setProfile({ ...profile, guardianName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">{profile.guardianName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Guardian Contact</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.guardianContact}
                    onChange={(e) => setProfile({ ...profile, guardianContact: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">{profile.guardianContact}</p>
                )}
              </div>
            </div>
          </div>

          {/* Hobbies */}
          <div className="border-t pt-4">
            <label className="block text-sm font-bold text-gray-800 mb-3">Hobbies</label>
            {isEditing ? (
              <textarea
                value={hobbiesInput}
                onChange={(e) => setHobbiesInput(e.target.value)}
                placeholder="Separate hobbies with commas"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-20"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby) => (
                  <span key={hobby} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {hobby}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Medical Info */}
          <div className="border-t pt-4">
            <label className="block text-sm font-bold text-gray-800 mb-3">Medical Information</label>
            {isEditing ? (
              <textarea
                value={profile.medicalInfo}
                onChange={(e) => setProfile({ ...profile, medicalInfo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
              />
            ) : (
              <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg whitespace-pre-line">
                {profile.medicalInfo}
              </p>
            )}
          </div>

          {/* Document Upload */}
          <div className="border-t pt-4">
            <label className="block text-sm font-bold text-gray-800 mb-3">Certificates & Documents</label>
            <label className="cursor-pointer">
              <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" />
              <span className="px-6 py-3 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-center font-medium hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-2">
                <FaUpload /> Upload Certificates / Documents
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-6 py-3 bg-orange-50 text-orange-600 rounded-lg font-semibold hover:bg-orange-100 transition flex items-center justify-center gap-2"
                >
                  <FaEdit /> Edit Profile
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
