import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { CheckCircle, XCircle, DollarSign, Users, PlusCircle, Edit2 } from 'lucide-react';
import dayjs from 'dayjs';
import BrandingFooter from '../../components/common/BrandingFooter';

const FinanceDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [financeRecords, setFinanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalTeacher, setModalTeacher] = useState('');
  const [modalAmount, setModalAmount] = useState('');
  const [modalMonth, setModalMonth] = useState('');
  const [modalYear, setModalYear] = useState('');
  const [modalError, setModalError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('MMMM'));
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [years, setYears] = useState([currentYear]);

  // Fetch records for selected month/year
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/teacher/admin'),
      api.get(`/api/finance?month=${selectedMonth}&year=${selectedYear}`)
    ]).then(([teacherRes, financeRes]) => {
      setTeachers(teacherRes.data || []);
      const records = (financeRes.data.records || []).map(r => ({
        ...r,
        teacherName: r.teacher ? `${r.teacher.firstName} ${r.teacher.lastName}` : '',
        teacherEmail: r.teacher ? r.teacher.email : '',
      }));
      setFinanceRecords(records);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedMonth, selectedYear]);

  // Add year handler
  const handleAddYear = () => {
    const nextYear = Math.max(...years) + 1;
    setYears([...years, nextYear]);
  };

  // Summary calculations
  const totalTeachers = teachers.length;
  const totalSalaryAssigned = financeRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalSalaryPaid = financeRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalSalaryDue = financeRecords.filter(r => r.status !== 'paid').reduce((sum, r) => sum + (r.amount || 0), 0);

  // Modal handlers
  const openModal = (teacher = '', record = null) => {
    setModalTeacher(record ? record.teacher : teacher);
    setModalAmount(record ? record.amount : '');
    setModalMonth(record ? record.month : selectedMonth); // Use selectedMonth
    setModalYear(record ? record.year : selectedYear);    // Use selectedYear
    setModalError('');
    setShowModal(true);
  };
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!modalTeacher || !modalAmount || !modalMonth || !modalYear) {
      setModalError('All fields are required.');
      return;
    }
    try {
      await api.post('/api/finance/assign', {
        teacher: modalTeacher,
        amount: Number(modalAmount),
        month: modalMonth,
        year: modalYear
      });
      const financeRes = await api.get('/api/finance');
      setFinanceRecords(financeRes.data.records || []);
      setShowModal(false);
    } catch (err) {
      setModalError('Failed to assign salary.');
    }
  };
  // Mark salary as paid/unpaid
  const handleTogglePaid = async (recordId, paid) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/finance/${recordId}/set-paid`, { paid });
      const financeRes = await api.get('/api/finance');
      setFinanceRecords(financeRes.data.records || []);
    } catch {}
    setStatusLoading(false);
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

      <div className="py-8 relative z-10 max-w-7xl mx-auto">
        {/* Month/Year Dropdowns */}
        <div className="flex gap-4 mb-6 items-center">
          <label className="font-semibold text-gray-800">Month:</label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="input input-bordered rounded-lg">
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <label className="font-semibold text-gray-800">Year:</label>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="input input-bordered rounded-lg">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
              <h2 className="text-2xl font-bold text-purple-900 mb-6">Finance Management</h2>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <Users className="w-7 h-7 text-blue-700 mb-2" />
          <div className="text-2xl font-bold text-blue-700">{totalTeachers}</div>
          <div className="text-gray-800 font-medium">Total Teachers</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <DollarSign className="w-7 h-7 text-green-600 mb-2" />
          <div className="text-2xl font-bold text-green-600">₹{totalSalaryAssigned.toLocaleString()}</div>
          <div className="text-gray-800 font-medium">Total Salary Assigned</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <CheckCircle className="w-7 h-7 text-purple-700 mb-2" />
          <div className="text-2xl font-bold text-purple-700">₹{totalSalaryPaid.toLocaleString()}</div>
          <div className="text-gray-800 font-medium">Total Salary Paid</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <XCircle className="w-7 h-7 text-red-600 mb-2" />
          <div className="text-2xl font-bold text-red-600">₹{totalSalaryDue.toLocaleString()}</div>
          <div className="text-gray-800 font-medium">Total Salary Due</div>
        </div>
      </div>
      {/* Teachers Table */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Teachers</h3>
        <button
          className="bg-gradient-to-r from-green-600 to-green-400 text-white rounded-full p-3 shadow-xl hover:from-green-700 hover:to-green-500 transition flex items-center gap-2 text-lg font-semibold"
          onClick={() => openModal('')}
        >
          <PlusCircle className="w-5 h-5" /> Add Finance
        </button>
      </div>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Salary</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher._id} className="border-b">
                <td className="px-4 py-3 font-medium text-blue-900">{teacher.firstName} {teacher.lastName}</td>
                <td className="px-4 py-3">{teacher.email}</td>
                <td className="px-4 py-3">₹{teacher.salary || '-'}</td>
                <td className="px-4 py-3">
                  <button
                    className="px-3 py-1 rounded-lg font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1"
                    onClick={() => openModal(teacher._id)}
                  >
                    <Edit2 className="w-4 h-4" /> Edit Salary
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Finance Records Table */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Finance Records</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2">Teacher</th>
              <th className="px-4 py-2">Month</th>
              <th className="px-4 py-2">Year</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {financeRecords.map(record => (
              <tr key={record._id} className="border-b">
                <td className="px-4 py-3">{record.teacherName || '-'}</td>
                <td className="px-4 py-3">{record.month || '-'}</td>
                <td className="px-4 py-3">{record.year || '-'}</td>
                <td className="px-4 py-3">₹{record.amount || '-'}</td>
                <td className="px-4 py-3">
                  {record.status === 'paid' ? (
                    <span className="inline-flex items-center gap-1 text-green-700 font-semibold"><CheckCircle className="w-4 h-4" /> Paid</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 font-semibold"><XCircle className="w-4 h-4" /> Unpaid</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {record.status === 'paid' ? (
                    <button
                      className="px-3 py-1 rounded-lg font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                      onClick={() => handleTogglePaid(record._id, false)}
                      disabled={statusLoading}
                    >
                      Mark Unpaid
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 rounded-lg font-semibold bg-green-100 text-green-700 hover:bg-green-200"
                      onClick={() => handleTogglePaid(record._id, true)}
                      disabled={statusLoading}
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add/Edit Finance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">{modalTeacher ? 'Edit Salary' : 'Add Finance'}</h3>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  className="input input-bordered w-full rounded-lg"
                  value={modalTeacher}
                  onChange={e => setModalTeacher(e.target.value)}
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Amount (₹)</label>
                <input type="number" value={modalAmount} onChange={e => setModalAmount(e.target.value)} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <input type="text" value={modalMonth} onChange={e => setModalMonth(e.target.value)} required className="input input-bordered w-full rounded-lg" placeholder="e.g. January" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input type="number" value={modalYear} onChange={e => setModalYear(e.target.value)} required className="input input-bordered w-full rounded-lg" placeholder="e.g. 2025" />
                </div>
              </div>
              {modalError && <div className="text-red-600 text-sm">{modalError}</div>}
              <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center">Save</button>
            </form>
          </div>
        </div>
      )}
      
      <BrandingFooter />
    </div>
  </div>
  );
};

export default FinanceDashboard; 