import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';

const StudentAttendance = () => {
  const { user, token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/api/attendance/student/${user._id}`)
      .then(res => setRecords(res.data.attendance || []))
      .catch(() => setError('Failed to load attendance.'))
      .finally(() => setLoading(false));
  }, [user, token]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-4xl mx-auto p-8 relative z-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-900 flex items-center gap-3"><Calendar className="w-8 h-8 text-blue-700" /> My Attendance</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : records.length === 0 ? (
        <div className="text-gray-500">No attendance records found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead>
              <tr className="bg-blue-50">
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Date</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900"><BookOpen className="inline w-5 h-5 mr-1 text-blue-600" />Class</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900"><Users className="inline w-5 h-5 mr-1 text-purple-600" />Section</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, idx) => (
                <tr key={rec._id || idx} className="border-b">
                  <td className="py-2 px-4">{new Date(rec.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{user.class?.number || user.classId?.number || '-'}</td>
                  <td className="py-2 px-4">{user.section?.name || user.sectionId?.name || '-'}</td>
                  <td className="py-2 px-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-sm ${rec.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {rec.status === 'present' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentAttendance; 