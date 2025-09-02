import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, BookOpen, User, Calendar, CheckCircle, XCircle, Search, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const initialForm = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  copies: 1,
  available: 1,
};

const LibraryDashboard = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const [summary, setSummary] = useState({ totalBooks: 0, booksIssued: 0, overdueBooks: 0 });
  const [books, setBooks] = useState([]);
  const [recent, setRecent] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [editError, setEditError] = useState(null);
  const [editing, setEditing] = useState(false);
  // Add state for issue modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [issueForm, setIssueForm] = useState({ bookId: '', userId: '', dueDate: '' });
  const [issueError, setIssueError] = useState(null);
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  // Fetch students for issue modal
  useEffect(() => {
    if (!showIssueModal) return;
          api.get('/api/users?role=student').then(res => {
      // Ensure students is always an array
      const users = res.data?.data?.users || [];
      setStudents(users);
    });
  }, [showIssueModal]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, booksRes, recentRes] = await Promise.all([
        api.get('/api/library/summary'),
        api.get('/api/library/catalog'),
        api.get('/api/library/recently-issued'),
      ]);
      setSummary(summaryRes.data || {});
      setBooks(booksRes.data || []);
      setRecent(recentRes.data || []);
    } catch {
      setSummary({ totalBooks: 0, booksIssued: 0, overdueBooks: 0 });
      setBooks([]);
      setRecent([]);
    }
    setLoading(false);
  };

  const filteredBooks = books.filter(book => {
    const q = search.toLowerCase();
    return (
      book.title?.toLowerCase().includes(q) ||
      book.author?.toLowerCase().includes(q) ||
      book.isbn?.toLowerCase().includes(q) ||
      book.category?.toLowerCase().includes(q)
    );
  });

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'copies' || name === 'available') {
      setForm({ ...form, [name]: value === '' ? 1 : Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAdd = async e => {
    e.preventDefault();
    setFormError(null);
    setAdding(true);
    try {
      await api.post('/api/library/catalog', form); // You may need to change this to /api/library/books if that's your POST endpoint
      setShowAddModal(false);
      setForm(initialForm);
      fetchAll();
    } catch (err) {
      setFormError('Failed to add book');
    }
    setAdding(false);
  };

  const openEditModal = (book) => {
    setEditForm({ title: book.title, isbn: book.isbn, category: book.category });
    setEditId(book._id);
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEdit = async e => {
    e.preventDefault();
    setEditError(null);
    setEditing(true);
    try {
      await api.put(`/library/catalog/${editId}`, editForm);
      setShowEditModal(false);
      setEditId(null);
      fetchAll();
    } catch (err) {
      setEditError('Failed to update book');
    }
    setEditing(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.delete(`/library/catalog/${id}`);
      fetchAll();
    } catch (err) {
      alert('Failed to delete book');
    }
  };

  const handleIssueChange = e => {
    setIssueForm({ ...issueForm, [e.target.name]: e.target.value });
  };

  const handleIssue = async e => {
    e.preventDefault();
    setIssueError(null);
    setIssuing(true);
    try {
      await api.post('/api/library/issue', issueForm);
      setShowIssueModal(false);
      setIssueForm({ bookId: '', userId: '', dueDate: '' });
      fetchAll();
    } catch (err) {
      setIssueError('Failed to issue book');
    }
    setIssuing(false);
  };

  const handleReturn = async (txn) => {
    try {
      await api.post('/api/library/return', { bookId: txn.book._id, userId: txn.user._id });
      fetchAll();
    } catch (err) {
      alert('Failed to return book');
    }
  };

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

      <div className="p-4 max-w-7xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Library</h1>
        <p className="text-gray-600 mb-6">{isStudent ? 'Browse available books and view your issued books.' : 'Manage books, track issues, and monitor library activities'}</p>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card-purple rounded-xl p-4 flex flex-col items-center hover:scale-105 transition">
          <BookOpen className="w-7 h-7 text-purple-300 mb-2" />
          <div className="text-2xl font-bold text-white">{summary.totalBooks}</div>
          <div className="text-purple-200">Total Books</div>
        </div>
        <div className="card-gold rounded-xl p-4 flex flex-col items-center hover:scale-105 transition">
          <CheckCircle className="w-7 h-7 text-yellow-300 mb-2" />
          <div className="text-2xl font-bold text-white">{summary.booksIssued}</div>
          <div className="text-yellow-200">Books Issued</div>
        </div>
        <div className="card-purple rounded-xl p-4 flex flex-col items-center hover:scale-105 transition">
          <XCircle className="w-7 h-7 text-purple-300 mb-2" />
          <div className="text-2xl font-bold text-white">{summary.overdueBooks}</div>
          <div className="text-purple-200">Overdue Books</div>
        </div>
      </div>
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-purple-400" />
          <input
            type="text"
            placeholder="Search books by title, author, ISBN, or category..."
            className="input input-bordered w-full md:w-1/2 rounded-lg pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Hide Add/Issue buttons for students */}
        {!isStudent && (
          <div className="fixed bottom-8 right-8 z-50 flex flex-col md:flex-row gap-3">
            <button className="bg-gradient-to-r from-green-700 to-green-500 text-white rounded-full p-4 shadow-xl hover:from-green-800 hover:to-green-600 transition flex items-center gap-2 text-lg font-semibold" onClick={() => setShowIssueModal(true)}>
              <User className="w-6 h-6" />
              <span className="hidden md:inline">Issue Book</span>
            </button>
            <button className="bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-full p-4 shadow-xl hover:from-purple-800 hover:to-purple-600 transition flex items-center gap-2 text-lg font-semibold" onClick={() => setShowAddModal(true)}>
              <Plus className="w-6 h-6" />
              <span className="hidden md:inline">Add Book</span>
            </button>
          </div>
        )}
      </div>
      {/* Books Table */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto border border-purple-100 mb-8">
        <table className="min-w-full divide-y divide-purple-100">
          <thead className="bg-gradient-to-r from-purple-500 to-purple-700 text-white sticky top-0 z-10 rounded-t-2xl">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-2xl">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Author</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">ISBN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Copies</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Available</th>
              {/* Hide Actions column for students */}
              {!isStudent && <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-2xl">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isStudent ? 6 : 7} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" /></td></tr>
            ) : filteredBooks.length === 0 ? (
              <tr>
                <td colSpan={isStudent ? 6 : 7} className="text-center py-16 text-purple-700">
                  <div className="flex flex-col items-center gap-2">
                    <BookOpen className="w-12 h-12 text-purple-300 mb-2" />
                    <span className="font-semibold text-lg">No books found.</span>
                    <span className="text-gray-400 text-sm">Try adjusting your search.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBooks.map((book, idx) => (
                <tr key={book._id} className={`transition group ${idx % 2 === 0 ? 'bg-purple-50/40' : 'bg-white' } hover:bg-purple-100/60`}>
                  <td className="px-4 py-3 font-medium text-purple-900 rounded-l-xl">{book.title}</td>
                  <td className="px-4 py-3">{book.author}</td>
                  <td className="px-4 py-3">{book.isbn}</td>
                  <td className="px-4 py-3">{book.category}</td>
                  <td className="px-4 py-3">{book.copies}</td>
                  <td className="px-4 py-3">{book.available}</td>
                  {/* Hide Actions for students */}
                  {!isStudent && <td className="px-4 py-3 text-center rounded-r-xl">
                    <button className="p-2 rounded-full hover:bg-red-100 transition ml-2" title="Delete" onClick={() => handleDelete(book._id)}>
                      <XCircle className="w-5 h-5 text-red-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-blue-100 transition ml-2" title="Edit" onClick={() => openEditModal(book)}>
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </button>
                  </td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Issued Books Table for students only */}
      {isStudent && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto border border-green-100 mb-8">
          <h2 className="text-xl font-semibold mb-4 px-4 pt-4">My Issued Books</h2>
          <StudentIssuedBooks />
        </div>
      )}
      {/* Recently Issued Books Table for admin/teacher only */}
      {!isStudent && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto border border-green-100 mb-8">
          <h2 className="text-xl font-semibold mb-4 px-4 pt-4">Recently Issued Books</h2>
          <table className="min-w-full divide-y divide-green-100">
            <thead className="bg-gradient-to-r from-green-500 to-green-700 text-white sticky top-0 z-10 rounded-t-2xl">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-2xl">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Book</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Issued</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Due</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Returned</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-green-700">No recent issues.</td>
                </tr>
              ) : (
                recent.map((txn, idx) => (
                  <tr key={txn._id} className={`transition group ${idx % 2 === 0 ? 'bg-green-50/40' : 'bg-white' } hover:bg-green-100/60`}>
                    <td className="px-4 py-3 font-medium text-green-900 rounded-l-xl">{txn.user?.firstName} {txn.user?.lastName}</td>
                    <td className="px-4 py-3">{txn.book?.title}</td>
                    <td className="px-4 py-3">{txn.date ? new Date(txn.date).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">{txn.dueDate ? new Date(txn.dueDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">{txn.returnedAt ? new Date(txn.returnedAt).toLocaleDateString() : <span className="text-red-500">Not Returned</span>}</td>
                    <td className="px-4 py-3 text-center rounded-r-xl">
                      {!txn.returnedAt && (
                        <button className="p-2 rounded-full hover:bg-green-100 transition ml-2" title="Return Book" onClick={() => handleReturn(txn)}>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Hide all modals for students */}
      {!isStudent && (
        <>
          {/* Add Book Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="modal-dark rounded-2xl shadow-xl p-8 w-full max-w-md relative">
                <button
                  className="modal-close absolute top-3 right-3 text-2xl font-bold"
                  onClick={() => setShowAddModal(false)}
                >
                  &times;
                </button>
                <h3 className="modal-title text-xl font-semibold mb-4">Add Book</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="label-dark block text-sm font-medium mb-1">Book Name</label>
                    <input name="title" value={form.title} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="label-dark block text-sm font-medium mb-1">Author</label>
                    <input name="author" value={form.author} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="label-dark block text-sm font-medium mb-1">Book ID (ISBN)</label>
                    <input name="isbn" value={form.isbn} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="label-dark block text-sm font-medium mb-1">Book Type</label>
                    <input name="category" value={form.category} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="label-dark block text-sm font-medium mb-1">Copies</label>
                    <input name="copies" type="number" min="1" value={form.copies} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="label-dark block text-sm font-medium mb-1">Available</label>
                    <input name="available" type="number" min="1" value={form.available} onChange={handleChange} required className="input-dark w-full rounded-lg px-3 py-2" />
                  </div>
                  {formError && <div className="text-red-400 text-sm">{formError}</div>}
                  <button
                    type="submit"
                    className="btn-dark-primary w-full py-2 rounded-lg font-semibold flex items-center justify-center"
                    disabled={adding}
                  >
                    {adding ? 'Adding...' : 'Add Book'}
                  </button>
                </form>
              </div>
            </div>
          )}
          {/* Edit Book Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
                  onClick={() => setShowEditModal(false)}
                >
                  &times;
                </button>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Edit Book</h3>
                <form onSubmit={handleEdit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Book Name</label>
                    <input name="title" value={editForm.title} onChange={handleEditChange} required className="input input-bordered w-full rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Book ID (ISBN)</label>
                    <input name="isbn" value={editForm.isbn} onChange={handleEditChange} required className="input input-bordered w-full rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Book Type</label>
                    <input name="category" value={editForm.category} onChange={handleEditChange} required className="input input-bordered w-full rounded-lg" />
                  </div>
                  {editError && <div className="text-red-600 text-sm">{editError}</div>}
                  <button
                    type="submit"
                    className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center justify-center"
                    disabled={editing}
                  >
                    {editing ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}
          {/* Issue Book Modal */}
          {showIssueModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
                  onClick={() => setShowIssueModal(false)}
                >
                  &times;
                </button>
                <h3 className="text-xl font-semibold text-green-900 mb-4">Issue Book</h3>
                <form onSubmit={handleIssue} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                    <select name="bookId" value={issueForm.bookId} onChange={handleIssueChange} required className="input input-bordered w-full rounded-lg">
                      <option value="">Select Book</option>
                      {books.filter(b => b.available === undefined || b.available > 0).map(b => (
                        <option key={b._id} value={b._id}>{b.title} ({b.isbn})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select name="userId" value={issueForm.userId} onChange={handleIssueChange} required className="input input-bordered w-full rounded-lg">
                      <option value="">Select Student</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input type="date" name="dueDate" value={issueForm.dueDate} onChange={handleIssueChange} required className="input input-bordered w-full rounded-lg" />
                  </div>
                  {issueError && <div className="text-red-600 text-sm">{issueError}</div>}
                  <button
                    type="submit"
                    className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-800 transition flex items-center justify-center"
                    disabled={issuing}
                  >
                    {issuing ? 'Issuing...' : 'Issue Book'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>
  );
};

// StudentIssuedBooks component: fetches and displays only the logged-in student's issued/returned books
const StudentIssuedBooks = () => {
  const { user, token } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
            api.get(`/api/library/transactions?userId=${user._id}`)
      .then(res => setBooks(res.data || []))
      .catch(() => setError('Failed to load issued books.'))
      .finally(() => setLoading(false));
  }, [user, token]);
  if (loading) return <div className="text-blue-600 p-4">Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (books.length === 0) return <div className="text-gray-500 p-4">No books issued.</div>;
  return (
    <table className="min-w-full divide-y divide-green-100">
      <thead className="bg-gradient-to-r from-green-500 to-green-700 text-white sticky top-0 z-10 rounded-t-2xl">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-2xl">Book</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Issued</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Due</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Returned</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody>
        {books.map((txn, idx) => (
          <tr key={txn._id} className={idx % 2 === 0 ? 'bg-green-50/40' : 'bg-white'}>
            <td className="px-4 py-3 font-medium text-green-900">{txn.book?.title}</td>
            <td className="px-4 py-3">{txn.date ? new Date(txn.date).toLocaleDateString() : '-'}</td>
            <td className="px-4 py-3">{txn.dueDate ? new Date(txn.dueDate).toLocaleDateString() : '-'}</td>
            <td className="px-4 py-3">{txn.returnedAt ? new Date(txn.returnedAt).toLocaleDateString() : <span className="text-red-500">Not Returned</span>}</td>
            <td className="px-4 py-3">
              {txn.returnedAt ? (
                <span className="text-green-600 font-semibold">Returned</span>
              ) : new Date(txn.dueDate) < new Date() ? (
                <span className="text-red-600 font-semibold">Overdue</span>
              ) : (
                <span className="text-blue-600 font-semibold">Issued</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LibraryDashboard; 
