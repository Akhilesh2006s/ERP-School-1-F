import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Trophy, Calendar, Star, Medal } from 'lucide-react';

const categories = [
  { name: 'Academic', color: 'bg-blue-100', icon: '🏆' },
  { name: 'Sports', color: 'bg-green-100', icon: '🥇' },
  { name: 'Arts', color: 'bg-purple-100', icon: '⭐' },
  { name: 'Leadership', color: 'bg-yellow-100', icon: '🎖️' },
];

function AchievementsDashboard() {
  const [achievements, setAchievements] = useState([]);
  const [showAchModal, setShowAchModal] = useState(false);
  const [newAch, setNewAch] = useState({ title: '', studentName: '', grade: '', description: '', category: '', level: '', date: '', certificateUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [awards, setAwards] = useState([]);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [newAward, setNewAward] = useState({ eventName: '', date: '', winners: '', description: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAchievements();
    fetchAwards();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/achievement');
      setAchievements(res.data);
    } catch {
      setError('Failed to load achievements');
    }
    setLoading(false);
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/achievement/add', newAch);
      setShowAchModal(false);
      setNewAch({ title: '', studentName: '', grade: '', description: '', category: '', level: '', date: '', certificateUrl: '' });
      fetchAchievements();
    } catch {
      setError('Failed to add achievement');
    }
    setLoading(false);
  };

  const fetchAwards = async () => {
    try {
      const res = await api.get('/api/award');
      setAwards(res.data);
    } catch {}
  };

  const handleAddAward = async (e) => {
    e.preventDefault();
    try {
      await api.post('/award/add', { ...newAward, winners: Number(newAward.winners) });
      setShowAwardModal(false);
      setNewAward({ eventName: '', date: '', winners: '', description: '' });
      fetchAwards();
    } catch {}
  };

  const handleDeleteAchievement = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await api.delete(`/api/achievement/${id}`);
      fetchAchievements();
    } catch {}
  };

  const handleDeleteAward = async (id) => {
    if (!window.confirm('Delete this award?')) return;
    try {
      await api.delete(`/api/award/${id}`);
      fetchAwards();
    } catch {}
  };

  // Category counts
  const categoryCounts = categories.map(cat => ({
    ...cat,
    count: achievements.filter(a => a.category === cat.name).length
  }));

  // Summary card calculations
  const totalAchievements = achievements.length;
  const achievementsThisMonth = achievements.filter(a => a.date && new Date(a.date).getMonth() === new Date().getMonth() && new Date(a.date).getFullYear() === new Date().getFullYear()).length;
  const nationalLevelCount = achievements.filter(a => a.level && a.level.toLowerCase().includes('national')).length;
  const studentsAwarded = new Set(achievements.map(a => a.studentName)).size;
  const filteredAchievements = achievements.filter(a =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    a.category?.toLowerCase().includes(search.toLowerCase())
  );

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

      <div className="max-w-7xl mx-auto p-6 relative z-10">
      {/* Top Row: Title only */}
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-900">Achievements & Awards</h1>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <Trophy className="w-7 h-7 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-purple-700">{totalAchievements}</div>
          <div className="text-gray-800 font-medium">Total Achievements</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <Calendar className="w-7 h-7 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-green-700">{achievementsThisMonth}</div>
          <div className="text-gray-800 font-medium">This Month</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <Star className="w-7 h-7 text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-indigo-700">{nationalLevelCount}</div>
          <div className="text-gray-800 font-medium">National Level</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <Medal className="w-7 h-7 text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-yellow-700">{studentsAwarded}</div>
          <div className="text-gray-800 font-medium">Students Awarded</div>
        </div>
      </div>
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          className="input input-bordered w-full rounded-lg"
          placeholder="Search achievements by student, category, or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Main Content: Two Cards Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Achievements Card */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Achievements</h2>
            <button className="bg-purple-600 text-white px-3 py-1 rounded" onClick={() => setShowAchModal(true)}>
              + Add Achievement
            </button>
          </div>
          {filteredAchievements.slice(0, 3).length === 0 ? (
            <div className="text-gray-400 text-sm">No achievements yet.</div>
          ) : (
            filteredAchievements.slice(0, 3).map(ach => (
              <div key={ach._id} className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{ach.title}</div>
                  <div className="text-gray-600">{ach.studentName} • {ach.grade}</div>
                  <div className="text-gray-500 text-sm">{ach.description}</div>
                  <div className="mt-2 flex gap-2">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{ach.category}</span>
                    <span className="bg-gray-200 px-2 py-1 rounded text-xs">{ach.level}</span>
                    <span className="bg-gray-200 px-2 py-1 rounded text-xs">{ach.date ? new Date(ach.date).toLocaleDateString() : ''}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button className="border px-3 py-1 rounded">View Details</button>
                  {ach.certificateUrl && <a href={ach.certificateUrl} className="border px-3 py-1 rounded" target="_blank" rel="noopener noreferrer">Certificate</a>}
                  <button className="border px-3 py-1 rounded text-red-600" onClick={() => handleDeleteAchievement(ach._id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Recent Award Events Card */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Award Events</h2>
            <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => setShowAwardModal(true)}>
              + Add Award
            </button>
          </div>
          {awards.length === 0 ? (
            <div className="text-gray-400 text-sm">No awards yet.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1">Event</th>
                  <th className="text-left px-2 py-1">Date</th>
                  <th className="text-left px-2 py-1">Winners</th>
                  <th className="text-left px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {awards.slice(0, 3).map(a => (
                  <tr key={a._id}>
                    <td className="px-2 py-1">{a.eventName}</td>
                    <td className="px-2 py-1">{a.date ? new Date(a.date).toLocaleDateString() : ''}</td>
                    <td className="px-2 py-1">{a.winners}</td>
                    <td className="px-2 py-1">
                      <button className="border px-2 py-1 rounded text-red-600 text-xs" onClick={() => handleDeleteAward(a._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Add Award Modal */}
          {showAwardModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowAwardModal(false)}>&times;</button>
                <h3 className="text-xl font-semibold text-green-900 mb-4">Add Award</h3>
                <form onSubmit={handleAddAward} className="space-y-4">
                  <input className="input input-bordered w-full rounded-lg" placeholder="Event Name" value={newAward.eventName} onChange={e => setNewAward({ ...newAward, eventName: e.target.value })} required />
                  <input className="input input-bordered w-full rounded-lg" type="date" value={newAward.date} onChange={e => setNewAward({ ...newAward, date: e.target.value })} required />
                  <input className="input input-bordered w-full rounded-lg" placeholder="Number of Winners" type="number" value={newAward.winners} onChange={e => setNewAward({ ...newAward, winners: e.target.value })} required />
                  <input className="input input-bordered w-full rounded-lg" placeholder="Description (optional)" value={newAward.description} onChange={e => setNewAward({ ...newAward, description: e.target.value })} />
                  <button type="submit" className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold">Add</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Add Achievement Modal */}
      {showAchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowAchModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Add Achievement</h3>
            <form onSubmit={handleAddAchievement} className="space-y-4">
              <input className="input input-bordered w-full rounded-lg" placeholder="Title" value={newAch.title} onChange={e => setNewAch({ ...newAch, title: e.target.value })} required />
              <input className="input input-bordered w-full rounded-lg" placeholder="Student Name" value={newAch.studentName} onChange={e => setNewAch({ ...newAch, studentName: e.target.value })} required />
              <input className="input input-bordered w-full rounded-lg" placeholder="Grade" value={newAch.grade} onChange={e => setNewAch({ ...newAch, grade: e.target.value })} required />
              <input className="input input-bordered w-full rounded-lg" placeholder="Description" value={newAch.description} onChange={e => setNewAch({ ...newAch, description: e.target.value })} />
              <select className="input input-bordered w-full rounded-lg" value={newAch.category} onChange={e => setNewAch({ ...newAch, category: e.target.value })} required>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
              <input className="input input-bordered w-full rounded-lg" placeholder="Level (e.g. National, State)" value={newAch.level} onChange={e => setNewAch({ ...newAch, level: e.target.value })} required />
              <input className="input input-bordered w-full rounded-lg" type="date" value={newAch.date} onChange={e => setNewAch({ ...newAch, date: e.target.value })} required />
              <input className="input input-bordered w-full rounded-lg" placeholder="Certificate URL (optional)" value={newAch.certificateUrl} onChange={e => setNewAch({ ...newAch, certificateUrl: e.target.value })} />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold">Add</button>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default AchievementsDashboard; 