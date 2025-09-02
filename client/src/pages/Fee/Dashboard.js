import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, CheckCircle, XCircle, Users, DollarSign, Calendar, Loader2 } from 'lucide-react';

// Helper for academic year options
const getAcademicYearOptions = () => {
  const now = new Date();
  const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: 5 }, (_, i) => {
    const y1 = startYear + i;
    const y2 = (y1 + 1).toString().slice(-2);
    return { value: `${y1}-${y2}`, label: `${y1}-${y2}` };
  });
};

const FeeDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Remove the Add Student button and modal from the Fee Management page
  // Only display students fetched from /api/student/admin and allow fee assignment for those students
  const [studentForm, setStudentForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', classId: '', schoolId: '' });
  const [addingStudent, setAddingStudent] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [modalStudent, setModalStudent] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignStudent, setAssignStudent] = useState(null);
  const [assignFee, setAssignFee] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [statusLoading, setStatusLoading] = useState(false);

  // 1. Add state for modal
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeModalStudent, setFeeModalStudent] = useState(null);
  const [feeModalAmount, setFeeModalAmount] = useState('');
  const [feeModalDueDate, setFeeModalDueDate] = useState('');
  const [feeModalError, setFeeModalError] = useState('');
  const [feeModalYear, setFeeModalYear] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    if (!user?.school?._id) return;
    setLoading(true);
    Promise.all([
      api.get(`/student/admin?schoolId=${user.school._id}`),
      api.get('/api/fee')
    ]).then(([stuRes, feeRes]) => {
      setStudents(Array.isArray(stuRes.data) ? stuRes.data : (stuRes.data.students || []));
      setFees(feeRes.data.fees || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.school?._id]);

  // When a student is selected in the modal, auto-fill their details
  useEffect(() => {
    if (!selectedStudentId) {
      setModalStudent(null);
      return;
    }
    const stu = students.find(s => s._id === selectedStudentId);
    setModalStudent(stu || null);
  }, [selectedStudentId, students]);

  const getFeeForStudent = (studentId) => fees.find(f => f.student && f.student._id === studentId);

  // Refactor openAssignModal to set selectedStudent
  // Remove all modal and selectedStudent logic

  // Refactor handleAssign to use selectedStudent._id
  // Remove all modal and selectedStudent logic

  // Add student handler
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddingStudent(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/student/admin', studentForm);
      setStudentForm({ firstName: '', lastName: '', email: '', phone: '', password: '', classId: '', schoolId: '' });
      // Refresh students
      const stuRes = await api.get('/student/admin');
      setStudents(Array.isArray(stuRes.data) ? stuRes.data : (stuRes.data.students || []));
    } catch (err) {
      setError('Failed to add student');
    }
    setAddingStudent(false);
  };

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return;
    try {
      await api.delete(`/api/fee/${feeId}`);
      const feeRes = await api.get('/api/fee');
      setFees(feeRes.data.fees || []);
    } catch (err) {
      alert('Failed to delete fee');
    }
  };
  const handleTogglePaid = async (feeId, paid) => {
    try {
      setStatusLoading(true);
      await api.patch(`/api/fee/${feeId}/set-paid`, { paid });
      const feeRes = await api.get('/api/fee');
      setFees(feeRes.data.fees || []);
      setStatusLoading(false);
      setSuccess('Status updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setStatusLoading(false);
      setError('Failed to update paid status');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This will remove all their data.')) return;
    try {
      await api.delete(`/student/admin/${studentId}`);
      // Refresh students and fees
      const stuRes = await api.get(`/student/admin?schoolId=${user.school._id}`);
      setStudents(Array.isArray(stuRes.data) ? stuRes.data : (stuRes.data.students || []));
      const feeRes = await api.get('/api/fee');
      setFees(feeRes.data.fees || []);
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  // Add handlers for fee input change
  const handleFeeInputChange = async (student, feeValue, dueDateValue) => {
    // Defensive: Only send if both fee and due date are present and valid
    if (!feeValue || isNaN(Number(feeValue)) || Number(feeValue) <= 0) {
      setError('Please enter a valid fee amount.');
      return;
    }
    if (!dueDateValue) {
      setError('Please select a due date.');
      return;
    }
    const fee = getFeeForStudent(student._id);
    const payload = {
      student: student._id,
      classId: student.classId,
      schoolId: student.schoolId,
      academicYear: '2024-25',
      feeStructure: { tuitionFee: Number(feeValue) },
      totalFee: Number(feeValue),
      terms: [{ termName: 'Annual', dueDate: dueDateValue, amount: Number(feeValue) }]
    };
    try {
      if (fee) {
        await api.put(`/api/fee/${fee._id}`, payload);
      } else {
        await api.post('/api/fee/assign', payload);
      }
      // Refresh fees
      const feeRes = await api.get('/api/fee');
      setFees(feeRes.data.fees || []);
      setError('');
    } catch (err) {
      setError('Failed to update fee');
    }
  };

  // Add handler for Assign button
  const handleAssignFeePrompt = async (student) => {
    const feeValue = window.prompt('Enter fee amount (₹):');
    if (!feeValue || isNaN(Number(feeValue)) || Number(feeValue) <= 0) {
      setError('Please enter a valid fee amount.');
      return;
    }
    const dueDateValue = window.prompt('Enter due date (YYYY-MM-DD):');
    if (!dueDateValue) {
      setError('Please enter a due date.');
      return;
    }
    const payload = {
      student: student._id,
      classId: student.classId,
      schoolId: student.schoolId,
      academicYear: '2024-25',
      feeStructure: { tuitionFee: Number(feeValue) },
      totalFee: Number(feeValue),
      terms: [{ termName: 'Annual', dueDate: dueDateValue, amount: Number(feeValue) }]
    };
    try {
      await api.post('/api/fee/assign', payload);
      const feeRes = await api.get('/api/fee');
      setFees(feeRes.data.fees || []);
      setError('');
    } catch (err) {
      setError('Failed to assign fee');
    }
  };

  // 2. Open modal for assign/edit
  const openFeeModal = (student, fee) => {
    setFeeModalStudent(student);
    setFeeModalAmount(fee?.totalFee || '');
    setFeeModalDueDate(fee?.terms?.[0]?.dueDate ? fee.terms[0].dueDate.substring(0,10) : '');
    setFeeModalYear(fee?.academicYear || getAcademicYearOptions()[0].value);
    setFeeModalError('');
    setShowFeeModal(true);
  };

  // 3. Handle modal submit
  const handleFeeModalSubmit = async (e) => {
    e.preventDefault();
    setFeeModalError('');
    if (!feeModalAmount || isNaN(Number(feeModalAmount)) || Number(feeModalAmount) <= 0) {
      setFeeModalError('Please enter a valid fee amount.');
      return;
    }
    if (!feeModalDueDate) {
      setFeeModalError('Please select a due date.');
      return;
    }
    if (!feeModalYear) {
      setFeeModalError('Please select an academic year.');
      return;
    }
    const payload = {
      student: feeModalStudent._id,
      classId: feeModalStudent.classId,
      schoolId: feeModalStudent.schoolId,
      academicYear: feeModalYear,
      feeStructure: { tuitionFee: Number(feeModalAmount) },
      totalFee: Number(feeModalAmount),
      terms: [{ termName: 'Annual', dueDate: feeModalDueDate, amount: Number(feeModalAmount) }]
    };
    try {
      const fee = fees.find(f => f.student && f.student._id === feeModalStudent._id && f.academicYear === feeModalYear);
      if (fee) {
        await api.put(`/fee/${fee._id}`, payload);
      } else {
        await api.post('/fee/assign', payload);
      }
      const feeRes = await api.get('/fee');
      setFees(feeRes.data.fees || []);
      setShowFeeModal(false);
      setFeeModalStudent(null);
      setFeeModalAmount('');
      setFeeModalDueDate('');
      setFeeModalYear('');
      setFeeModalError('');
      setSuccess('Fee assigned/updated successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setFeeModalError('Failed to assign/update fee');
    }
  };

  // 4. Mark as Paid/Unpaid button
  const handleSetPaidStatus = async (feeId, paid) => {
    try {
      setStatusLoading(true);
      await api.patch(`/fee/${feeId}/set-paid`, { paid });
      const feeRes = await api.get('/fee');
      setFees(feeRes.data.fees || []);
      setStatusLoading(false);
      setSuccess('Status updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setStatusLoading(false);
      setError('Failed to update paid status');
    }
  };

  const openAssignModal = (student) => {
    setAssignStudent(student);
    const fee = getFeeForStudent(student._id);
    setAssignFee(fee?.feeStructure?.tuitionFee || '');
    setAssignDueDate(fee?.terms?.[0]?.dueDate ? fee.terms[0].dueDate.substring(0,10) : '');
    setShowAssignModal(true);
  };

  const handleAssignFeeModal = async (e) => {
    e.preventDefault();
    if (!assignFee || isNaN(Number(assignFee)) || Number(assignFee) <= 0) {
      setError('Please enter a valid fee amount.');
      return;
    }
    if (!assignDueDate) {
      setError('Please enter a due date.');
      return;
    }
    if (!assignStudent.classId) {
      setError('This student does not have a class assigned. Please assign a class in Student Management.');
      return;
    }
    const payload = {
      student: assignStudent._id,
      classId: assignStudent.classId,
      schoolId: assignStudent.schoolId,
      academicYear: '2024-25',
      feeStructure: { tuitionFee: Number(assignFee) },
      totalFee: Number(assignFee),
      terms: [{ termName: 'Annual', dueDate: assignDueDate, amount: Number(assignFee) }]
    };
    console.log('Assign Fee Payload:', payload);
    try {
      await api.post('/fee/assign', payload);
      const feeRes = await api.get('/fee');
      setFees(feeRes.data.fees || []);
      setShowAssignModal(false);
      setAssignStudent(null);
      setAssignFee('');
      setAssignDueDate('');
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to assign fee');
    }
  };

  // Get all unique years from fees
  const allYears = Array.from(new Set(fees.map(f => f.academicYear))).sort().reverse();
  // Filter fees by selected year
  const filteredFees = selectedYear ? fees.filter(f => f.academicYear === selectedYear) : fees;
  // Update summary calculations to use filteredFees
  const totalStudents = new Set(filteredFees.map(f => f.student?._id)).size;
  const totalFeesAssigned = filteredFees.reduce((sum, f) => sum + (f.totalFee || 0), 0);
  const totalCollected = filteredFees.filter(f => f.status === 'completed').reduce((sum, f) => sum + (f.totalFee || 0), 0);
  const totalDues = filteredFees.filter(f => f.status !== 'completed').reduce((sum, f) => sum + (f.totalFee || 0), 0);
  const unpaidCount = filteredFees.filter(f => f.status !== 'completed').length;

  if (loading) return <div className="p-4">Loading...</div>;

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

      <div className="py-8 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Fee Management</h1>
        <p className="text-gray-600 mb-6">Manage student fees, payments, and financial records</p>
              {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center hover:scale-105 transition shadow-lg border border-white/50">
            <Users className="w-7 h-7 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">{totalStudents}</div>
            <div className="text-purple-600">Total Students</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center hover:scale-105 transition shadow-lg border border-white/50">
            <DollarSign className="w-7 h-7 text-yellow-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">₹{totalFeesAssigned.toLocaleString()}</div>
            <div className="text-yellow-600">Total Fees Assigned</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center hover:scale-105 transition shadow-lg border border-white/50">
            <CheckCircle className="w-7 h-7 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">₹{totalCollected.toLocaleString()}</div>
            <div className="text-green-600">Total Collected</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center hover:scale-105 transition shadow-lg border border-white/50">
            <XCircle className="w-7 h-7 text-red-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">₹{totalDues.toLocaleString()}</div>
            <div className="text-red-600">Total Dues</div>
          </div>
        </div>
              {/* Academic Year Dropdown */}
        <div className="flex items-center gap-4 mb-4">
          <label className="font-semibold text-gray-800">Academic Year:</label>
        <select
          className="input input-bordered rounded-lg"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
        >
          <option value="">All Years</option>
          {allYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
              {/* Student Fees Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50">
          <thead>
            <tr>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Class</th>
              <th className="px-4 py-2">Academic Year</th>
              <th className="px-4 py-2">Fee Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></td></tr>
            ) : filteredFees.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-blue-700">No fee records found.</td></tr>
            ) : (
              filteredFees.map(fee => (
                <tr key={fee._id} className="border-b">
                  <td className="px-4 py-3 font-medium text-blue-900">{fee.student?.firstName} {fee.student?.lastName}</td>
                  <td className="px-4 py-3">{fee.classId?.name || ''}</td>
                  <td className="px-4 py-3">{fee.academicYear || '-'}</td>
                  <td className="px-4 py-3">₹{fee.totalFee || '-'}</td>
                  <td className="px-4 py-3">
                    {fee.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-green-700 font-semibold"><CheckCircle className="w-4 h-4" /> Paid</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 font-semibold"><XCircle className="w-4 h-4" /> Unpaid</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {fee.status === 'completed' ? (
                      <button
                        className="px-3 py-1 rounded-lg font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                        onClick={() => handleTogglePaid(fee._id, false)}
                        disabled={statusLoading}
                      >
                        Mark Unpaid
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded-lg font-semibold bg-green-100 text-green-700 hover:bg-green-200"
                        onClick={() => handleTogglePaid(fee._id, true)}
                        disabled={statusLoading}
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      className="px-3 py-1 rounded-lg font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1"
                      onClick={() => openFeeModal(fee.student, fee)}
                    >
                      Edit Fee
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Assign Fee Modal */}
      {showAssignModal && assignStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => { setShowAssignModal(false); setAssignStudent(null); }}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Assign Fee</h3>
            <form onSubmit={handleAssignFeeModal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <div className="font-semibold">{assignStudent.firstName} {assignStudent.lastName} ({assignStudent.email}, {assignStudent.phone})</div>
                <div className="text-xs text-gray-500">Student ID: {assignStudent.studentId}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount (₹)</label>
                <input type="number" value={assignFee} onChange={e => setAssignFee(e.target.value)} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={assignDueDate} onChange={e => setAssignDueDate(e.target.value)} required className="input input-bordered w-full rounded-lg" />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center">Save</button>
            </form>
          </div>
        </div>
      )}
      {/* Fee Modal */}
      {showFeeModal && feeModalStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowFeeModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Edit Fee</h3>
            <form onSubmit={handleFeeModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <div className="font-semibold">{feeModalStudent.firstName} {feeModalStudent.lastName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <select
                  className="input input-bordered w-full rounded-lg"
                  value={feeModalYear}
                  onChange={e => setFeeModalYear(e.target.value)}
                  required
                >
                  <option value="">Select Year</option>
                  {getAcademicYearOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount (₹)</label>
                <input type="number" value={feeModalAmount} onChange={e => setFeeModalAmount(e.target.value)} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={feeModalDueDate} onChange={e => setFeeModalDueDate(e.target.value)} required className="input input-bordered w-full rounded-lg" />
              </div>
              {feeModalError && <div className="text-red-600 text-sm">{feeModalError}</div>}
              <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center">Save</button>
            </form>
          </div>
        </div>
      )}
      {success && <div className="mt-4 text-green-600 font-semibold">{success}</div>}
      {/* Remove Add Student modal code */}
    </div>
    </div>
  );
};

export default FeeDashboard; 