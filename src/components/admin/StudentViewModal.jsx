import React from 'react';
import { FaTimes, FaFilePdf, FaFileImage, FaTrophy, FaCalendarAlt } from 'react-icons/fa';

export default function StudentViewModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 py-5 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Student Profile</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center text-indigo-600 text-5xl font-bold">
                {student.name.charAt(0)}
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Student ID</p>
                <p className="text-gray-800 font-semibold">{student.id}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Full Name</p>
                <p className="text-gray-800 font-semibold">{student.name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Email Address</p>
                <p className="text-gray-800 font-semibold">{student.email}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Phone Number</p>
                <p className="text-gray-800 font-semibold">{student.phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Guardian</p>
                <p className="text-gray-800 font-semibold">{student.guardian}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Guardian Contact</p>
                <p className="text-gray-800 font-semibold">{student.guardianContact}</p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Skills & Hobbies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Hobbies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {student.hobbies.map(hobby => (
                    <span key={hobby} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                      {hobby}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Achievements */}
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <FaTrophy className="text-yellow-500" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Academic</p>
                  <ul className="space-y-2">
                    {student.achievements.academic.map((ach, i) => (
                      <li key={i} className="text-sm text-gray-700 font-medium flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span> {ach}
                      </li>
                    ))}
                    {student.achievements.academic.length === 0 && <li className="text-sm text-gray-400 italic">No academic achievements recorded</li>}
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Sports</p>
                  <ul className="space-y-2">
                    {student.achievements.sports.map((ach, i) => (
                      <li key={i} className="text-sm text-gray-700 font-medium flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span> {ach}
                      </li>
                    ))}
                    {student.achievements.sports.length === 0 && <li className="text-sm text-gray-400 italic">No sports achievements recorded</li>}
                  </ul>
                </div>
              </div>
            </section>

            {/* Medical Info */}
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Medical Information
              </h3>
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl">
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{student.medicalInfo || 'No information provided'}</p>
              </div>
            </section>

            {/* Assigned Events */}
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <FaCalendarAlt className="text-indigo-500" />
                Assigned Events
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {student.assignedEvents.map((eventId) => (
                  <div key={eventId} className="flex items-center gap-3 p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-lg">
                    <div className="w-8 h-8 bg-white text-indigo-600 rounded-md flex items-center justify-center text-sm">
                      <FaCalendarAlt size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{eventId}</p>
                      <span className="text-[10px] font-bold text-green-600 uppercase">Confirmed</span>
                    </div>
                  </div>
                ))}
                {student.assignedEvents.length === 0 && <p className="text-sm text-gray-400 italic col-span-2">No events assigned to this student</p>}
              </div>
            </section>

            {/* Documents */}
            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                Uploaded Documents
              </h3>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all group">
                  <FaFilePdf className="text-red-500 text-lg group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-gray-700">Birth_Certificate.pdf</span>
                </button>
                <button className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all group">
                  <FaFileImage className="text-blue-500 text-lg group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-gray-700">Academic_Record.jpg</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
