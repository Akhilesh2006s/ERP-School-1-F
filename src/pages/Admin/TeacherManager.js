import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Search, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const TeacherManager = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    qualification: '',
    experience: '',
  });
  const [addError, setAddError] = useState(null);
  // New state for search and pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Add state for edit modal and delete confirmation
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    qualification: '',
    experience: '',
  });
  const [editId, setEditId] = useState(null);
  const [editError, setEditError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Filtered and searched teachers
  const filteredTeachers = teachers.filter(t =>
    t.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    t.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredTeachers.length / pageSize);
  const paginatedTeachers = filteredTeachers.slice((page - 1) * pageSize, page * pageSize);

  // Remove all usage of schoolId in the frontend for teacher creation
  // Do not send schoolId in the payload when creating a teacher
  // Remove any schoolId field from forms, state, and API calls

  const { user } = useAuth();
  const schoolId = user?.school?._id || (user?.schoolId?._id || user?.schoolId);

  // Fetch teachers
  const fetchTeachers = () => {
    setLoading(true);
    api.get('/api/teacher/admin')
      .then(res => {
        const data = res.data;
        setTeachers(Array.isArray(data) ? data : (data.teachers || data.data?.teachers || []));
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch teachers');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Handle add form change
  const handleAddChange = e => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  // Handle add form submit
  const handleAddSubmit = async e => {
    e.preventDefault();
    setAddError(null);
    if (!schoolId) {
      setAddError('No school selected. Please select a school.');
      return;
    }
    const payload = { ...addForm, schoolId };
    try {
      const res = await api.post('/api/teacher/admin', payload);
      setShowAddModal(false);
      setAddForm({ firstName: '', lastName: '', email: '', password: '', qualification: '', experience: '' });
      fetchTeachers();
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add teacher');
    }
  };

  // Edit button handler
  const openEditModal = (teacher) => {
    setEditForm({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
    });
    setEditId(teacher._id);
    setEditError(null);
    setShowEditModal(true);
  };

  // Edit form change handler
  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Edit form submit handler
  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditError(null);
    try {
      await api.put(`/api/teacher/admin/${editId}`, editForm);
      setShowEditModal(false);
      setEditId(null);
      setEditForm({ firstName: '', lastName: '', email: '', qualification: '', experience: '' });
      fetchTeachers();
      toast.success('Teacher updated successfully!');
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update teacher');
    }
  };

  // Delete button handler
  const openDeleteModal = (teacherId) => {
    setDeleteId(teacherId);
    setShowDeleteModal(true);
  };

  // Delete confirm handler
  const handleDelete = async () => {
    try {
      await api.delete(`/api/teacher/admin/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchTeachers();
      toast.success('Teacher deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete teacher');
    }
  };

  if (loading) return <div>Loading teachers...</div>;
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
        <h2 className="text-2xl font-bold text-blue-900">Teacher Management</h2>
        <button
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full p-4 shadow-xl hover:from-blue-800 hover:to-blue-600 transition flex items-center gap-2 text-lg font-semibold"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-6 h-6" />
          <span className="hidden md:inline">Add Teacher</span>
        </button>
      </div>
      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 bg-white/80 rounded-xl shadow p-4 border border-blue-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-blue-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Qualification</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Experience</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></td></tr>
            ) : (paginatedTeachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-blue-700">
                  <div className="flex flex-col items-center gap-2">
                    <User className="w-12 h-12 text-blue-300 mb-2" />
                    <span className="font-semibold text-lg">No teachers found.</span>
                    <span className="text-gray-400 text-sm">Try adjusting your search.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTeachers.map((teacher, idx) => (
                <tr key={teacher._id} className={`transition group ${idx % 2 === 0 ? 'bg-blue-50/40' : 'bg-white' } hover:bg-blue-100/60`}>
                  <td className="px-4 py-3 font-medium text-blue-900 rounded-l-xl">{teacher.firstName} {teacher.lastName}</td>
                  <td className="px-4 py-3">{teacher.email}</td>
                  <td className="px-4 py-3">{teacher.qualification}</td>
                  <td className="px-4 py-3">{teacher.experience}</td>
                  <td className="px-4 py-3 text-center rounded-r-xl">
                    <button className="p-2 rounded-full hover:bg-blue-100 transition" title="Edit" onClick={() => openEditModal(teacher)}>
                      <Edit className="w-5 h-5 text-blue-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-red-100 transition ml-2" title="Delete" onClick={() => openDeleteModal(teacher._id)}>
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
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowAddModal(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Add Teacher</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input name="firstName" value={addForm.firstName} onChange={handleAddChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input name="lastName" value={addForm.lastName} onChange={handleAddChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" value={addForm.email} onChange={handleAddChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input name="password" type="password" value={addForm.password} onChange={handleAddChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input name="qualification" value={addForm.qualification} onChange={handleAddChange} className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                <input name="experience" type="number" value={addForm.experience} onChange={handleAddChange} className="input input-bordered w-full rounded-lg" />
              </div>
              {addError && <div className="text-red-600 text-sm">{addError}</div>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                Add
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowEditModal(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Edit Teacher</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input name="firstName" value={editForm.firstName} onChange={handleEditChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input name="lastName" value={editForm.lastName} onChange={handleEditChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" value={editForm.email} onChange={handleEditChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input name="qualification" value={editForm.qualification} onChange={handleEditChange} className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                <input name="experience" type="number" value={editForm.experience} onChange={handleEditChange} className="input input-bordered w-full rounded-lg" />
              </div>
              {editError && <div className="text-red-600 text-sm">{editError}</div>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center"
              >
                <Edit className="w-5 h-5 mr-2" />
                Update
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
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Delete Teacher</h3>
            <p className="mb-6">Are you sure you want to delete this teacher? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TeacherManager; 