import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaEdit, FaTrash, FaEye, FaTrophy, FaPlus, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import StudentViewModal from '../../components/admin/StudentViewModal';
import StudentFormModal from '../../components/admin/StudentFormModal';
import FilterPanel from '../../components/admin/FilterPanel';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [allStudentIds, setAllStudentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skill: '',
    activity: '',
    studentId: '',
    minGpa: ''
  });
  
  // Modal states
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Function to fetch all unique skills and year levels (unfiltered)
  const fetchAllMetadata = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      
      // Extract Skills
      const skillSet = new Set();
      // Extract Student IDs
      const idSet = new Set();
      
      response.data.forEach(student => {
        // Skills
        if (student.skills && Array.isArray(student.skills)) {
          student.skills.forEach(skill => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            if (skillName) skillSet.add(skillName);
          });
        }
        
        // Student IDs
        if (student.id) {
          idSet.add(student.id);
        }
      });
      
      setAllSkills(Array.from(skillSet).sort());
      setAllStudentIds(Array.from(idSet).sort());
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const fetchStudents = async (queryFilters = filters) => {
    setLoading(true);
    try {
      console.log('Applying Filters:', queryFilters);
      const params = new URLSearchParams();
      if (queryFilters.skill) params.append('skill', queryFilters.skill);
      if (queryFilters.activity) params.append('activity', queryFilters.activity);
      if (queryFilters.studentId) params.append('studentId', queryFilters.studentId);
      if (queryFilters.minGpa) params.append('minGpa', queryFilters.minGpa);

      const response = await axios.get(`http://localhost:5000/api/students?${params.toString()}`);
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAllMetadata(); // Initial fetch for metadata
  }, []);

  const handleFilterChange = (name, value) => {
    // Clear other filters when student ID is selected to ensure only one student shows
    if (name === 'studentId' && value !== '') {
      const singleIdFilters = {
        skill: '',
        activity: '',
        studentId: value,
        minGpa: ''
      };
      setFilters(singleIdFilters);
      fetchStudents(singleIdFilters);
      return;
    }

    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    
    // Immediately fetch with updated filters for select fields
    if (name === 'skill') {
      fetchStudents(updatedFilters);
    }
  };

  const handleApplyFilters = () => {
    fetchStudents(filters);
  };

  // Remove the useEffect for auto-apply to avoid double calls
  // and potential closure issues
  /*
  useEffect(() => {
    fetchStudents(filters);
  }, [filters.skill]);
  */

  const handleClearFilters = () => {
    const cleared = { skill: '', activity: '', studentId: '', minGpa: '' };
    setFilters(cleared);
    fetchStudents(cleared);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
      setDeletingStudent(null);
      fetchAllMetadata(); // Refresh metadata list after delete
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const handleSaveStudent = async (studentData) => {
    try {
      // Validate required fields
      if (!studentData.firstName || !studentData.lastName) {
        alert('Student name is required');
        return;
      }
      if (!studentData.personalInfo.email) {
        alert('Email is required for login');
        return;
      }
      if (!studentData.password) {
        alert('Password is required for login');
        return;
      }
      if (!studentData.id) {
        alert('Student ID is required');
        return;
      }

      if (editingStudent) {
        await axios.put(`http://localhost:5000/api/students/${editingStudent.id}`, studentData);
        alert('Student updated successfully!');
      } else {
        // Check if student ID already exists
        const existingStudent = students.find(s => s.id === studentData.id);
        if (existingStudent) {
          alert(`Student ID "${studentData.id}" already exists. Please use a different ID.`);
          return;
        }
        const response = await axios.post('http://localhost:5000/api/students', studentData);
        alert(`Student created successfully! They can now login with Email: ${studentData.personalInfo.email}`);
      }
      
      setIsFormOpen(false);
      setEditingStudent(null);
      fetchStudents(); 
      fetchAllMetadata(); // Refresh skills and year levels list after save
    } catch (err) {
      console.error('Error saving student:', err);
      alert('Error saving student: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Student Profiles</h2>
          <p className="text-xs text-gray-400 font-medium mt-1">Manage and track student information</p>
        </div>
        <button 
          onClick={() => { setEditingStudent(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-100"
        >
          <FaPlus /> Add Student
        </button>
      </div>

      {/* Filter Panel */}
      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        availableSkills={allSkills}
        availableStudentIds={allStudentIds}
      />

      {/* Results Count */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Showing {students.length} Students</span>
        <div className="h-px flex-1 bg-gray-100"></div>
      </div>

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium">Loading students...</p>
          </div>
        ) : students.length > 0 ? (
          students.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                  {student.photo ? (
                    <img src={`http://localhost:5000/uploads/${student.photo}`} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <span>{student.firstName[0]}{student.lastName[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 leading-tight">{student.firstName} {student.lastName}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{student.id}</p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Year Level</p>
                    <p className="text-xs font-bold text-gray-700">{student.personalInfo?.yearLevel || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Birth Date</p>
                    <p className="text-xs font-bold text-indigo-600">
                      {student.personalInfo?.birthdate ? new Date(student.personalInfo.birthdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Top Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {student.skills && student.skills.length > 0 ? (
                      <>
                        {student.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-bold border border-indigo-100/50">
                            {skill}
                          </span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="text-[9px] text-gray-400 font-bold pl-1">+{student.skills.length - 3} more</span>
                        )}
                      </>
                    ) : (
                      <span className="text-[9px] text-gray-400 italic font-medium ml-1">No skills listed</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-50">
                <button 
                  onClick={() => setViewingStudent(student)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all flex flex-col items-center gap-1"
                >
                  <FaEye size={14} />
                  <span className="text-[8px] font-bold uppercase">View</span>
                </button>
                <button 
                  onClick={() => { setEditingStudent(student); setIsFormOpen(true); }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex flex-col items-center gap-1"
                >
                  <FaEdit size={14} />
                  <span className="text-[8px] font-bold uppercase">Edit</span>
                </button>
                <button 
                  onClick={() => setDeletingStudent(student)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex flex-col items-center gap-1"
                >
                  <FaTrash size={14} />
                  <span className="text-[8px] font-bold uppercase">Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-gray-200 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No students found</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new student.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentViewModal 
        isOpen={!!viewingStudent} 
        onClose={() => setViewingStudent(null)} 
        student={viewingStudent} 
      />
      <StudentFormModal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingStudent(null); }} 
        onSave={handleSaveStudent}
        student={editingStudent} 
      />
      <DeleteConfirmModal 
        isOpen={!!deletingStudent} 
        onClose={() => setDeletingStudent(null)} 
        onConfirm={() => handleDelete(deletingStudent.id)}
        itemName={`${deletingStudent?.firstName} ${deletingStudent?.lastName}`}
      />
    </div>
  );
}
