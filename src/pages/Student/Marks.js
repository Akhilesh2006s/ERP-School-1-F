import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const Marks = () => {
  const { user, token } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchMarks = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/marks/me');
        setExams(res.data.exams || []);
      } catch (err) {
        setError('Failed to load marks.');
      }
      setLoading(false);
    };
    fetchMarks();
  }, [user, token]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-3xl mx-auto p-8 relative z-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">My Marks</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.length === 0 ? (
              <div className="text-center p-4 text-gray-500 col-span-2">No marks found.</div>
            ) : (
              exams.map(exam => (
                <div key={exam.name + exam.date} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 border-t-4 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-blue-900 flex items-center gap-2">
                      <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg>
                      {exam.name}
                    </span>
                    <span className="text-gray-500 text-sm">{exam.date ? new Date(exam.date).toLocaleDateString() : ''}</span>
                  </div>
                  <div>
                    {(exam.subjects || []).length === 0 ? (
                      <div className="text-gray-400">No subject marks</div>
                    ) : (
                      <table className="min-w-full text-sm">
                        <tbody>
                          {exam.subjects.map((subj, idx) => (
                            <tr key={subj.name + '-' + idx} className="border-b last:border-b-0 animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                              <td className="py-2 pr-4 font-semibold text-blue-800">{subj.name}</td>
                              <td className="py-2">
                                <span className="inline-block px-3 py-1 rounded-full font-bold bg-green-100 text-green-700">
                                  {subj.marks}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Marks; 