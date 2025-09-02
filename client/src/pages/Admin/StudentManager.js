import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Search, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  studentId: '',
  schoolId: '',
};

const StudentManager = () => {
  const { user, loading: userLoading } = useAuth();
  console.log('User in StudentManager:', user);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formError, setFormError] = useState(null);
  // New state for search, filter, pagination
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Remove all hardcoded schoolId and auto-selection logic
  // Only use user.school._id for all school logic
  // If user.school or user.school._id is missing, show a clear error and do not try to patch it

  // Fetch classes on mount
  useEffect(() => {
    if (!user || !user.school || !user.school._id) return;
    setLoading(true);
    console.log('Fetching classes...');
          api.get(`/api/class?schoolId=${user.school._id}`)
      .then(res => {
        console.log('Classes response:', res);
        const data = res.data;
        setClasses(Array.isArray(data) ? data : (data.classes || []));
        setLoading(false);
      })
      .catch((err) => {
        console.log('Classes error:', err);
        setError('Failed to fetch classes: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      });
  }, [user && user.school && user.school._id]);

  // Fetch students for selected class or all students for the school
  useEffect(() => {
    if (!user || !user.school || !user.school._id) return;
    setLoading(true);
    console.log('Fetching students...');
    let url = '/api/student/admin';
    api.get(url)
      .then(res => {
        console.log('Students response:', res);
        const data = res.data;
        setStudents(Array.isArray(data) ? data : (data.students || []));
        setLoading(false);
      })
      .catch((err) => {
        console.log('Students error:', err);
        setError('Failed to fetch students: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      });
  }, [user && user.school && user.school._id]);

  // Handle form change
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add student (no classId required)
  const handleAdd = async e => {
    e.preventDefault();
    setFormError(null);
    try {
      const res = await api.post('/api/student/admin', { ...form, schoolId: user.school._id });
      setShowAddModal(false);
      setForm(initialForm);
      // Refresh students
      api.get('/api/student/admin')
        .then(res => {
          const data = res.data;
          setStudents(Array.isArray(data) ? data : (data.students || []));
        });
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to add student');
    }
  };

  // Edit student (no classId required)
  const openEditModal = stu => {
    setEditId(stu._id);
    setForm({
      firstName: stu.firstName,
      lastName: stu.lastName,
      email: stu.email,
      password: '',
      studentId: stu.studentId || '',
      schoolId: stu.schoolId?._id || stu.schoolId,
    });
    setShowEditModal(true);
  };

  const handleEdit = async e => {
    e.preventDefault();
    setFormError(null);
    try {
      const res = await api.put(`/api/student/admin/${editId}`, { ...form, schoolId: user.school._id });
      setShowEditModal(false);
      setForm(initialForm);
      setEditId(null);
      // Refresh students
      api.get('/api/student/admin')
        .then(res => {
          const data = res.data;
          setStudents(Array.isArray(data) ? data : (data.students || []));
        });
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update student');
    }
  };

  // Delete student
  const handleDelete = async () => {
    try {
      await api.delete(`/api/student/admin/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      // Refresh students
      api.get('/api/student/admin')
        .then(res => {
          const data = res.data;
          setStudents(Array.isArray(data) ? data : (data.students || []));
        });
    } catch {}
  };

  // Add the handleDeleteStudent function
  const handleDeleteStudent = async (studentId) => {
    try {
      await api.delete(`/api/student/admin/${studentId}`);
      // Refresh students
      const res = await api.get('/api/student/admin');
      setStudents(res.data.students || []);
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  // Filtered and searched students
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter ? s.classId === classFilter : true;
    return matchesSearch && matchesClass;
  });
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  if (userLoading) return <div>Loading user...</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

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

      <div className="max-w-6xl mx-auto py-8 relative z-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Student Management</h2>
        <button
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full p-4 shadow-xl hover:from-blue-800 hover:to-blue-600 transition flex items-center gap-2 text-lg font-semibold"
          onClick={() => { setShowAddModal(true); setForm(initialForm); }}
          title="Add Student"
        >
          <Plus className="w-6 h-6" />
          <span className="hidden md:inline">Add Student</span>
        </button>
      </div>
      {/* Search and Filter */}
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
        <select
          className="input w-48 rounded-lg"
          value={classFilter}
          onChange={e => { setClassFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Classes</option>
          {classes.map(cls => (
            <option key={cls._id} value={cls._id}>{cls.name} - {cls.section}</option>
          ))}
        </select>
      </div>
      {/* Table */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto border border-blue-100">
        <table className="min-w-full divide-y divide-blue-100">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white sticky top-0 z-10 rounded-t-2xl">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-2xl">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Class</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Student ID</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></td></tr>
            ) : (paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-blue-700">
                  <div className="flex flex-col items-center gap-2">
                    <UserX className="w-12 h-12 text-blue-300 mb-2" />
                    <span className="font-semibold text-lg">No students found.</span>
                    <span className="text-gray-400 text-sm">Try adjusting your search or filters.</span>
              </div>
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student, idx) => (
                <tr key={student._id} className={`transition group ${idx % 2 === 0 ? 'bg-blue-50/40' : 'bg-white' } hover:bg-blue-100/60`}>
                  <td className="px-4 py-3 font-medium text-blue-900 rounded-l-xl">{student.firstName} {student.lastName}</td>
                  <td className="px-4 py-3">{classes.find(cls => cls._id === student.classId)?.name || ''}</td>
                  <td className="px-4 py-3">{student.email}</td>
                  <td className="px-4 py-3">{student.phone}</td>
                  <td className="px-4 py-3">{student.studentId}</td>
                  <td className="px-4 py-3 text-center rounded-r-xl">
                    <button className="p-2 rounded-full hover:bg-blue-100 transition" title="Edit" onClick={() => { setEditId(student._id); setForm({ ...student }); setShowEditModal(true); }}>
                      <Edit className="w-5 h-5 text-blue-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-red-100 transition ml-2" title="Delete" onClick={() => { setDeleteId(student._id); setShowDeleteModal(true); }}>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="modal-dark rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="modal-close absolute top-3 right-3 text-2xl font-bold"
              onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
            >
              &times;
            </button>
            <h3 className="modal-title text-xl font-semibold mb-4">{showAddModal ? 'Add Student' : 'Edit Student'}</h3>
            <form onSubmit={showAddModal ? handleAdd : handleEdit} className="space-y-4">
              <div>
                <label className="label-dark block text-sm font-medium mb-1">First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="label-dark block text-sm font-medium mb-1">Student ID</label>
                <input name="studentId" value={form.studentId} onChange={handleChange} className="input-dark w-full rounded-lg px-3 py-2" />
              </div>
              {formError && <div className="text-red-400 text-sm">{formError}</div>}
              <button
                type="submit"
                className="btn-dark-primary w-full py-2 rounded-lg font-semibold flex items-center justify-center"
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="modal-dark rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="modal-close absolute top-3 right-3 text-2xl font-bold"
              onClick={() => setShowDeleteModal(false)}
            >
              &times;
            </button>
            <h3 className="modal-title text-xl font-semibold text-red-400 mb-4">Delete Student</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this student?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDelete}
                className="btn-dark-danger px-4 py-2 rounded-lg font-semibold"
              >Delete</button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-dark-secondary px-4 py-2 rounded-lg font-semibold"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

const Fieldset = ({ form, handleChange }) => (
  <>
    <div>
      <label>First Name: <input name="firstName" value={form.firstName} onChange={handleChange} required /></label>
    </div>
    <div>
      <label>Last Name: <input name="lastName" value={form.lastName} onChange={handleChange} required /></label>
    </div>
    <div>
      <label>Email: <input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
    </div>
    <div>
      <label>Password: <input name="password" type="password" value={form.password} onChange={handleChange} required /></label>
    </div>
    <div>
      <label>Student ID: <input name="studentId" value={form.studentId} onChange={handleChange} /></label>
    </div>
  </>
);

const modalStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalBoxStyle = { background: '#fff', padding: 24, borderRadius: 8, minWidth: 320 };

export default StudentManager; 