import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Link } from 'lucide-react';

const StudentCourseMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/api/teacher/student/materials')
      .then(res => setMaterials(res.data.materials || []))
      .catch(() => setError('Failed to load materials.'))
      .finally(() => setLoading(false));
  }, []);

  // Open link handler
  const handleOpenLink = (mat) => {
    window.open(mat.linkUrl, '_blank');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-6xl mx-auto p-8 relative z-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-900 flex items-center gap-2"><FileText className="w-8 h-8 text-blue-700" /> Course Materials</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : materials.length === 0 ? (
        <div className="text-gray-500">No materials found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow border border-blue-100">
            <thead>
              <tr className="bg-blue-50">
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Title</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Material Type</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Description</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Link</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Uploaded On</th>
                <th className="py-3 px-4 text-center font-semibold text-blue-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(mat => (
                <tr key={mat._id} className="border-b hover:bg-blue-50 transition">
                  <td className="py-2 px-4 font-bold text-blue-900">{mat.title}</td>
                  <td className="py-2 px-4 text-gray-700">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      mat.materialType === 'course-material' ? 'bg-blue-100 text-blue-800' :
                      mat.materialType === 'class-todo' ? 'bg-green-100 text-green-800' :
                      mat.materialType === 'homework' ? 'bg-yellow-100 text-yellow-800' :
                      mat.materialType === 'assignment' ? 'bg-purple-100 text-purple-800' :
                      mat.materialType === 'study-guide' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {mat.materialType ? mat.materialType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Course Material'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-gray-700">{mat.description}</td>
                  <td className="py-2 px-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 hover:text-blue-500 cursor-pointer truncate max-w-xs" title={mat.linkUrl}>
                        {mat.linkUrl}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-gray-700">{new Date(mat.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => handleOpenLink(mat)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-md font-bold bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      <Link className="w-4 h-4" /> Open Link
                    </button>
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

export default StudentCourseMaterials; 