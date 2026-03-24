import React, { useState, useMemo } from 'react';
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaPlus, FaTimes, FaExclamationTriangle, FaCheckCircle, FaFilter } from 'react-icons/fa';
import { MOCK_EVENTS, MOCK_STUDENTS } from '../../constants/mockData';

export default function EventAssignment() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  // Get current selected event
  const selectedEvent = useMemo(() => 
    events.find(e => e.id === selectedEventId), 
    [events, selectedEventId]
  );

  // Get assigned students for the selected event
  const assignedStudents = useMemo(() => 
    students.filter(s => selectedEvent?.participants.includes(s.id)),
    [students, selectedEvent]
  );

  // Filter candidate students
  const candidateStudents = useMemo(() => {
    return students.filter(student => {
      const isAlreadyAssigned = selectedEvent?.participants.includes(student.id);
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            student.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSkill = filterSkill === '' || student.skills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase()));
      
      return !isAlreadyAssigned && matchesSearch && matchesSkill;
    });
  }, [students, selectedEvent, searchTerm, filterSkill]);

  const handleAssign = (student) => {
    if (selectedEvent.participants.length >= selectedEvent.maxParticipants) {
      alert("Maximum participants reached for this event!");
      return;
    }

    // Check if student already has an event on the same date
    const sameDateEvent = events.find(e => 
      e.date === selectedEvent.date && 
      e.participants.includes(student.id)
    );

    if (sameDateEvent) {
      if (!confirm(`${student.name} is already assigned to "${sameDateEvent.name}" on ${selectedEvent.date}. Assign anyway?`)) {
        return;
      }
    }

    setEvents(prev => prev.map(e => 
      e.id === selectedEventId 
        ? { ...e, participants: [...e.participants, student.id] } 
        : e
    ));
    
    setStudents(prev => prev.map(s => 
      s.id === student.id 
        ? { ...s, assignedEvents: [...(s.assignedEvents || []), selectedEventId] } 
        : s
    ));
  };

  const handleRemove = (studentId) => {
    setEvents(prev => prev.map(e => 
      e.id === selectedEventId 
        ? { ...e, participants: e.participants.filter(id => id !== studentId) } 
        : e
    ));
    
    setStudents(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, assignedEvents: s.assignedEvents.filter(id => id !== selectedEventId) } 
        : s
    ));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn h-[calc(100vh-12rem)] overflow-hidden">
      {/* LEFT PANEL — Event Selector */}
      <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Event</label>
          <div className="relative mb-6">
            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-900 focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer appearance-none"
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Event Details</p>
                <h3 className="font-bold text-gray-800 text-sm mb-2">{selectedEvent.name}</h3>
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <FaCalendarAlt size={10} className="text-indigo-400" /> {selectedEvent.date} • {selectedEvent.time}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <FaMapMarkerAlt size={10} className="text-indigo-400" /> {selectedEvent.venue}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Capacity</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedEvent.participants.length >= selectedEvent.maxParticipants ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {selectedEvent.participants.length >= selectedEvent.maxParticipants ? 'Full' : 'Available'}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-indigo-900">{selectedEvent.participants.length}</span>
                  <span className="text-sm text-indigo-400 mb-1">/ {selectedEvent.maxParticipants} Participants</span>
                </div>
                <div className="w-full h-2 bg-indigo-100 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${selectedEvent.participants.length >= selectedEvent.maxParticipants ? 'bg-red-500' : 'bg-indigo-600'}`}
                    style={{ width: `${(selectedEvent.participants.length / selectedEvent.maxParticipants) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — Student Assignment */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Top Section — Assigned Students */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[45%] overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <h3 className="font-bold text-gray-800">Assigned Students</h3>
            </div>
            <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-500">
              {assignedStudents.length} Students
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assignedStudents.map(student => (
                  <tr key={student.id} className="hover:bg-red-50/30 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{student.name}</p>
                          <p className="text-[10px] text-gray-400">{student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        {student.skills.slice(0, 2).map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-bold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[9px] font-bold">Confirmed</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => handleRemove(student.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <FaTimes size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {assignedStudents.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400 text-sm italic">
                      No students assigned to this event yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section — View Candidates */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 space-y-4">
            <div className="flex items-center gap-2">
              <FaUsers className="text-indigo-500" />
              <h3 className="font-bold text-gray-800">Add Students / Candidates</h3>
            </div>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none text-xs"
                />
              </div>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-indigo-50 outline-none cursor-pointer"
              >
                <option value="">All Skills</option>
                <option value="React">React</option>
                <option value="Python">Python</option>
                <option value="Design">UI/UX Design</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {candidateStudents.map(student => (
                <div key={student.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{student.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{student.id}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAssign(student)}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm shadow-green-100"
                      title="Assign to Event"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {student.skills.map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-[9px] font-bold border border-gray-100 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                  {student.achievements.academic.length > 0 && (
                    <p className="text-[9px] text-yellow-600 flex items-center gap-1 font-bold italic">
                      🏆 {student.achievements.academic[0]}
                    </p>
                  )}
                </div>
              ))}
              {candidateStudents.length === 0 && (
                <div className="col-span-full py-10 text-center">
                  <p className="text-sm text-gray-400 italic">No candidates matching filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
