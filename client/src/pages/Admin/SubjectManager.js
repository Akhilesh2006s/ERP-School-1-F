import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Search, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const initialForm = {
  name: '',
  code: '',
  classId: '',
  schoolId: '',
};

const SubjectManager = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formError, setFormError] = useState(null);
  // New state for search and pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Defensive: always filter valid subjects
  const validSubjects = Array.isArray(subjects) ? subjects.filter(sub => sub && sub._id) : [];

  // Filtered and searched subjects
  const filteredSubjects = validSubjects.filter(sub =>
    sub.name?.toLowerCase().includes(search.toLowerCase()) ||
    sub.code?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredSubjects.length / pageSize);
  const paginatedSubjects = filteredSubjects.slice((page - 1) * pageSize, page * pageSize);

  // Fetch classes on mount (use api)
  useEffect(() => {
    if (!user?.school?._id) return;
    api.get(`/class?schoolId=${user.school._id}`)
      .then(classRes => {
        setClasses(Array.isArray(classRes.data) ? classRes.data : (classRes.data.classes || []));
        setLoading(false);
      }).catch(() => {
        setError('Failed to fetch classes');
        setLoading(false);
      });
  }, [user?.school?._id]);

  // Fetch subjects for selected class (use api, robust extraction)
  useEffect(() => {
    setLoading(true);
    api.get(`/subject?schoolId=${user.school._id}`)
      .then(res => {
        const subjects =
          res.data?.data?.subjects ||
          res.data?.subjects ||
          (Array.isArray(res.data) ? res.data : []);
        setSubjects(subjects.filter(sub => sub && sub._id));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch subjects');
        setLoading(false);
      });
  }, [user.school._id]);

  // After add/edit/delete, use the same robust extraction
  const refreshSubjects = () => {
    api.get(`/subject?schoolId=${user.school._id}`)
      .then(res => {
        const subjects =
          res.data?.data?.subjects ||
          res.data?.subjects ||
          (Array.isArray(res.data) ? res.data : []);
        setSubjects(subjects.filter(sub => sub && sub._id));
      });
  };

  // Add subject (use api, auto-generate name)
  const handleAdd = async e => {
    e.preventDefault();
    setFormError(null);
    if (!form.name || !form.code || !user?.school?._id) {
      setFormError('Name, code, and school are required.');
      return;
    }
    try {
      const payload = {
        name: form.name,
        code: form.code,
        schoolId: user.school._id,
      };
      if (form.classId) payload.classId = form.classId;
      await api.post('/subject', payload);
      setShowAddModal(false);
      setForm(initialForm);
      refreshSubjects();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to add subject');
    }
  };

  // Edit subject (use api, auto-generate name)
  const openEditModal = sub => {
    if (!sub || !sub._id) return;
    setEditId(sub._id);
    setForm({
      name: sub.name || '',
      code: sub.code || '',
      classId: (sub.classId && sub.classId._id) ? sub.classId._id : (sub.classId || ''),
      schoolId: (sub.schoolId && sub.schoolId._id) ? sub.schoolId._id : (sub.schoolId || ''),
    });
    setShowEditModal(true);
  };

  const handleEdit = async e => {
    e.preventDefault();
    setFormError(null);
    if (!form.name || !form.code || !user?.school?._id) {
      setFormError('Name, code, and school are required.');
      return;
    }
    try {
      const payload = {
        name: form.name,
        code: form.code,
        schoolId: user.school._id,
      };
      if (form.classId) payload.classId = form.classId;
      await api.put(`/subject/${editId}`, payload);
      setShowEditModal(false);
      setForm(initialForm);
      setEditId(null);
      refreshSubjects();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to update subject');
    }
  };

  // Delete subject (use api)
  const handleDelete = async () => {
    try {
      await api.delete(`/subject/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      refreshSubjects();
    } catch {}
  };

  // Add this handler for form input changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
        <h2 className="text-2xl font-bold text-blue-900">Subject Management</h2>
        <button
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full p-4 shadow-xl hover:from-blue-800 hover:to-blue-600 transition flex items-center gap-2 text-lg font-semibold"
          onClick={() => { setShowAddModal(true); setForm(initialForm); }}
        >
          <Plus className="w-6 h-6" />
          <span className="hidden md:inline">Add Subject</span>
        </button>
      </div>
      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 bg-white/80 rounded-xl shadow p-4 border border-blue-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-blue-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input input-bordered w-full pl-10 rounded-lg"
          />
        </div>
      </div>
      {/* Table */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto border border-blue-100">
        <table className="min-w-full divide-y divide-blue-100">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white sticky top-0 z-10 rounded-t-2xl">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-2xl">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Code</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></td></tr>
            ) : (paginatedSubjects.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-16 text-blue-700">
                  <div className="flex flex-col items-center gap-2">
                    <BookOpen className="w-12 h-12 text-blue-300 mb-2" />
                    <span className="font-semibold text-lg">No subjects found.</span>
                    <span className="text-gray-400 text-sm">Try adjusting your search.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedSubjects.map((sub, idx) => (
                <tr key={sub._id} className={`transition group ${idx % 2 === 0 ? 'bg-blue-50/40' : 'bg-white' } hover:bg-blue-100/60`}>
                  <td className="px-4 py-3 font-medium text-blue-900 rounded-l-xl">{sub.name}</td>
                  <td className="px-4 py-3">{sub.code}</td>
                  <td className="px-4 py-3 text-center rounded-r-xl">
                    <button className="p-2 rounded-full hover:bg-blue-100 transition" title="Edit" onClick={() => openEditModal(sub)}>
                      <Edit className="w-5 h-5 text-blue-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-red-100 transition ml-2" title="Delete" onClick={() => { setDeleteId(sub._id); setShowDeleteModal(true); }}>
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-blue-900">Page {page} of {totalPages}</span>
          <button
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">{showAddModal ? 'Add Subject' : 'Edit Subject'}</h3>
            <form onSubmit={showAddModal ? handleAdd : handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input name="code" value={form.code} onChange={handleChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (showAddModal ? <Plus className="w-5 h-5 mr-2" /> : <Edit className="w-5 h-5 mr-2" />)}
                {showAddModal ? 'Add' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowDeleteModal(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-red-600 mb-4">Delete Subject</h3>
            <p className="mb-6">Are you sure you want to delete this subject?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >Delete</button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SubjectManager; 