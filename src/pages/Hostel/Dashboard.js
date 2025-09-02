import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Home, MapPin, BedDouble, Users, Search, User2, XCircle } from 'lucide-react';

const initialForm = { name: '', address: '', warden: '', capacity: '' };

const HostelDashboard = () => {
  const [summary, setSummary] = useState({ totalHostels: 0, totalCapacity: 0, occupiedRooms: 0 });
  const [hostels, setHostels] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, hostelsRes, recentRes] = await Promise.all([
        api.get('/api/hostel/summary'),
        api.get('/api/hostel/'),
        api.get('/api/hostel/recent-checkins'),
      ]);
      setSummary(summaryRes.data || {});
      setHostels(hostelsRes.data || []);
      setRecent(recentRes.data || []);
    } catch {
      setSummary({ totalHostels: 0, totalCapacity: 0, occupiedRooms: 0 });
      setHostels([]);
      setRecent([]);
    }
    setLoading(false);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async e => {
    e.preventDefault();
    setFormError(null);
    setAdding(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        capacity: form.capacity,
        ...(form.warden && form.warden.length === 24 ? { warden: form.warden } : {})
      };
      await api.post('/api/hostel/add', payload);
      setShowAddModal(false);
      setForm(initialForm);
      fetchAll();
      toast.success('Hostel added successfully!');
    } catch (err) {
      setFormError('Failed to add hostel');
      toast.error('Failed to add hostel');
    }
    setAdding(false);
  };

  const handleDeleteHostel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hostel?')) return;
    try {
      await api.delete(`/api/hostel/${id}`);
      fetchAll();
      toast.success('Hostel deleted');
    } catch (err) {
      toast.error('Failed to delete hostel');
    }
  };

  const goToRooms = (hostelId) => {
    window.location.href = `/hostel/${hostelId}/rooms`;
  };

  const filteredHostels = hostels.filter(h => {
    const q = search.toLowerCase();
    return (
      h.name?.toLowerCase().includes(q) ||
      h.address?.toLowerCase().includes(q)
    );
  });

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

      <div className="p-4 max-w-7xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Hostel Management</h1>
        <p className="text-gray-600 mb-6">Manage hostels, room allocation, and resident information</p>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card-purple rounded-xl p-4 flex flex-col items-center hover:scale-105 transition">
          <Home className="w-7 h-7 text-purple-300 mb-2" />
          <div className="text-2xl font-bold text-white">{summary.totalHostels}</div>
          <div className="text-purple-200">Total Hostels</div>
        </div>
        <div className="card-gold rounded-xl p-4 flex flex-col items-center hover:scale-105 transition">
          <BedDouble className="w-7 h-7 text-yellow-300 mb-2" />
          <div className="text-2xl font-bold text-white">{summary.totalCapacity}</div>
          <div className="text-yellow-200">Total Capacity</div>
        </div>
        <div className="card-purple rounded-xl p-4 flex flex-col items-center hover:scale-105 transition">
          <Users className="w-7 h-7 text-purple-300 mb-2" />
          <div className="text-2xl font-bold text-white">{summary.occupiedRooms}</div>
          <div className="text-purple-200">Occupied Rooms</div>
        </div>
      </div>
      {/* Search Bar and Add Hostel Button */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
        <div className="relative w-full md:w-1/2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search className="w-5 h-5" /></span>
          <input
            type="text"
            placeholder="Search hostels or residents..."
            className="input input-bordered w-full rounded-lg pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-full px-6 py-3 font-semibold shadow-xl hover:from-purple-800 hover:to-purple-600 transition flex items-center gap-2 text-lg" onClick={() => setShowAddModal(true)}>
          + Add Hostel
        </button>
      </div>
      {/* Hostels Table */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto border border-purple-100 mb-8">
        <table className="min-w-full divide-y divide-purple-100">
          <thead className="bg-gradient-to-r from-purple-500 to-purple-700 text-white sticky top-0 z-10 rounded-t-2xl">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-2xl">Hostel Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Warden</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Address</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Capacity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Occupied</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12"><div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mx-auto"></div></td></tr>
            ) : filteredHostels.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-purple-700">
                  <div className="flex flex-col items-center gap-2">
                    <Home className="w-12 h-12 text-purple-300 mb-2" />
                    <span className="font-semibold text-lg">No hostels found.</span>
                    <span className="text-gray-400 text-sm">Try adjusting your search.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredHostels.map((hostel, idx) => (
                <tr key={hostel._id} className={`transition group ${idx % 2 === 0 ? 'bg-purple-50/40' : 'bg-white' } hover:bg-purple-100/60`}>
                  <td className="px-4 py-3 font-medium text-purple-900 rounded-l-xl">{hostel.name}</td>
                  <td className="px-4 py-3">{hostel.wardenName || 'N/A'}</td>
                  <td className="px-4 py-3">{hostel.address}</td>
                  <td className="px-4 py-3">{hostel.capacity}</td>
                  <td className="px-4 py-3">{hostel.occupied || 0}</td>
                  <td className="px-4 py-3 text-center rounded-r-xl">
                    <button className="p-2 rounded-full hover:bg-blue-100 transition ml-2" title="View Rooms" onClick={() => goToRooms(hostel._id)}>
                      <BedDouble className="w-5 h-5 text-blue-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-red-100 transition ml-2" title="Delete" onClick={() => handleDeleteHostel(hostel._id)}>
                      <XCircle className="w-5 h-5 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Recent Check-ins */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto border border-green-100 mb-8">
        <h2 className="text-xl font-semibold mb-4 px-4 pt-4">Recent Check-ins</h2>
        <table className="min-w-full divide-y divide-green-100">
          <thead className="bg-gradient-to-r from-green-500 to-green-700 text-white sticky top-0 z-10 rounded-t-2xl">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-2xl">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Hostel</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Room</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Check-in</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-2xl">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-green-700">No recent check-ins.</td>
              </tr>
            ) : (
              recent.map((checkin, idx) => (
                <tr key={checkin._id} className={`transition group ${idx % 2 === 0 ? 'bg-green-50/40' : 'bg-white' } hover:bg-green-100/60`}>
                  <td className="px-4 py-3 font-medium text-green-900 rounded-l-xl">{checkin.student?.firstName} {checkin.student?.lastName}</td>
                  <td className="px-4 py-3">{checkin.hostel?.name}</td>
                  <td className="px-4 py-3">{checkin.room?.number}</td>
                  <td className="px-4 py-3">{checkin.allocatedAt ? new Date(checkin.allocatedAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-center rounded-r-xl">
                    <span className={`text-xs px-2 py-1 rounded-full ${checkin.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{checkin.status || 'Paid'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Add Hostel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowAddModal(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-purple-900 mb-4">Add Hostel</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
                <input name="name" value={form.name} onChange={handleChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input name="address" value={form.address} onChange={handleChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warden (optional)</label>
                <input name="warden" value={form.warden} onChange={handleChange} className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input name="capacity" value={form.capacity} onChange={handleChange} required type="number" className="input input-bordered w-full rounded-lg" />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-700 to-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition flex items-center justify-center"
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add Hostel'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default HostelDashboard; 