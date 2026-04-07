import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaTrophy, FaPlus, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentFormModal from '../../components/admin/StudentFormModal';
import FilterPanel from '../../components/admin/FilterPanel';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import StudentCard from '../../components/admin/StudentCard';

export default function StudentManagement() {
  const navigate = useNavigate();
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
            <StudentCard 
              key={student.id} 
              student={student} 
              onEdit={(s) => { setEditingStudent(s); setIsFormOpen(true); }} 
              onDelete={(s) => setDeletingStudent(s)} 
            />
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
