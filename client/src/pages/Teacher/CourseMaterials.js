import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Trash2, BookOpen, FileText, Link } from 'lucide-react';

const CourseMaterials = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    classSection: '',
    linkUrl: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchMaterials();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setAssignments(res.data?.data?.user?.assignments || []);
    } catch {
      setAssignments([]);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/teacher/materials');
      setMaterials(res.data.data.materials || []);
    } catch {
      setMaterials([]);
    }
    setLoading(false);
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };



  const handleUpload = async e => {
    e.preventDefault();
    setUploading(true);
    setMsg('');
    try {
      const [classId, sectionId] = form.classSection.split('-');
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('classId', classId);
      data.append('linkUrl', form.linkUrl);
      if (sectionId) data.append('sectionId', sectionId);
      
      await api.post('/api/teacher/materials', data);
      setMsg('Material uploaded!');
      setForm({ title: '', description: '', classSection: '', linkUrl: '' });
      fetchMaterials();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to upload material.');
    }
    setUploading(false);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await api.delete(`/api/teacher/materials/${id}`);
      fetchMaterials();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete material.');
    }
  };

  // Open link handler
  const handleOpenLink = (mat) => {
    window.open(mat.linkUrl, '_blank');
  };

  // Defensive: filter out null/undefined, non-object, or missing _id
  console.log('materials:', materials);
  const safeMaterials = Array.isArray(materials) ? materials.filter(mat => mat && typeof mat === 'object' && mat._id) : [];

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

      <div className="max-w-6xl mx-auto p-8 relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2"><BookOpen className="w-8 h-8 text-purple-600" /> Course Materials</h1>
      <div className="modal-dark rounded-2xl shadow-xl border border-purple-500/30 p-8 mb-10">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><Upload className="w-5 h-5 text-purple-400" /> Upload Material</h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">Title</label>
            <input type="text" name="title" value={form.title} onChange={handleFormChange} className="input-dark w-full rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">Class/Section</label>
            <select name="classSection" value={form.classSection} onChange={handleFormChange} className="select-dark w-full rounded-lg" required>
              <option value="">Select...</option>
              {assignments.filter(a => a && a.class && a.section).map(a => (
                <option key={a.class._id + '-' + a.section._id} value={a.class._id + '-' + a.section._id}>
                  {a.class.name} - {a.section.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-white">Description</label>
            <textarea name="description" value={form.description} onChange={handleFormChange} className="input-dark w-full rounded-lg" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">Link URL</label>
            <input 
              type="url" 
              name="linkUrl" 
              value={form.linkUrl} 
              onChange={handleFormChange} 
              className="input-dark w-full rounded-lg" 
              required 
              placeholder="https://..."
            />
          </div>
          <div className="md:col-span-2 flex gap-4 items-center">
            <button type="submit" className="btn-dark-primary py-3 px-6 rounded-xl font-bold shadow-lg flex items-center gap-2 text-lg transition" disabled={uploading}>
              <Upload className="w-5 h-5" /> {uploading ? 'Uploading...' : 'Upload'}
            </button>
            {msg && <div className="text-green-400 font-semibold text-lg">{msg}</div>}
          </div>
        </form>
      </div>
      <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><FileText className="w-5 h-5 text-purple-400" /> Uploaded Materials</h2>
      {loading ? <div className="text-gray-300">Loading...</div> : safeMaterials.length === 0 ? <div className="text-gray-300">No materials uploaded yet.</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-dark rounded-xl shadow-lg border border-purple-500/30">
            <thead>
              <tr className="bg-gray-800">
                <th className="py-3 px-4 text-left font-semibold text-purple-300">Title</th>
                <th className="py-3 px-4 text-left font-semibold text-purple-300">Description</th>
                <th className="py-3 px-4 text-left font-semibold text-purple-300">Class/Section</th>
                <th className="py-3 px-4 text-left font-semibold text-purple-300">Link</th>
                <th className="py-3 px-4 text-left font-semibold text-purple-300">Uploaded On</th>
                <th className="py-3 px-4 text-center font-semibold text-purple-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeMaterials.map(mat => (
                <tr key={mat._id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-2 px-4 font-bold text-white">{mat.title}</td>
                  <td className="py-2 px-4 text-gray-200">{mat.description}</td>
                  <td className="py-2 px-4 text-gray-200">{mat.classId?.name || '-'}{mat.sectionId?.name ? ` - ${mat.sectionId.name}` : ''}</td>
                  <td className="py-2 px-4 text-gray-200">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-purple-400" />
                      <span className="text-blue-400 hover:text-blue-300 cursor-pointer truncate max-w-xs" title={mat.linkUrl}>
                        {mat.linkUrl}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-gray-200">{new Date(mat.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => handleOpenLink(mat)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-md font-bold bg-purple-600 text-white hover:bg-purple-700 transition mr-2"
                    >
                      <Link className="w-4 h-4" /> Open Link
                    </button>
                    <button
                      onClick={() => handleDelete(mat._id)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-md font-bold bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
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

export default CourseMaterials; 