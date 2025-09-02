import React, { useEffect, useState } from 'react';
import { BarChart2, User, FileText, ArrowLeft, Download, TrendingUp, TrendingDown } from 'lucide-react';
// import Chart from 'chart.js/auto'; // For real charting, add later
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';

const StudentPerformance = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/teacher/students')
      .then(res => setStudents(res.data.students || []));
    api.get('/api/teacher/subjects')
      .then(res => setSubjects(res.data.subjects || []));
  }, [token]);

  useEffect(() => {
    if (!selectedStudent) return;
    setLoading(true);
    api.get(`/api/teacher/student-performance?studentId=${selectedStudent}${selectedSubject ? `&subjectId=${selectedSubject}` : ''}`)
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, [selectedStudent, selectedSubject, token]);

  // Export as CSV
  const handleExport = () => {
    if (!stats || !stats.trend) return;
    const rows = [
      ['Exam', 'Marks'],
      ...stats.trend.map(t => [t.exam, t.marks])
    ];
    const csvContent = rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_performance.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/dashboard?ai=true')}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-200 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <BarChart2 className="w-6 h-6 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Student Stock Performance</h1>
          </div>
          <p className="text-gray-300 text-lg">Track student performance with stock-style analytics.</p>
        </div>

        {/* Filters and Export */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="label-dark block text-sm font-semibold mb-2">Select Student</label>
              <select 
                className="select-dark w-full px-4 py-3 rounded-lg"
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
              >
                <option value="">Choose student</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="label-dark block text-sm font-semibold mb-2">Subject Filter</label>
              <select 
                className="select-dark w-full px-4 py-3 rounded-lg"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} (You)</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="btn-dark-danger flex items-center gap-2 font-semibold px-6 py-3 rounded-lg"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-300">Loading...</div>
          </div>
        ) : stats ? (
          <>
            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card-gold rounded-xl p-6 flex flex-col gap-2 shadow-lg border-t-4 border-yellow-400">
                <div className="text-xs text-yellow-300 font-bold">Current Score</div>
                <div className="text-3xl font-bold text-white">{stats.currentScore ?? '-'}</div>
              </div>
              {stats.classRank && (
                <div className="card-purple rounded-xl p-6 flex flex-col gap-2 shadow-lg border-t-4 border-purple-400">
                  <div className="text-xs text-purple-300 font-bold">Class Rank</div>
                  <div className="text-3xl font-bold text-white">{stats.classRank}</div>
                </div>
              )}
            </div>

            {/* Performance Trend Graph */}
            <div className="modal-dark rounded-xl shadow-lg p-6 mb-6 border-t-4 border-purple-400">
              <div className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
                <FileText /> Performance Trend (Stock View)
              </div>
              <div className="h-64 w-full">
                {stats.trend && stats.trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.trend.map(t => ({
                      name: t.exam || t.date?.slice(0,10) || '',
                      marks: t.marks
                    }))}>
                      <defs>
                        <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A445FF" stopOpacity={0.7}/>
                          <stop offset="100%" stopColor="#A445FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="marks"
                        stroke={false}
                        fill="url(#colorMarks)"
                        fillOpacity={1}
                      />
                      <Line
                        type="monotone"
                        dataKey="marks"
                        stroke="#A445FF"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#A445FF' }}
                        activeDot={{ r: 7, fill: '#A445FF' }}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-gray-400">No data</div>}
              </div>
            </div>

            {/* Subject-wise Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.subjectExamMarks && stats.subjectExamMarks.map(sub => {
                // Calculate total marks, total max marks, percentage, best/worst
                const totalMarks = sub.exams.reduce((sum, e) => sum + (e.marks || 0), 0);
                const totalMax = sub.exams.reduce((sum, e) => sum + (e.maxMarks || 0), 0);
                const percentage = totalMax ? ((totalMarks / totalMax) * 100).toFixed(2) : '-';
                // Find best exam (highest marks) and lowest exam (most marks lost)
                let bestIdx = -1, best = -Infinity;
                let worstIdx = -1, worstLoss = -Infinity;
                sub.exams.forEach((e, idx) => {
                  if (typeof e.marks === 'number') {
                    if (e.marks > best) { best = e.marks; bestIdx = idx; }
                    const loss = (e.maxMarks || 0) - (e.marks || 0);
                    if (loss > worstLoss) { worstLoss = loss; worstIdx = idx; }
                  }
                });
                const bestExam = bestIdx !== -1 ? sub.exams[bestIdx] : null;
                const worstExam = worstIdx !== -1 ? sub.exams[worstIdx] : null;
                return (
                  <div key={sub.name} className="modal-dark rounded-xl shadow-lg p-4 flex flex-col gap-4 border-t-4 border-purple-400">
                    <div className="font-semibold text-purple-300 mb-4 text-xl">{sub.name}</div>
                    <div className="w-full flex flex-row flex-wrap gap-4 items-stretch justify-center mb-6">
                      <div className="flex-shrink-0 w-56 card-purple rounded-2xl shadow-lg p-4 flex flex-col justify-center items-center">
                        <div className="text-lg text-purple-300 font-bold mb-2">Total Marks</div>
                        <div className="text-3xl font-extrabold text-white">{totalMarks}</div>
                      </div>
                      <div className="flex-shrink-0 w-56 card-purple rounded-2xl shadow-lg p-4 flex flex-col justify-center items-center">
                        <div className="text-lg text-purple-300 font-bold mb-2">Total Max Marks</div>
                        <div className="text-3xl font-extrabold text-white">{totalMax}</div>
                      </div>
                      <div className="flex-shrink-0 w-56 card-purple rounded-2xl shadow-lg p-4 flex flex-col justify-center items-center">
                        <div className="text-lg text-purple-300 font-bold mb-2">Percentage</div>
                        <div className="text-3xl font-extrabold text-white">{percentage}%</div>
                      </div>
                      {bestExam && (
                        <div className="flex-shrink-0 w-56 card-gold rounded-2xl shadow-lg p-4 flex flex-col justify-center items-center">
                          <div className="text-lg text-yellow-300 font-bold mb-2">Best Exam</div>
                          <div className="text-base text-yellow-200">{bestExam.exam}</div>
                          <div className="text-2xl font-extrabold text-white">{bestExam.maxMarks ? `${bestExam.marks}/${bestExam.maxMarks}` : bestExam.marks}</div>
                        </div>
                      )}
                      {worstExam && (
                        <div className="flex-shrink-0 w-56 bg-red-900/50 border border-red-500/30 rounded-2xl shadow-lg p-4 flex flex-col justify-center items-center">
                          <div className="text-lg text-red-300 font-bold mb-2">Lowest Exam</div>
                          <div className="text-base text-red-200">{worstExam.exam}</div>
                          <div className="text-2xl font-extrabold text-white">{worstExam.maxMarks ? `${worstExam.marks}/${worstExam.maxMarks}` : worstExam.marks}</div>
                          <div className="text-sm text-red-300 mt-1">Lost: {worstExam.maxMarks ? worstExam.maxMarks - worstExam.marks : '-'}</div>
                        </div>
                      )}
                    </div>
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left py-1 pr-4 text-purple-300">Exam</th>
                          <th className="text-left py-1 text-purple-300">Marks</th>
                          <th className="text-left py-1 text-purple-300">Exam Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sub.exams.map((exam, idx) => (
                          <tr key={idx} className={idx === bestIdx ? 'bg-green-900/30 font-bold text-green-200' : idx === worstIdx ? 'bg-red-900/30 text-red-200' : 'text-gray-300'}>
                            <td className="py-1 pr-4">{exam.exam}</td>
                            <td className="py-1">{exam.maxMarks ? `${exam.marks}/${exam.maxMarks}` : exam.marks}</td>
                            <td className="py-1">{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-300">Select a student to view performance data</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPerformance; 