import React, { useState, useMemo } from 'react';
import { FaSearch, FaFilter, FaTimes, FaEdit, FaTrash, FaEye, FaTrophy, FaPlus } from 'react-icons/fa';
import { MOCK_STUDENTS } from '../../constants/mockData';
import StudentViewModal from '../../components/admin/StudentViewModal';
import StudentEditModal from '../../components/admin/StudentEditModal';
import StudentCreateModal from '../../components/admin/StudentCreateModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

export default function StudentManagement() {
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterAchievement, setFilterAchievement] = useState('All');
  
  // Modal states
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || 
                            student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (student.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
      
      const matchesSkill = filterSkill === '' || student.skills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase()));
      
      let matchesAchievement = true;
      if (filterAchievement === 'Academic') matchesAchievement = student.achievements.academic.length > 0;
      if (filterAchievement === 'Sports') matchesAchievement = student.achievements.sports.length > 0;

      return matchesSearch && matchesSkill && matchesAchievement;
    });
  }, [students, searchTerm, filterSkill, filterAchievement]);

  const handleDelete = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setDeletingStudent(null);
  };

  const handleSaveEdit = (updatedStudent) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setEditingStudent(null);
  };

  const handleCreateStudent = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
    setIsCreateModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSkill('');
    setFilterAchievement('All');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none text-sm"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select 
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none cursor-pointer"
            >
              <option value="">All Skills</option>
              <option value="React">React</option>
              <option value="Python">Python</option>
              <option value="Design">UI/UX Design</option>
              <option value="Java">Java</option>
            </select>
            <select 
              value={filterAchievement}
              onChange={(e) => setFilterAchievement(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none cursor-pointer"
            >
              <option value="All">All Achievements</option>
              <option value="Academic">Academic</option>
              <option value="Sports">Sports</option>
            </select>
            <button 
              onClick={clearFilters}
              className="px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-semibold whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center px-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Showing <span className="text-indigo-600">{filteredStudents.length}</span> of {students.length} students
          </p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-xs font-bold shadow-lg shadow-indigo-100"
          >
            <FaPlus /> Add New Student
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-5">Student Information</th>
                <th className="px-6 py-5">Skills & Hobbies</th>
                <th className="px-6 py-5">Achievements</th>
                <th className="px-6 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110 ${student.isProfileComplete === false ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {student.name ? student.name.charAt(0) : student.id.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{student.name || 'Pending Profile'}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.id}</p>
                        {student.email && <p className="text-[10px] text-gray-400 mt-0.5">{student.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1.5">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {student.skills.map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-bold border border-indigo-100/50">
                              {skill}
                            </span>
                          ))}
                          {student.skills.length === 0 && <span className="text-[9px] text-gray-300 italic">None listed</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1.5">Hobbies</p>
                        <div className="flex flex-wrap gap-1.5">
                          {student.hobbies.map(hobby => (
                            <span key={hobby} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-[9px] font-bold border border-gray-100">
                              {hobby}
                            </span>
                          ))}
                          {student.hobbies.length === 0 && <span className="text-[9px] text-gray-300 italic">None listed</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100 w-fit">
                        <FaTrophy size={12} />
                        <span className="text-xs font-bold">
                          {student.achievements.academic.length + student.achievements.sports.length}
                        </span>
                      </div>
                      {student.isProfileComplete === false && (
                        <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-bold border border-orange-100 uppercase tracking-wider animate-pulse">
                          Needs Onboarding
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setViewingStudent(student)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                        title="View Profile"
                      >
                        <FaEye size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingStudent(student)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                        title="Edit Student"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button 
                        onClick={() => setDeletingStudent(student)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                        title="Delete Student"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-gray-200 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No students found</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentViewModal 
        isOpen={!!viewingStudent} 
        onClose={() => setViewingStudent(null)} 
        student={viewingStudent} 
      />
      <StudentEditModal 
        isOpen={!!editingStudent} 
        onClose={() => setEditingStudent(null)} 
        onSave={handleSaveEdit}
        student={editingStudent} 
      />
      <StudentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateStudent}
      />
      <DeleteConfirmModal 
        isOpen={!!deletingStudent} 
        onClose={() => setDeletingStudent(null)} 
        onConfirm={() => handleDelete(deletingStudent.id)}
        itemName={deletingStudent?.name}
      />
    </div>
  );
}
