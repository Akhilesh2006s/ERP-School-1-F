import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Loader2, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Search, FileText } from 'lucide-react';

const getAcademicYearOptions = () => {
  const now = new Date();
  const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: 5 }, (_, i) => {
    const y1 = startYear + i;
    const y2 = (y1 + 1).toString().slice(-2);
    return { value: `${y1}-${y2}`, label: `${y1}-${y2}` };
  });
};

const ExamManager = () => {
  const [form, setForm] = useState({
    name: '',
    maxMarks: '',
    date: '',
    academicYear: ''
  });
  const [exams, setExams] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState(getAcademicYearOptions()[1]?.value || getAcademicYearOptions()[0].value);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/exam');
      setExams(res.data.exams || []);
    } catch {
      setExams([]);
    }
    setLoading(false);
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/api/exam', {
        name: form.name,
        maxMarks: form.maxMarks,
        date: form.date,
        academicYear: form.academicYear
      });
      setMsg('Exam added!');
      setForm({ name: '', maxMarks: '', date: '', academicYear: '' });
      fetchExams();
      setShowAddModal(false);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add exam.');
    }
  };

  const handleAddExam = async e => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.maxMarks || !form.date || !form.academicYear) {
      setFormError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/exam', {
        name: form.name,
        maxMarks: form.maxMarks,
        date: form.date,
        academicYear: form.academicYear
      });
      setMsg('Exam added!');
      setForm({ name: '', maxMarks: '', date: '', academicYear: '' });
      fetchExams();
      setShowAddModal(false);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add exam.');
    }
    setLoading(false);
  };

  const openEditModal = exam => {
    setEditId(exam._id);
    setForm({
      name: exam.name,
      maxMarks: exam.maxMarks,
      date: exam.date,
      academicYear: exam.academicYear
    });
    setShowEditModal(true);
  };

  const handleEditExam = async e => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.maxMarks || !form.date || !form.academicYear) {
      setFormError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/api/exam/${editId}`, {
        name: form.name,
        maxMarks: form.maxMarks,
        date: form.date,
        academicYear: form.academicYear
      });
      setMsg('Exam updated!');
      setForm({ name: '', maxMarks: '', date: '', academicYear: '' });
      fetchExams();
      setShowEditModal(false);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update exam.');
    }
    setLoading(false);
  };

  const handleDeleteExam = async () => {
    setLoading(true);
    try {
      await api.delete(`/api/exam/${deleteId}`);
      setMsg('Exam deleted!');
      setDeleteId(null);
      fetchExams();
      setShowDeleteModal(false);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to delete exam.');
    }
    setLoading(false);
  };

  // Filter exams by academic year
  const filteredExams = exams.filter(exam => exam.academicYear === academicYear);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs with vibrant colors */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-300/60 to-indigo-400/60 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-300/60 to-pink-400/60 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-indigo-300/60 to-blue-400/60 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-br from-pink-300/60 to-purple-400/60 rounded-full blur-xl animate-bounce-slow"></div>
        
        {/* Hexagonal shapes with vibrant colors */}
        <div className="absolute top-1/4 left-1/6 w-16 h-16 bg-gradient-to-br from-blue-300/50 to-indigo-400/50 clip-hexagon animate-twinkle"></div>
        <div className="absolute top-3/4 right-1/6 w-12 h-12 bg-gradient-to-br from-purple-300/50 to-pink-400/50 clip-hexagon animate-twinkle" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-gradient-to-br from-indigo-300/50 to-blue-400/50 clip-hexagon animate-twinkle" style={{animationDelay: '2s'}}></div>
        
        {/* Particle effects with vibrant colors */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-400/80 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400/80 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-indigo-400/80 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        
        {/* Animated waves */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-200/40 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-purple-200/40 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-gradient-to-br from-pink-300/40 to-rose-400/40 rotate-45 animate-float-slow"></div>
        <div className="absolute top-2/3 right-1/4 w-6 h-6 bg-gradient-to-br from-indigo-300/40 to-blue-400/40 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-1/3 right-1/3 w-10 h-10 bg-gradient-to-br from-green-300/40 to-emerald-400/40 rotate-12 animate-float"></div>
      </div>

      <div className="max-w-5xl mx-auto py-8 relative z-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Exam Management</h2>
        <button
          className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full p-4 shadow-xl hover:from-blue-800 hover:to-blue-600 transition flex items-center gap-2 text-lg font-semibold"
          onClick={() => {
            setForm({ name: '', maxMarks: '', date: '', academicYear });
            setShowAddModal(true);
          }}
        >
          <Plus className="w-6 h-6" />
          <span className="hidden md:inline">Add Exam</span>
        </button>
      </div>
      {/* Academic Year Dropdown */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-blue-900 font-semibold">Academic Year:</label>
        <select
          value={academicYear}
          onChange={e => setAcademicYear(e.target.value)}
          className="input input-bordered w-48 rounded-lg"
        >
          {getAcademicYearOptions().map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <h3 className="text-lg font-bold text-blue-700 mb-4">Academic Year: {academicYear}</h3>
      {/* Table of exams for selected year */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto border border-blue-100">
        <table className="min-w-full divide-y divide-blue-100">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white sticky top-0 z-10 rounded-t-2xl">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-2xl">Exam Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Max Marks</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></td></tr>
            ) : (filteredExams.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16 text-blue-700">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-12 h-12 text-blue-300 mb-2" />
                    <span className="font-semibold text-lg">No exams found for this academic year.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredExams.map((exam, idx) => (
                <tr key={exam._id} className={`transition group ${idx % 2 === 0 ? 'bg-blue-50/40' : 'bg-white' } hover:bg-blue-100/60`}>
                  <td className="px-4 py-3 font-medium text-blue-900 rounded-l-xl">{exam.name}</td>
                  <td className="px-4 py-3">{exam.maxMarks}</td>
                  <td className="px-4 py-3">{exam.date ? new Date(exam.date).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-3 text-center rounded-r-xl">
                    <button className="p-2 rounded-full hover:bg-blue-100 transition" title="Edit" onClick={() => openEditModal(exam)}>
                      <Edit className="w-5 h-5 text-blue-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-red-100 transition ml-2" title="Delete" onClick={() => { setDeleteId(exam._id); setShowDeleteModal(true); }}>
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
      {/* Add Exam Modal: include academic year dropdown */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowAddModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Add Exam</h3>
            <form onSubmit={handleAddExam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  name="maxMarks"
                  value={form.maxMarks}
                  onChange={handleFormChange}
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <select
                  name="academicYear"
                  value={form.academicYear || academicYear}
                  onChange={handleFormChange}
                  className="input input-bordered w-full rounded-lg"
                  required
                >
                  {getAcademicYearOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}Add
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Exam Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowEditModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Edit Exam</h3>
            <form onSubmit={handleEditExam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  name="maxMarks"
                  value={form.maxMarks}
                  onChange={handleFormChange}
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <select
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleFormChange}
                  className="input input-bordered w-full rounded-lg"
                  required
                >
                  {getAcademicYearOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Edit className="w-5 h-5 mr-2" />}Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowDeleteModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-red-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this exam? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExam}
                className="py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trash2 className="w-5 h-5 mr-2" />}Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ExamManager; 