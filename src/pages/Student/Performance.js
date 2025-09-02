import React, { useEffect, useState } from 'react';
import { BarChart2, FileText } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';

const StudentPerformancePage = () => {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch subjects for the student
    api.get('/api/student/subjects')
      .then(res => setSubjects(res.data.subjects || []));
  }, [token]);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/student/performance${selectedSubject ? `?subjectId=${selectedSubject}` : ''}`)
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, [selectedSubject, token]);

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
    a.download = 'performance_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-5xl mx-auto p-8 relative z-10">
      <h1 className="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <BarChart2 className="text-blue-700" /> My Performance
      </h1>
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1 text-blue-800">Filter by Subject</label>
          <select className="input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-semibold h-12 px-6 rounded-full shadow transition text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleExport}
        >
          Export Report
        </button>
      </div>
      {loading ? <div>Loading...</div> : stats && (
        <>
          <div className="bg-white rounded-xl shadow p-6 mb-6 border-t-4 border-blue-200">
            <div className="font-semibold mb-2 text-blue-700 flex items-center gap-2"><FileText /> Performance Trend</div>
            <div className="h-64 w-full">
              {stats.trend && stats.trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trend.map(t => ({
                    name: t.exam || t.date?.slice(0,10) || '',
                    marks: t.marks
                  }))}>
                    <defs>
                      <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.7}/>
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="marks" stroke={false} fill="url(#colorMarks)" fillOpacity={1} />
                    <Line type="monotone" dataKey="marks" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: '#2563eb' }} activeDot={{ r: 7, fill: '#2563eb' }} isAnimationActive={true} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-gray-400">No data</div>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.subjectExamMarks && stats.subjectExamMarks.map(sub => {
                const totalMarks = sub.exams.reduce((sum, e) => sum + (e.marks || 0), 0);
                const totalMax = sub.exams.reduce((sum, e) => sum + (e.maxMarks || 0), 0);
                const percentage = totalMax ? ((totalMarks / totalMax) * 100).toFixed(2) : '-';
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
                <div key={sub.name} className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 border-t-4 border-blue-200">
                <div className="font-semibold text-blue-800 mb-4 text-xl">{sub.name}</div>
                <div className="w-full flex flex-row flex-wrap gap-4 items-stretch justify-center mb-6">
                  <div className="flex-shrink-0 w-56 bg-blue-50 rounded-2xl shadow p-4 flex flex-col justify-center items-center">
                    <div className="text-lg text-blue-700 font-bold mb-2">Total Marks</div>
                    <div className="text-3xl font-extrabold text-blue-900">{totalMarks}</div>
                  </div>
                  <div className="flex-shrink-0 w-56 bg-blue-50 rounded-2xl shadow p-4 flex flex-col justify-center items-center">
                    <div className="text-lg text-blue-700 font-bold mb-2">Total Max Marks</div>
                    <div className="text-3xl font-extrabold text-blue-900">{totalMax}</div>
                  </div>
                  <div className="flex-shrink-0 w-56 bg-blue-50 rounded-2xl shadow p-4 flex flex-col justify-center items-center">
                    <div className="text-lg text-blue-700 font-bold mb-2">Percentage</div>
                    <div className="text-3xl font-extrabold text-blue-900">{percentage}%</div>
                  </div>
                  {bestExam && (
                    <div className="flex-shrink-0 w-56 bg-green-100 rounded-2xl shadow p-4 flex flex-col justify-center items-center">
                      <div className="text-lg text-green-700 font-bold mb-2">Best Exam</div>
                      <div className="text-base text-green-900">{bestExam.exam}</div>
                      <div className="text-2xl font-extrabold text-green-900">{bestExam.maxMarks ? `${bestExam.marks}/${bestExam.maxMarks}` : bestExam.marks}</div>
                    </div>
                  )}
                  {worstExam && (
                    <div className="flex-shrink-0 w-56 bg-red-100 rounded-2xl shadow p-4 flex flex-col justify-center items-center">
                      <div className="text-lg text-red-700 font-bold mb-2">Lowest Exam</div>
                      <div className="text-base text-red-900">{worstExam.exam}</div>
                      <div className="text-2xl font-extrabold text-red-900">{worstExam.maxMarks ? `${worstExam.marks}/${worstExam.maxMarks}` : worstExam.marks}</div>
                      <div className="text-sm text-red-700 mt-1">Lost: {worstExam.maxMarks ? worstExam.maxMarks - worstExam.marks : '-'}</div>
                    </div>
                  )}
                </div>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-1 pr-4 text-blue-700">Exam</th>
                        <th className="text-left py-1 text-blue-700">Marks</th>
                        <th className="text-left py-1 text-blue-700">Exam Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sub.exams.map((exam, idx) => (
                        <tr key={idx} className={idx === bestIdx ? 'bg-green-100' : idx === worstIdx ? 'bg-red-100' : ''}>
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
      )}
      </div>
    </div>
  );
};

export default StudentPerformancePage; 