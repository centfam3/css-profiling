import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

export default function StudentEditModal({ isOpen, onClose, onSave, student }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guardian: '',
    guardianContact: '',
    hobbies: '',
    medicalInfo: '',
    skills: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        guardian: student.guardian || '',
        guardianContact: student.guardianContact || '',
        hobbies: Array.isArray(student.hobbies) ? student.hobbies.join(', ') : '',
        medicalInfo: student.medicalInfo || '',
        skills: Array.isArray(student.skills) ? student.skills.join(', ') : '',
      });
    }
  }, [student]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedStudent = {
      ...student,
      ...formData,
      hobbies: formData.hobbies.split(',').map(h => h.trim()).filter(h => h !== ''),
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
    };
    onSave(updatedStudent);
    onClose();
  };

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all duration-200";
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 py-5 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">Edit Student</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClasses}>Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>Email Address</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>Guardian Name</label>
              <input name="guardian" value={formData.guardian} onChange={handleChange} className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>Guardian Contact</label>
              <input name="guardianContact" value={formData.guardianContact} onChange={handleChange} className={inputClasses} required />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Skills (comma separated)</label>
            <input name="skills" value={formData.skills} onChange={handleChange} className={inputClasses} placeholder="React, Python, Design..." />
          </div>

          <div>
            <label className={labelClasses}>Hobbies (comma separated)</label>
            <input name="hobbies" value={formData.hobbies} onChange={handleChange} className={inputClasses} placeholder="Reading, Gaming, Chess..." />
          </div>

          <div>
            <label className={labelClasses}>Medical Information</label>
            <textarea name="medicalInfo" value={formData.medicalInfo} onChange={handleChange} rows="3" className={inputClasses} placeholder="Allergies, chronic conditions, etc."></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <FaSave /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
