import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaExclamationTriangle, FaClipboardList, FaCheckCircle, FaLaptopCode, FaBookOpen } from 'react-icons/fa';

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/students/${id}`);
        setStudent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Student not found or error fetching data');
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-400 font-medium">Loading student details...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="text-red-500 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{error || 'Student not found'}</h3>
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 mx-auto transition-all"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Minor': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Major': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Severe': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const sectionHeaderClasses = "text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 mt-8 first:mt-0";

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header with Back Button */}
      <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-100"
            title="Back to List"
          >
            <FaArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold shadow-sm shadow-indigo-100">
              {student.photo ? (
                <img src={`http://localhost:5000/uploads/${student.photo}`} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span>{student.firstName[0]}{student.lastName[0]}</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">{student.firstName} {student.lastName}</h2>
              <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase mt-0.5">{student.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Login Credentials Info Box */}
        <div className="mb-8 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
          <p className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
            <FaClipboardList className="text-blue-500" />
            Student Login Credentials
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-blue-50 shadow-sm">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Student ID</p>
              <p className="text-base font-bold text-gray-800">{student.id}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-50 shadow-sm">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Email for Login</p>
              <p className="text-base font-bold text-gray-800">{student.personalInfo?.email}</p>
            </div>
          </div>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-4 flex items-center gap-1.5">
            <FaCheckCircle className="text-blue-500" />
            Use Email and Password to login to student dashboard
          </p>
        </div>

        {/* Personal Information */}
        <section>
          <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaUser size={10} /> Gender</p>
              <p className="text-sm font-bold text-gray-700">{student.personalInfo?.gender || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaCalendarAlt size={10} /> Birthdate</p>
              <p className="text-sm font-bold text-gray-700">{student.personalInfo?.birthdate || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <FaLaptopCode size={10} /> Course
              </p>
              <p className="text-sm font-bold text-indigo-700">{student.personalInfo?.course === 'IT' ? 'IT (Information Technology)' : 'CS (Computer Science)'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <FaBookOpen size={10} /> Year Level
              </p>
              <p className="text-sm font-bold text-indigo-700">{student.personalInfo?.yearLevel || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaEnvelope size={10} /> Email</p>
              <p className="text-sm font-bold text-gray-700">{student.personalInfo?.email || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaPhone size={10} /> Contact</p>
              <p className="text-sm font-bold text-gray-700">{student.personalInfo?.contact || 'N/A'}</p>
            </div>
            <div className="md:col-span-2 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaMapMarkerAlt size={10} /> Address</p>
              <p className="text-sm font-bold text-gray-700">{student.personalInfo?.address || 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section>
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Documents</h3>
            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Medical Certificate</p>
                    {student.medicalCert ? (
                        <a
                            href={`http://localhost:5000/uploads/${student.medicalCert}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-200 transition shadow-sm"
                        >
                            <FaClipboardList /> View Certificate
                        </a>
                    ) : (
                        <p className="text-sm text-gray-400 italic bg-white p-4 rounded-xl border border-gray-100 inline-block">No medical certificate uploaded.</p>
                    )}
                </div>
            </div>
        </section>

        {/* Academic History */}
        <section>
          <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Academic History</h3>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Academic Year</th>
                  <th className="px-6 py-4">Grade Level</th>
                  <th className="px-6 py-4 text-center">GPA</th>
                  <th className="px-6 py-4">Awards & Recognition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {student.academicHistory?.map((item, idx) => (
                  <tr key={idx} className="text-sm font-bold text-gray-600 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">{item.year}</td>
                    <td className="px-6 py-4">{item.gradeLevel}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        {item.gpa}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.awards?.map((award, i) => (
                          <span key={i} className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-[10px] font-black border border-yellow-100 uppercase tracking-tighter">{award}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!student.academicHistory || student.academicHistory.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">No academic history records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Non-Academic Activities */}
          <section>
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Activities</h3>
            <div className="space-y-3">
              {student.nonAcademicActivities?.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <FaTrophy size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{activity.name}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{activity.role} • {activity.year}</p>
                  </div>
                </div>
              ))}
              {(!student.nonAcademicActivities || student.nonAcademicActivities.length === 0) && (
                <div className="py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 italic">No activities recorded.</p>
                </div>
              )}
            </div>
          </section>

          {/* Violations */}
          <section>
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Violations</h3>
            <div className="space-y-3">
              {student.violations?.map((v, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border flex items-start gap-4 shadow-sm transition-all hover:shadow-md ${getSeverityColor(v.severity)}`}>
                  <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{v.description}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{v.severity} • {v.date}</p>
                  </div>
                </div>
              ))}
              {(!student.violations || student.violations.length === 0) && (
                <div className="flex flex-col items-center justify-center py-10 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-100">
                  <span className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black border border-emerald-100 shadow-sm uppercase tracking-widest transition-all hover:bg-emerald-100 cursor-default">
                    Clean Record
                  </span>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-3">No violations recorded</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Skills Section */}
        <section>
          <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Skills & Expertise</h3>
          <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
            <div className="flex flex-wrap gap-2.5">
              {student.skills?.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100 shadow-sm hover:border-indigo-300 transition-all cursor-default">
                  {skill}
                </span>
              ))}
              {(!student.skills || student.skills.length === 0) && (
                <p className="text-sm text-gray-400 italic">No skills listed.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
