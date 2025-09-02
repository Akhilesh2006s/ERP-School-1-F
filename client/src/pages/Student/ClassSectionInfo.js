import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, Mail } from 'lucide-react';

const ClassSectionInfo = () => {
  const { user, token } = useAuth();
  const sectionId = user?.section?._id || user?.sectionId;
  const sectionName = user?.section?.name || user?.sectionName || '-';
  const classNumber = user?.class?.number || user?.classNumber || '-';
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sectionId) return;
    setLoading(true);
    setError('');
    api.get(`/api/section/${sectionId}/subjects`)
      .then(res => setSubjects(res.data.data.subjects || []))
      .catch(() => setError('Failed to load section info.'))
      .finally(() => setLoading(false));
  }, [sectionId, token]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-3xl mx-auto p-6 relative z-10">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-900"><Users className="w-7 h-7 text-blue-700" /> Class/Section Info</h1>
      {/* Class & Section Card */}
      <div className="bg-blue-50 rounded-xl shadow flex flex-col md:flex-row items-center justify-between p-6 mb-8 border border-blue-100">
        <div className="flex items-center gap-4">
          <BookOpen className="w-8 h-8 text-blue-500" />
          <div>
            <div className="text-lg font-semibold text-blue-900">Class <span className="text-blue-700">{classNumber}</span></div>
            <div className="text-md text-blue-700">Section: <span className="font-bold">{sectionName}</span></div>
          </div>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-xl border border-blue-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-100">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-xl">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Teacher</th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider rounded-tr-xl">Email</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-blue-700">No subjects or teachers assigned for this section.</td>
                </tr>
              ) : (
                subjects.map((subj, idx) => (
                  <tr key={subj.subject?._id || idx} className={idx % 2 === 0 ? 'bg-blue-50/40' : 'bg-white'}>
                    <td className="px-4 py-3 font-medium text-blue-900">{subj.subject?.name}</td>
                    <td className="px-4 py-3">{subj.teacher ? `${subj.teacher.firstName} ${subj.teacher.lastName}` : '-'}</td>
                    <td className="px-4 py-3 flex items-center gap-2">{subj.teacher?.email ? (<><Mail className="w-4 h-4 text-blue-500" /> <span>{subj.teacher.email}</span></>) : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default ClassSectionInfo; 