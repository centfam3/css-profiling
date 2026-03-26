import { useState } from 'react'
import { FaTimes, FaUpload, FaEdit } from 'react-icons/fa'

export default function ProfileModal({ isOpen, onClose, student }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(student)
  const [skillsInput, setSkillsInput] = useState(student?.skills?.join(', ') || '')
  const [hobbiesInput, setHobbiesInput] = useState(student?.hobbies?.join(', ') || '')
  const [academicInput, setAcademicInput] = useState(student?.academicHistory?.map(h => `${h.year} ${h.gradeLevel} ${h.gpa}`).join(', ') || '')
  const [sportsInput, setSportsInput] = useState(student?.achievements?.sports?.join(', ') || '')

  if (!isOpen || !student) return null

  const handleSave = () => {
    // In a real app, this would be an API call
    setProfile({
      ...profile,
      skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      hobbies: hobbiesInput.split(',').map((h) => h.trim()).filter(Boolean),
    })
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
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
            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4 text-orange-500 text-4xl font-bold">
              {student.firstName[0]}{student.lastName[0]}
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
                {student.id}
              </p>
            </div>

            {/* Latest Year Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Grade Level
              </label>
              <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                {student.academicHistory[0]?.gradeLevel || 'N/A'}
              </p>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                  {student.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                  {student.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.personalInfo.email}
                  onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, email: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                  {student.personalInfo.email}
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
                  value={profile.personalInfo.contact}
                  onChange={(e) => setProfile({ ...profile, personalInfo: { ...profile.personalInfo, contact: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                  {student.personalInfo.contact}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Gender
              </label>
              <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2 rounded-lg">
                {student.personalInfo.gender}
              </p>
            </div>
          </div>

          {/* Academic History */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Academic Performance</h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2">Year</th>
                    <th className="px-4 py-2">Grade</th>
                    <th className="px-4 py-2">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {student.academicHistory.map((item, idx) => (
                    <tr key={idx} className="text-xs text-gray-600">
                      <td className="px-4 py-2 font-medium">{item.year}</td>
                      <td className="px-4 py-2">{item.gradeLevel}</td>
                      <td className="px-4 py-2 text-orange-600 font-bold">{item.gpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Skills & Hobbies */}
          <div className="border-t pt-4 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">My Skills</label>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Hobbies</label>
              <div className="flex flex-wrap gap-2">
                {student.hobbies?.map((hobby) => (
                  <span key={hobby} className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold border border-orange-100">
                    {hobby}
                  </span>
                )) || <span className="text-xs text-gray-400 italic">No hobbies listed</span>}
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="border-t pt-4">
            <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Medical Information</label>
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs text-red-700 leading-relaxed font-semibold">
                {student.violations.some(v => v.severity === 'Severe') ? '⚠️ Severe Violation Record' : 'Medical Record: ' + (student.medicalInfo || 'No issues reported.')}
              </p>
            </div>
          </div>

          {/* Document Upload */}
          <div className="border-t pt-4">
            <label className="block text-sm font-bold text-gray-800 mb-3">My Certificates</label>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center gap-2">
                <FaUpload /> Upload New
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition text-sm"
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
