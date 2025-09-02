import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, DollarSign, Calendar } from 'lucide-react';

const getAcademicYearOptions = (fees) => {
  const years = Array.from(new Set(fees.map(f => f.academicYear)));
  return years.sort().reverse();
};

const StudentFeeDashboard = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    api.get(`/api/fee?student=${user._id}`)
      .then(res => {
        setFees(res.data.fees || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?._id]);

  const allYears = getAcademicYearOptions(fees);
  const filteredFees = selectedYear ? fees.filter(f => f.academicYear === selectedYear) : fees;

  // Summary calculations
  const totalFeesAssigned = filteredFees.reduce((sum, f) => sum + (f.totalFee || 0), 0);
  const totalPaid = filteredFees.filter(f => f.status === 'completed').reduce((sum, f) => sum + (f.totalFee || 0), 0);
  const totalDues = filteredFees.filter(f => f.status !== 'completed').reduce((sum, f) => sum + (f.totalFee || 0), 0);
  const unpaidYears = filteredFees.filter(f => f.status !== 'completed').length;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="py-8 max-w-4xl mx-auto relative z-10">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">My Fees</h2>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <DollarSign className="w-7 h-7 text-green-600 mb-2" />
          <div className="text-2xl font-bold text-green-600">₹{totalFeesAssigned.toLocaleString()}</div>
          <div className="text-gray-600">Total Fees Assigned</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <CheckCircle className="w-7 h-7 text-purple-700 mb-2" />
          <div className="text-2xl font-bold text-purple-700">₹{totalPaid.toLocaleString()}</div>
          <div className="text-gray-600">Total Paid</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <XCircle className="w-7 h-7 text-red-600 mb-2" />
          <div className="text-2xl font-bold text-red-600">₹{totalDues.toLocaleString()}</div>
          <div className="text-gray-600">Total Dues</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <Calendar className="w-7 h-7 text-pink-600 mb-2" />
          <div className="text-2xl font-bold text-pink-600">{unpaidYears}</div>
          <div className="text-gray-600">Unpaid Years</div>
        </div>
      </div>
      {/* Academic Year Dropdown */}
      <div className="flex items-center gap-4 mb-4">
        <label className="font-semibold text-blue-900">Academic Year:</label>
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
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2">Academic Year</th>
              <th className="px-4 py-2">Fee Amount</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12"><span className="text-blue-600">Loading...</span></td></tr>
            ) : filteredFees.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-blue-700">No fee records found.</td></tr>
            ) : (
              filteredFees.map(fee => (
                <tr key={fee._id} className="border-b">
                  <td className="px-4 py-3">{fee.academicYear || '-'}</td>
                  <td className="px-4 py-3">₹{fee.totalFee || '-'}</td>
                  <td className="px-4 py-3">{fee.terms?.[0]?.dueDate ? new Date(fee.terms[0].dueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    {fee.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-green-700 font-semibold"><CheckCircle className="w-4 h-4" /> Paid</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 font-semibold"><XCircle className="w-4 h-4" /> Unpaid</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default StudentFeeDashboard; 