import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import FacultyCard from '../../components/admin/FacultyCard';
import FacultyFormModal from '../../components/admin/FacultyFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [deletingFaculty, setDeletingFaculty] = useState(null);

  // Filter faculty based on search
  const filteredFaculty = faculty.filter(f => {
    const query = searchQuery.toLowerCase().trim();
    return (
      f.fullname.toLowerCase().includes(query) ||
      f.facultyid.toLowerCase().includes(query) ||
      f.email.toLowerCase().includes(query) ||
      f.position.toLowerCase().includes(query) ||
      f.program.toLowerCase().includes(query)
    );
  });

  // Fetch faculty list
  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/faculty');
      setFaculty(response.data);
    } catch (err) {
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleSavefaculty = async (facultyData) => {
    try {
      if (editingFaculty) {
        // Update faculty
        await axios.put(`http://localhost:5000/api/faculty/${editingFaculty.facultyid}`, facultyData);
        alert('Faculty updated successfully');
      } else {
        // Create new faculty
        await axios.post('http://localhost:5000/api/faculty', facultyData);
        alert('Faculty created successfully');
      }
      
      setIsFormOpen(false);
      setEditingFaculty(null);
      fetchFaculty();
    } catch (err) {
      console.error('Error saving faculty:', err);
      alert(err.response?.data?.message || 'Error saving faculty');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/faculty/${deletingFaculty.facultyid}`);
      alert('Faculty deleted successfully');
      setDeletingFaculty(null);
      fetchFaculty();
    } catch (err) {
      console.error('Error deleting faculty:', err);
      alert(err.response?.data?.message || 'Error deleting faculty');
    }
  };

  const handleEdit = (fac) => {
    setEditingFaculty(fac);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Faculty Management</h1>
        <p className="text-gray-600">Manage faculty members and their information</p>
      </div>

      {/* Search & Action Bar */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, email, position, or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => {
            setEditingFaculty(null);
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <FaPlus size={18} />
          Add Faculty
        </button>
      </div>

      {/* Faculty Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading faculty...</p>
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {faculty.length === 0 ? 'No faculty members added yet' : 'No results found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((fac) => (
            <FacultyCard
              key={fac.facultyid}
              faculty={fac}
              onEdit={() => handleEdit(fac)}
              onDelete={() => setDeletingFaculty(fac)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <FacultyFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFaculty(null);
        }}
        onSave={handleSavefaculty}
        faculty={editingFaculty}
      />

      <DeleteConfirmModal
        isOpen={!!deletingFaculty}
        itemName={deletingFaculty?.fullname || 'Faculty'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingFaculty(null)}
      />
    </div>
  );
}
