import React, { useState } from 'react';
import { FaTimes, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaExclamationTriangle, FaBriefcase, FaUsers, FaBook, FaArrowLeft, FaEdit, FaSave, FaTimes as FaX, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function StudentProfilePage({ student, onBack }) {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [formData, setFormData] = useState({
    id: student?.id || '',
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    password: student?.password || '',
    personalInfo: {
      email: student?.personalInfo?.email || '',
      gender: student?.personalInfo?.gender || '',
      birthdate: student?.personalInfo?.birthdate || '',
      contact: student?.personalInfo?.contact || '',
      address: student?.personalInfo?.address || '',
      course: student?.personalInfo?.course || 'IT',
      yearLevel: student?.personalInfo?.yearLevel || '1st Year'
    },
    academicHistory: student?.academicHistory || [],
    nonAcademicActivities: student?.nonAcademicActivities || [],
    violations: student?.violations || [],
    skills: student?.skills || [],
    affiliations: student?.affiliations || []
  });

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Student profile not found. Please login again.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        // Update sessionStorage with the new data, making sure to preserve the role
        const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        const updatedUser = { ...data, role: currentUser.role || 'student' };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditMode(false);
        // Reload page after a brief delay to show the updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({ type: 'error', text: 'Error saving profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      password: student?.password || '',
      personalInfo: {
        email: student?.personalInfo?.email || '',
        gender: student?.personalInfo?.gender || '',
        birthdate: student?.personalInfo?.birthdate || '',
        contact: student?.personalInfo?.contact || '',
        address: student?.personalInfo?.address || '',
        course: student?.personalInfo?.course || 'IT',
        yearLevel: student?.personalInfo?.yearLevel || '1st Year'
      },
      academicHistory: student?.academicHistory || [],
      nonAcademicActivities: student?.nonAcademicActivities || [],
      violations: student?.violations || [],
      skills: student?.skills || [],
      affiliations: student?.affiliations || []
    });
    setIsEditMode(false);
    setSaveMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack || (() => navigate(-1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              title="Go back"
            >
              <FaArrowLeft className="text-gray-600" size={18} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
                {formData.firstName?.[0]}{formData.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{formData.firstName} {formData.lastName}</h1>
                <p className="text-sm text-gray-500">Student ID: {student.id}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FaEdit size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaX size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mx-6 mt-4 max-w-5xl mx-auto p-4 rounded-lg flex items-center justify-between ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <span className="font-semibold">{saveMessage.text}</span>
          <button onClick={() => setSaveMessage(null)}><FaX size={16} /></button>
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Login Credentials Info */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
          <p className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
            <FaClipboardList className="text-blue-500" />
            Your Login Information
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Student ID</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{student.id}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Email</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{formData.personalInfo?.email}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3 flex items-center gap-1.5">
            <FaCheckCircle className="text-blue-500" />
            Use these credentials to login to your student dashboard
          </p>
        </div>

        {/* Personal Information Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.15em] mb-4 flex items-center gap-2 mt-6 first:mt-0"><span className="w-8 h-px bg-indigo-300"></span> Personal Information</h2>
          
          {isEditMode ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Gender</label>
                  <select
                    name="personalInfo.gender"
                    value={formData.personalInfo?.gender || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Course</label>
                  <select
                    name="personalInfo.course"
                    value={formData.personalInfo?.course || 'IT'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="IT">IT (Information Technology)</option>
                    <option value="CS">CS (Computer Science)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Year Level</label>
                  <select
                    name="personalInfo.yearLevel"
                    value={formData.personalInfo?.yearLevel || '1st Year'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Birthdate</label>
                  <input
                    type="date"
                    name="personalInfo.birthdate"
                    value={formData.personalInfo?.birthdate || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                  <input
                    type="email"
                    name="personalInfo.email"
                    value={formData.personalInfo?.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                  <input
                    type="tel"
                    name="personalInfo.contact"
                    value={formData.personalInfo?.contact || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Address</label>
                <textarea
                  name="personalInfo.address"
                  value={formData.personalInfo?.address || ''}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">First Name</p>
                <p className="text-sm font-semibold text-gray-800">{formData.firstName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Last Name</p>
                <p className="text-sm font-semibold text-gray-800">{formData.lastName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Gender</p>
                <p className="text-sm font-semibold text-gray-800">{formData.personalInfo?.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Course</p>
                <p className="text-sm font-semibold text-indigo-600 font-bold">{formData.personalInfo?.course === 'IT' ? '💻 IT (Information Technology)' : '🖥️ CS (Computer Science)'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Year Level</p>
                <p className="text-sm font-semibold text-indigo-600 font-bold">{formData.personalInfo?.yearLevel || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Birthdate</p>
                <p className="text-sm font-semibold text-gray-800">{formData.personalInfo?.birthdate || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                <p className="text-sm font-semibold text-gray-800">{formData.personalInfo?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                <p className="text-sm font-semibold text-gray-800">{formData.personalInfo?.contact || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                <p className="text-sm font-semibold text-gray-800">{formData.personalInfo?.address || 'N/A'}</p>
              </div>
            </div>
          )}
        </section>

        {/* Academic History Section */}
        {student.academicHistory && student.academicHistory.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.15em] mb-4 flex items-center gap-2 mt-6 first:mt-0"><span className="w-8 h-px bg-indigo-300"></span> Academic History</h2>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3">Year Level</th>
                    <th className="px-4 py-3">GPA</th>
                    <th className="px-4 py-3">Awards</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {student.academicHistory.map((item, idx) => (
                    <tr key={idx} className="text-sm font-medium text-gray-600 hover:bg-gray-50">
                      <td className="px-4 py-3">{item.year}</td>
                      <td className="px-4 py-3">{item.gradeLevel}</td>
                      <td className="px-4 py-3 text-indigo-600 font-bold">{item.gpa}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.awards && item.awards.map((award, i) => (
                            <span key={i} className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs border border-yellow-100">
                              {award}
                            </span>
                          ))}
                          {(!item.awards || item.awards.length === 0) && <span className="text-gray-400 text-xs">No awards</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Non-Academic Activities Section */}
        {student.nonAcademicActivities && student.nonAcademicActivities.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.15em] mb-4 flex items-center gap-2 mt-6 first:mt-0"><span className="w-8 h-px bg-indigo-300"></span> Non-Academic Activities</h2>
            <div className="space-y-3">
              {student.nonAcademicActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{activity.name}</p>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">{activity.role} • {activity.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {student.skills && student.skills.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.15em] mb-4 flex items-center gap-2 mt-6 first:mt-0"><span className="w-8 h-px bg-indigo-300"></span> Skills</h2>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold border border-indigo-200 hover:bg-indigo-100 transition">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Violations Section */}
        {student.violations && student.violations.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.15em] mb-4 flex items-center gap-2 mt-6 first:mt-0"><span className="w-8 h-px bg-indigo-300"></span> Violations</h2>
            <div className="space-y-3">
              {student.violations.map((v, idx) => {
                const getSeverityColor = (severity) => {
                  switch (severity) {
                    case 'Minor': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
                    case 'Major': return 'bg-orange-100 text-orange-700 border-orange-200';
                    case 'Severe': return 'bg-red-100 text-red-700 border-red-200';
                    default: return 'bg-gray-100 text-gray-700';
                  }
                };
                return (
                  <div key={idx} className={`p-4 rounded-xl border flex items-start gap-4 ${getSeverityColor(v.severity)}`}>
                    <FaExclamationTriangle className="mt-1 flex-shrink-0" size={16} />
                    <div className="flex-1">
                      <p className="font-bold">{v.description}</p>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-70 mt-1">{v.severity} • {v.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(!student.violations || student.violations.length === 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 text-center">
            <p className="text-green-600 font-bold">✓ No violations recorded</p>
          </div>
        )}

        {/* Affiliations Section */}
        {student.affiliations && student.affiliations.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.15em] mb-4 flex items-center gap-2 mt-6 first:mt-0"><span className="w-8 h-px bg-indigo-300"></span> Affiliations</h2>
            <div className="space-y-3">
              {student.affiliations.map((aff, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <FaUsers size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{aff.orgName}</p>
                    <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mt-1">{aff.role} • {aff.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!student.academicHistory || student.academicHistory.length === 0) &&
         (!student.nonAcademicActivities || student.nonAcademicActivities.length === 0) &&
         (!student.skills || student.skills.length === 0) &&
         (!student.affiliations || student.affiliations.length === 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-lg">No additional profile information added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
