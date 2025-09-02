import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Download } from 'lucide-react';

const ClassTodos = () => {
  const { user } = useAuth();
  const studentClassId = user?.class?._id || user?.classId || null;
  const studentSectionId = user?.section?._id || user?.sectionId || null;
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTodos = async () => {
      if (!studentClassId || !studentSectionId) {
        setError('No class or section assigned.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/class-todo?classId=${studentClassId}&sectionId=${studentSectionId}`);
        setTodos(res.data.todos);
      } catch (err) {
        setError('Failed to load to-dos.');
      }
      setLoading(false);
    };
    fetchTodos();
  }, [studentClassId, studentSectionId]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-6xl mx-auto p-8 relative z-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-900 flex items-center gap-2"><FileText className="w-8 h-8 text-blue-700" /> Class To-Dos</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : todos.length === 0 ? (
        <div className="text-gray-500">No to-dos found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow border border-blue-100">
            <thead>
              <tr className="bg-blue-50">
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Work</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Due Date</th>
                <th className="py-3 px-4 text-center font-semibold text-blue-900">Download</th>
              </tr>
            </thead>
            <tbody>
              {todos.map(todo => (
                <tr key={todo._id} className="border-b hover:bg-blue-50 transition">
                  <td className="py-2 px-4 font-bold text-blue-900">{todo.task}</td>
                  <td className="py-2 px-4 text-gray-700">{new Date(todo.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 text-center">
                    {todo.fileUrl ? (
                      <a
                        href={todo.fileUrl}
                        download={todo.fileName}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md font-bold bg-blue-600 text-white hover:bg-blue-700 transition"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4" /> Download
                      </a>
                    ) : (
                      <span className="text-gray-400">No file</span>
                    )}
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

export default ClassTodos; 