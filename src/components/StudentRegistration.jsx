import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdArrowBack } from 'react-icons/md'
import pnclogo from '../assets/pnclogo.png'
import ccslogo from '../assets/ccslogo.png'

export default function StudentRegistration() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    course: '',
    year: '',
    section: '',
    email: '',
    phoneNumber: '',
    guardianName: '',
    guardianContact: '',
    hobbies: '',
    academicAchievements: '',
    sportsAchievements: '',
    medicalRecords: '',
  })

  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required'
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required'
    if (!formData.course.trim()) newErrors.course = 'Course is required'
    if (!formData.year.trim()) newErrors.year = 'Year is required'
    if (!formData.section.trim()) newErrors.section = 'Section is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required'
    if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian Name is required'
    if (!formData.guardianContact.trim()) newErrors.guardianContact = 'Guardian Contact is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      setSubmitted(true)
      console.log('Registration Data:', formData)
      // Here you would typically send the data to a backend server
      alert('Registration submitted successfully!')
      // Reset form after successful submission
      setTimeout(() => {
        setSubmitted(false)
        navigate('/login')
      }, 2000)
    }
  }

  const handleReset = () => {
    setFormData({
      studentId: '',
      fullName: '',
      course: '',
      year: '',
      section: '',
      email: '',
      phoneNumber: '',
      guardianName: '',
      guardianContact: '',
      hobbies: '',
      academicAchievements: '',
      sportsAchievements: '',
      medicalRecords: '',
    })
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link to="/login" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold transition">
          <MdArrowBack className="mr-2" />
          Back to Login
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8">
            <h1 className="text-4xl font-bold text-white mb-2">Student Registration</h1>
            <p className="text-orange-100">Fill in all required fields to create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            {submitted && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                ✓ Registration submitted successfully! Redirecting to login...
              </div>
            )}

            {/* Row 1: Student ID and Full Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Student ID */}
              <div>
                <label htmlFor="studentId" className="block text-sm font-semibold text-gray-800 mb-2">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g., 2024-001"
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.studentId ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-800 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Juan Dela Cruz"
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.fullName ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
            </div>

            {/* Row 2: Course, Year, Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Course */}
              <div>
                <label htmlFor="course" className="block text-sm font-semibold text-gray-800 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.course ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Course</option>
                  <option value="BS Information Technology">BS Information Technology</option>
                  <option value="BS Computer Science">BS Computer Science</option>
                </select>
                {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
              </div>

              {/* Year */}
              <div>
                <label htmlFor="year" className="block text-sm font-semibold text-gray-800 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.year ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Year</option>
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="Third Year">Third Year</option>
                  <option value="Fourth Year">Fourth Year</option>
                </select>
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
              </div>

              {/* Section */}
              <div>
                <label htmlFor="section" className="block text-sm font-semibold text-gray-800 mb-2">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="e.g., A, B, C"
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.section ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section}</p>}
              </div>
            </div>

            {/* Row 3: Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@email.com"
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-800 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+63 9XX XXXX XXX"
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Row 4: Guardian Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Guardian Name */}
              <div>
                <label htmlFor="guardianName" className="block text-sm font-semibold text-gray-800 mb-2">
                  Guardian Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="guardianName"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  placeholder="Parent/Guardian Name"
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.guardianName ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.guardianName && <p className="text-red-500 text-sm mt-1">{errors.guardianName}</p>}
              </div>

              {/* Guardian Contact */}
              <div>
                <label htmlFor="guardianContact" className="block text-sm font-semibold text-gray-800 mb-2">
                  Guardian Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="guardianContact"
                  name="guardianContact"
                  value={formData.guardianContact}
                  onChange={handleChange}
                  placeholder="+63 9XX XXXX XXX"
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.guardianContact ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.guardianContact && <p className="text-red-500 text-sm mt-1">{errors.guardianContact}</p>}
              </div>
            </div>

            {/* Row 5: Hobbies */}
            <div className="mb-6">
              <label htmlFor="hobbies" className="block text-sm font-semibold text-gray-800 mb-2">
                Hobbies
              </label>
              <textarea
                id="hobbies"
                name="hobbies"
                value={formData.hobbies}
                onChange={handleChange}
                placeholder="List your hobbies (e.g., reading, sports, music, art)"
                rows="3"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              ></textarea>
            </div>

            {/* Row 6: Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Academic Achievements */}
              <div>
                <label htmlFor="academicAchievements" className="block text-sm font-semibold text-gray-800 mb-2">
                  Academic Achievements
                </label>
                <textarea
                  id="academicAchievements"
                  name="academicAchievements"
                  value={formData.academicAchievements}
                  onChange={handleChange}
                  placeholder="Awards, scholarships, honors, etc."
                  rows="3"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                ></textarea>
              </div>

              {/* Sports Achievements */}
              <div>
                <label htmlFor="sportsAchievements" className="block text-sm font-semibold text-gray-800 mb-2">
                  Sports Achievements
                </label>
                <textarea
                  id="sportsAchievements"
                  name="sportsAchievements"
                  value={formData.sportsAchievements}
                  onChange={handleChange}
                  placeholder="Medals, championships, tournaments, etc."
                  rows="3"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                ></textarea>
              </div>
            </div>

            {/* Row 7: Medical Records */}
            <div className="mb-6">
              <label htmlFor="medicalRecords" className="block text-sm font-semibold text-gray-800 mb-2">
                Medical Records
              </label>
              <textarea
                id="medicalRecords"
                name="medicalRecords"
                value={formData.medicalRecords}
                onChange={handleChange}
                placeholder="Allergies, medications, medical conditions, blood type, etc."
                rows="4"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              ></textarea>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg"
              >
                Register
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out"
              >
                Clear Form
              </button>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-gray-600 text-sm mt-6">
              Already have an account? <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
