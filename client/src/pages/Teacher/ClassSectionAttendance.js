import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ClassSectionAttendance = () => {
  const { classId, sectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [section, setSection] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSection = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/section/${sectionId}`);
        setSection(res.data.section);
        setStudents(res.data.section.students || []);
      } catch (err) {
        setMessage('Failed to load section or students.');
      }
      setLoading(false);
    };
    fetchSection();
  }, [sectionId]);

  useEffect(() => {
    // Fetch attendance for this section and date
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`/api/attendance/section/${sectionId}?date=${date}`);
        if (res.data && res.data.attendance) {
          // attendance: [{ student: id, status: 'present'|'absent' }]
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
  }, [sectionId, date]);

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
        schoolId: user.schoolId, // Add schoolId from user context
        date,
        students: students.map(stu => ({
          student: stu._id,
          status: attendance[stu._id] || 'absent',
        })),
      };
      console.log('Submitting attendance payload:', payload); // Debug
      await axios.post('/api/attendance/mark', payload);
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

      <div className="max-w-3xl mx-auto p-6 relative z-10">
        <button className="mb-4 text-gray-800 hover:text-gray-600 hover:underline" onClick={() => navigate(-1)}>&larr; Back</button>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Attendance - {section?.class?.name} {section?.name}</h2>
      <div className="mb-4 flex gap-4 items-center">
        <label className="text-white">Date:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-dark" />
      </div>
      {loading ? (
        <div className="text-gray-300">Loading students...</div>
      ) : (
        <div className="space-y-4">
          {students.length === 0 ? <div className="text-gray-300">No students in this section.</div> : students.map(stu => (
            <div key={stu._id} className="flex items-center justify-between p-4 border border-purple-500/30 rounded-lg card-purple">
              <div>
                <div className="font-semibold text-white">{stu.firstName} {stu.lastName}</div>
                <div className="text-gray-300 text-sm">Roll: {stu.rollNo} | Email: {stu.email}</div>
              </div>
              <div>
                <select
                  value={attendance[stu._id] || 'absent'}
                  onChange={e => handleToggle(stu._id, e.target.value)}
                  className="select-dark"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        className="btn-dark-primary mt-6"
        onClick={handleSubmit}
        disabled={saving || students.length === 0}
      >
        {saving ? 'Saving...' : 'Submit Attendance'}
      </button>
      {message && <div className="mt-4 text-green-400">{message}</div>}
      </div>
    </div>
  );
};

export default ClassSectionAttendance; 