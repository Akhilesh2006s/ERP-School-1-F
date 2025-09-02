import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Bus, Users, Search, Plus, XCircle, User2, Trash2 } from 'lucide-react';

const initialForm = { number: '', driver: '', capacity: '' };

const TransportManager = () => {
  const [summary, setSummary] = useState({ totalBuses: 0, totalCapacity: 0, occupiedSeats: 0 });
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignBusId, setAssignBusId] = useState(null);
  const [students, setStudents] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [occupants, setOccupants] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Replace with your backend endpoints
      const [summaryRes, busesRes] = await Promise.all([
        api.get('/transport/summary'),
        api.get('/transport/buses'),
      ]);
      setSummary(summaryRes.data || {});
      setBuses(busesRes.data || []);
    } catch {
      setSummary({ totalBuses: 0, totalCapacity: 0, occupiedSeats: 0 });
      setBuses([]);
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
      await api.post('/transport/buses', form);
      setShowAddModal(false);
      setForm(initialForm);
      fetchAll();
    } catch (err) {
      setFormError('Failed to add bus');
    }
    setAdding(false);
  };

  const openAssignModal = async (busId) => {
    setAssignBusId(busId);
    setShowAssignModal(true);
    setSelectedStudent('');
    // Fetch students
    try {
      const res = await api.get('/users?role=student');
      setStudents(res.data.data.users || []);
    } catch {
      setStudents([]);
    }
    // Fetch current occupants
    try {
      const occRes = await api.get(`/transport/bus/${busId}/students`);
      setOccupants(occRes.data || []);
    } catch {
      setOccupants([]);
    }
  };
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setAssigning(true);
    try {
      await api.post(`/transport/bus/${assignBusId}/assign`, { student: selectedStudent });
      openAssignModal(assignBusId); // Refresh occupants
      fetchAll();
    } catch (err) {
      alert('Failed to assign student');
    }
    setAssigning(false);
  };
  const handleRemoveStudent = async (busId, studentId) => {
    if (!window.confirm('Remove this student from the bus?')) return;
    try {
      await api.delete(`/transport/bus/${busId}/student/${studentId}`);
      openAssignModal(busId); // Refresh occupants
      fetchAll();
      alert('Student removed');
    } catch (err) {
      alert('Failed to remove student');
    }
  };

  const handleDeleteBus = async (busId) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
    try {
      await api.delete(`/transport/buses/${busId}`);
      fetchAll();
      alert('Bus deleted');
    } catch (err) {
      alert('Failed to delete bus');
    }
  };

  const filteredBuses = buses.filter(b => {
    const q = search.toLowerCase();
    return (
      b.number?.toLowerCase().includes(q) ||
      b.driver?.toLowerCase().includes(q)
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
      <h1 className="text-3xl font-bold mb-2">Transport Management</h1>
      <p className="text-gray-600 mb-6">Manage buses, drivers, and seat allocation</p>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:scale-105 transition">
          <Bus className="w-7 h-7 text-blue-700 mb-2" />
          <div className="text-2xl font-bold text-blue-700">{summary.totalBuses}</div>
          <div className="text-gray-600">Total Buses</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:scale-105 transition">
          <Users className="w-7 h-7 text-green-600 mb-2" />
          <div className="text-2xl font-bold text-green-600">{summary.totalCapacity}</div>
          <div className="text-gray-600">Total Capacity</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:scale-105 transition">
          <Users className="w-7 h-7 text-pink-600 mb-2" />
          <div className="text-2xl font-bold text-pink-600">{summary.occupiedSeats}</div>
          <div className="text-gray-600">Occupied Seats</div>
        </div>
      </div>
      {/* Search Bar and Add Bus Button */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
        <div className="relative w-full md:w-1/2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search className="w-5 h-5" /></span>
          <input
            type="text"
            placeholder="Search buses or drivers..."
            className="input input-bordered w-full rounded-lg pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full px-6 py-3 font-semibold shadow-xl hover:from-blue-800 hover:to-blue-600 transition flex items-center gap-2 text-lg" onClick={() => setShowAddModal(true)}>
          <Plus className="w-6 h-6" /> Add Bus
        </button>
      </div>
      {/* Buses as Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {loading ? (
          <div className="col-span-2 text-center py-12">Loading...</div>
        ) : filteredBuses.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-blue-700">
            <div className="flex flex-col items-center gap-2">
              <Bus className="w-12 h-12 text-blue-300 mb-2" />
              <span className="font-semibold text-lg">No buses found.</span>
              <span className="text-gray-400 text-sm">Try adjusting your search.</span>
            </div>
          </div>
        ) : (
          filteredBuses.map(bus => (
            <div key={bus._id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3 border border-blue-100 hover:scale-[1.02] transition">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-xl font-bold text-blue-800">
                  <Bus className="w-6 h-6 text-blue-700" /> {bus.number}
                </div>
                <button className="bg-red-500 hover:bg-red-700 text-white rounded-full px-4 py-2 font-semibold flex items-center gap-1 shadow" onClick={() => handleDeleteBus(bus._id)}>
                  <Trash2 className="w-5 h-5" /> Delete
                </button>
              </div>
              <div className="flex gap-6 text-base text-gray-700 mb-2">
                <div className="flex items-center gap-1">Driver: <span className="font-semibold">{bus.driver}</span></div>
                <div className="flex items-center gap-1">Capacity: <span className="font-semibold">{bus.capacity}</span></div>
              </div>
              <button className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full px-5 py-2 font-semibold shadow hover:from-blue-800 hover:to-blue-600 transition flex items-center gap-2 w-max" onClick={() => openAssignModal(bus._id)}>
                <User2 className="w-5 h-5" /> Assign Students
              </button>
            </div>
          ))
        )}
      </div>
      {/* Add Bus Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowAddModal(false)}
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5" /> Add Bus</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number</label>
                <input name="number" value={form.number} onChange={handleChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <input name="driver" value={form.driver} onChange={handleChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input name="capacity" value={form.capacity} onChange={handleChange} required type="number" className="input input-bordered w-full rounded-lg" />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center"
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add Bus'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Assign Students Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative flex flex-col gap-4">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowAssignModal(false)}
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <User2 className="w-6 h-6 text-blue-700" />
              <h3 className="text-2xl font-bold text-blue-900">Assign Student to Bus</h3>
            </div>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select
                  className="input input-bordered w-full rounded-lg"
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.email})</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center text-lg"
                disabled={assigning}
              >
                {assigning ? 'Assigning...' : 'Assign Student'}
              </button>
            </form>
            <div className="mt-6">
              <div className="text-lg font-semibold mb-2 text-gray-800">Current Occupants</div>
              <div className="flex flex-col gap-2">
                {occupants.length === 0 ? (
                  <div className="text-gray-500">No students assigned to this bus.</div>
                ) : (
                  occupants.map(o => (
                    <div key={o._id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 shadow-sm">
                      <User2 className="w-5 h-5 text-blue-700" />
                      <span className="font-medium text-gray-800">{o.firstName} {o.lastName} <span className="text-gray-500 text-sm">({o.email})</span></span>
                      <button className="ml-auto bg-red-500 hover:bg-red-700 text-white rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-1" onClick={() => handleRemoveStudent(assignBusId, o._id)}>
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TransportManager; 