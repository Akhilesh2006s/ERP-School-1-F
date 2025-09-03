import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

const statusColors = {
  present: 'bg-green-900/50 text-green-200 border border-green-500/30',
  absent: 'bg-red-900/50 text-red-200 border border-red-500/30',
};

const ClassSectionStudents = () => {
  const { classId, sectionId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSection = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/section/${sectionId}`);
        const sectionData = res.data.data.section;
        
        // The API should already populate classId with number and name
        console.log('Section data:', sectionData);
        
        setSection(sectionData);
        setStudents(sectionData.students || []);
      } catch (err) {
        setMessage('Failed to load section or students.');
      }
      setLoading(false);
    };
    fetchSection();
  }, [sectionId, token]);

  // Fetch attendance for this section and date
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get(`/api/attendance/section/${sectionId}?date=${date}`);
        if (res.data && res.data.attendance) {
          const attMap = {};
          res.data.attendance.students.forEach(a => {
            attMap[a.student] = a.status;
          });
          setAttendance(attMap);
        } else {
          setAttendance({});
        }
      } catch {
        setAttendance({});
      }
    };
    fetchAttendance();
  }, [sectionId, date, token]);

  const handleToggle = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        classId: String(classId),
        sectionId: String(sectionId),
        schoolId: user.schoolId,
        date,
        students: students.map(stu => ({
          student: stu._id,
          status: attendance[stu._id] || 'absent',
        })),
      };
      await api.post('/api/attendance/mark', payload);
      setMessage('Attendance saved!');
    } catch (err) {
      setMessage('Failed to save attendance.');
      if (err.response) {
        console.error('Attendance error:', err.response.data);
      } else {
        console.error('Attendance error:', err);
      }
    }
    setSaving(false);
  };

  // Attendance summary
  const presentCount = students.filter(stu => attendance[stu._id] === 'present').length;
  const absentCount = students.length - presentCount;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      
      <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-24 relative z-10">
      <button
        className="mb-6 flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-lg text-black font-semibold bg-white hover:bg-gray-100 transition shadow-sm"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h2 className="text-2xl font-bold mb-2 text-black">
        {section?.classId?.number ? `Class ${section.classId.number}` : section?.class?.number ? `Class ${section.class.number}` : 'Class'} - {section?.name} - Attendance
      </h2>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2">
          <label className="font-semibold text-black">Date:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white border-2 border-gray-400 rounded px-3 py-2 text-black focus:outline-none focus:border-gray-600" />
        </div>
        <div className="flex-1 flex items-center gap-4 justify-end">
          <span className="px-3 py-1 rounded-full bg-green-900/50 text-green-200 font-semibold border border-green-500/30">Present: {presentCount}</span>
          <span className="px-3 py-1 rounded-full bg-red-900/50 text-red-200 font-semibold border border-red-500/30">Absent: {absentCount}</span>
        </div>
      </div>
      {loading ? (
        <div className="p-8 text-center text-black text-lg font-semibold">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="p-8 text-center text-black text-lg font-semibold">No students in this section.</div>
      ) : (
        <div className="space-y-4 mb-12"> {/* Add extra margin below student list */}
          {students.map(stu => (
            <div key={stu._id} className="flex items-center justify-between bg-white rounded-xl shadow-lg p-4 border-2 border-gray-300 transition-all duration-200 hover:border-gray-400">
              <div>
                <div className="font-semibold text-lg text-black">{stu.firstName} {stu.lastName}</div>
                <div className="text-gray-700 text-sm">Roll: {stu.rollNo} | Email: {stu.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${statusColors[attendance[stu._id] || 'absent']}`}>{(attendance[stu._id] || 'absent').toUpperCase()}</span>
                <button
                  className={`px-4 py-2 rounded-l-lg font-semibold border transition-all duration-150 ${attendance[stu._id] === 'present' ? 'bg-green-600 text-white border-green-600' : 'bg-gray-200 text-black border-gray-400 hover:bg-green-100'}`}
                  onClick={() => handleToggle(stu._id, 'present')}
                  type="button"
                >
                  Present
                </button>
                <button
                  className={`px-4 py-2 rounded-r-lg font-semibold border transition-all duration-150 ${attendance[stu._id] === 'absent' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-200 text-black border-gray-400 hover:bg-red-100'}`}
                  onClick={() => handleToggle(stu._id, 'absent')}
                  type="button"
                >
                  Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-gray-900/90 to-gray-900/0 p-4 flex justify-center z-20 sm:static sm:bg-none sm:p-0">
        <button
          className="w-full max-w-xs py-3 text-lg font-bold rounded-xl shadow-lg transition-all duration-150 disabled:opacity-60 bg-gradient-to-r from-blue-600 to-blue-500 text-blue-900 hover:from-blue-500 hover:to-blue-400 border-2 border-blue-400"
          onClick={handleSubmit}
          disabled={saving || students.length === 0}
        >
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>
      {message && <div className={`mt-4 text-center text-lg font-semibold ${message.includes('saved') ? 'text-green-400' : 'text-red-400'}`}>{message}</div>}
      </div>
    </div>
  );
};

export default ClassSectionStudents; 