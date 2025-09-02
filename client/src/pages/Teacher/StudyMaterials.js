import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Upload } from 'lucide-react';

const StudyMaterials = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]); // teacher's assigned class/subject
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Fetch teacher assignments (class/subject)
    const fetchAssignments = async () => {
      const res = await api.get('/api/auth/me');
      setAssignments(res.data?.data?.user?.assignments || []);
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (!selectedAssignment) return;
    // Fetch materials for this assignment
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/study-materials?classId=${selectedAssignment.class._id}&sectionId=${selectedAssignment.section._id}&subjectId=${selectedAssignment.subject._id}`);
        setMaterials(res.data.data.materials || []);
      } catch {
        setMaterials([]);
      }
      setLoading(false);
    };
    fetchMaterials();
  }, [selectedAssignment]);

  const handleUpload = async e => {
    e.preventDefault();
    if (!selectedAssignment || !title || !file) {
      setMsg('Please select class/subject, enter title, and choose a PDF.');
      return;
    }
    setUploading(true);
    setMsg('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    formData.append('classId', selectedAssignment.class._id);
    formData.append('sectionId', selectedAssignment.section._id);
    formData.append('subjectId', selectedAssignment.subject._id);
    try {
      await api.post('/api/study-materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTitle('');
      setFile(null);
      setMsg('Uploaded!');
      // Refresh list
      const res = await api.get(`/api/study-materials?classId=${selectedAssignment.class._id}&sectionId=${selectedAssignment.section._id}&subjectId=${selectedAssignment.subject._id}`);
      setMaterials(res.data.data.materials || []);
    } catch {
      setMsg('Upload failed.');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><BookOpen className="w-6 h-6 mr-2 text-purple-400" /> Study Materials</h2>
      <form className="modal-dark rounded-xl shadow-lg p-6 mb-6 flex flex-col gap-4 border border-purple-500/30" onSubmit={handleUpload}>
        <div>
          <label className="font-medium mr-2 text-white">Class/Subject:</label>
          <select
            className="select-dark"
            value={selectedAssignment ? assignments.findIndex(a => a === selectedAssignment) : ''}
            onChange={e => setSelectedAssignment(e.target.value !== '' ? assignments[e.target.value] : null)}
          >
            <option value="">Select</option>
            {assignments.map((a, idx) => (
              <option key={idx} value={idx}>{a.subject?.name} ({a.class?.number ? `Class ${a.class.number}` : ''} {a.section?.name ? `Section ${a.section.name}` : ''})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-medium mr-2 text-white">Title:</label>
          <input
            className="input-dark w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter material title"
          />
        </div>
        <div>
          <label className="font-medium mr-2 text-white">PDF:</label>
          <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} className="input-dark" />
        </div>
        <button
          type="submit"
          className="btn-dark-primary px-4 py-2 font-semibold flex items-center gap-2"
          disabled={uploading}
        >
          <Upload className="w-5 h-5" /> {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {msg && <div className="text-green-400 mt-2">{msg}</div>}
      </form>
      <h3 className="text-lg font-semibold mb-2 text-white">Uploaded Materials</h3>
      {loading ? <div className="text-gray-300">Loading...</div> : (
        <ul className="space-y-2">
          {materials.length === 0 ? <li className="text-gray-300">No materials uploaded yet.</li> : (
            materials.map(mat => (
              <li key={mat._id} className="card-purple rounded p-3 flex items-center justify-between border border-purple-500/30">
                <div>
                  <div className="font-medium text-white">{mat.title}</div>
                  <div className="text-sm text-gray-300">{mat.originalName || 'PDF'}</div>
                </div>
                <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline font-semibold">Download</a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default StudyMaterials; 