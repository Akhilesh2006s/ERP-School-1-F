import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VisitorDashboard = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', contact: '', purpose: '', staffContacted: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchVisitors = () => {
    setLoading(true);
    axios.get('/api/visitor/today')
      .then(res => {
        setVisitors(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not fetch visitors.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckIn = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      // Only include staffContacted if not empty
      const payload = { ...form };
      if (!payload.staffContacted) {
        delete payload.staffContacted;
      }
      await axios.post('/api/visitor/checkin', payload);
      setForm({ name: '', contact: '', purpose: '', staffContacted: '', notes: '' });
      fetchVisitors();
    } catch {
      setError('Check-in failed.');
    }
    setSubmitting(false);
  };

  const handleCheckOut = async visitorId => {
    setError('');
    try {
      await axios.post('/api/visitor/checkout', { visitorId });
      fetchVisitors();
    } catch {
      setError('Check-out failed.');
    }
  };

  const handleDeleteVisitor = async visitorId => {
    setError('');
    if (!window.confirm('Delete this visitor?')) return;
    try {
      await axios.delete(`/api/visitor/${visitorId}`);
      fetchVisitors();
    } catch {
      setError('Delete failed.');
    }
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

      <div className="p-4 max-w-3xl mx-auto relative z-10">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Visitor Management</h1>
      <form onSubmit={handleCheckIn} className="bg-white rounded shadow p-4 mb-6 space-y-3">
        <div className="font-semibold mb-2">Visitor Check-In</div>
        <div className="flex flex-wrap gap-4">
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="border p-2 rounded flex-1" />
          <input name="contact" value={form.contact} onChange={handleChange} required placeholder="Contact" className="border p-2 rounded flex-1" />
          <input name="purpose" value={form.purpose} onChange={handleChange} required placeholder="Purpose" className="border p-2 rounded flex-1" />
        </div>
        <div className="flex flex-wrap gap-4">
          <input name="staffContacted" value={form.staffContacted} onChange={handleChange} placeholder="Staff Contacted (optional)" className="border p-2 rounded flex-1" />
          <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes (optional)" className="border p-2 rounded flex-1" />
        </div>
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" disabled={submitting}>
          {submitting ? 'Checking In...' : 'Check In'}
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      <h2 className="text-xl font-semibold mb-2">Today's Visitors</h2>
      {loading ? (
        <div>Loading...</div>
      ) : visitors.length === 0 ? (
        <div className="text-gray-500">No visitors today.</div>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Name</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Purpose</th>
              <th className="p-2">Check-In</th>
              <th className="p-2">Check-Out</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map(v => (
              <tr key={v._id} className="border-t">
                <td className="p-2">{v.name}</td>
                <td className="p-2">{v.contact}</td>
                <td className="p-2">{v.purpose}</td>
                <td className="p-2">{v.checkIn ? new Date(v.checkIn).toLocaleTimeString() : '-'}</td>
                <td className="p-2">{v.checkOut ? new Date(v.checkOut).toLocaleTimeString() : '-'}</td>
                <td className="p-2">
                  {!v.checkOut && (
                    <button onClick={() => handleCheckOut(v._id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Check Out</button>
                  )}
                  <button onClick={() => handleDeleteVisitor(v._id)} className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
  );
};

export default VisitorDashboard; 