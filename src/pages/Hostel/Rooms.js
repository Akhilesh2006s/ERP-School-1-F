import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BedDouble, Users, User2, Trash2, Plus, X, Search } from 'lucide-react';

const initialRoomForm = { number: '', capacity: '' };

const HostelRooms = () => {
  // Extract hostelId from URL (assumes /hostel/:hostelId/rooms)
  const hostelId = window.location.pathname.split('/')[2];
  const [hostel, setHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [roomError, setRoomError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRoomId, setAssignRoomId] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [occupants, setOccupants] = useState([]);

  useEffect(() => {
    fetchHostel();
    fetchRooms();
  }, []);

  const fetchHostel = async () => {
    try {
      const res = await axios.get(`/api/hostel/${hostelId}`);
      setHostel(res.data);
    } catch {
      setHostel(null);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/hostel/${hostelId}/rooms`);
      setRooms(res.data || []);
    } catch {
      setRooms([]);
    }
    setLoading(false);
  };

  const handleRoomChange = e => {
    setRoomForm({ ...roomForm, [e.target.name]: e.target.value });
  };

  const handleAddRoom = async e => {
    e.preventDefault();
    setRoomError(null);
    setAdding(true);
    try {
      await axios.post(`/api/hostel/${hostelId}/room/add`, roomForm);
      setShowAddModal(false);
      setRoomForm(initialRoomForm);
      fetchRooms();
    } catch (err) {
      setRoomError('Failed to add room');
    }
    setAdding(false);
  };

  const getSchoolId = () => {
    // Try to get from localStorage (selectedSchool)
    const selectedSchool = JSON.parse(localStorage.getItem('selectedSchool'));
    return selectedSchool?._id || '';
  };

  const openAssignModal = async (roomId) => {
    setAssignRoomId(roomId);
    setShowAssignModal(true);
    setSelectedStudent('');
    setSearch('');
    // Fetch students (all, or you can filter by not already assigned)
    try {
      const schoolId = getSchoolId();
      const res = await axios.get(`/api/users?role=student&schoolId=${schoolId}`);
      setStudents(res.data.data.users || []);
    } catch {
      setStudents([]);
    }
    // Fetch current occupants
    try {
      const occRes = await axios.get(`/api/hostel/room/${roomId}/students`);
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
      await axios.post(`/api/hostel/room/${assignRoomId}/assign`, { studentId: selectedStudent });
      openAssignModal(assignRoomId); // Refresh occupants
      fetchRooms();
    } catch (err) {
      alert('Failed to assign student');
    }
    setAssigning(false);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await axios.delete(`/api/hostel/room/${roomId}`);
      fetchRooms();
      alert('Room deleted');
    } catch (err) {
      alert('Failed to delete room');
    }
  };

  const handleRemoveStudent = async (roomId, studentId) => {
    if (!window.confirm('Remove this student from the room?')) return;
    try {
      await axios.delete(`/api/hostel/room/${roomId}/student/${studentId}`);
      openAssignModal(roomId); // Refresh occupants
      fetchRooms();
      alert('Student removed');
    } catch (err) {
      alert('Failed to remove student');
    }
  };

  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase();
    return (
      s.firstName?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
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

      <div className="p-4 max-w-5xl mx-auto relative z-10">
        <button className="mb-4 text-gray-800 hover:underline" onClick={() => window.history.back()}>&larr; Back to Hostels</button>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Rooms in {hostel?.name || 'Hostel'}</h1>
      <div className="flex justify-end mb-6">
        <button className="bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-full px-6 py-3 font-semibold shadow-xl hover:from-purple-800 hover:to-purple-600 transition flex items-center gap-2 text-lg" onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5" /> Add Room
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-gray-500">No rooms found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map(room => (
            <div key={room._id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3 border border-purple-100 hover:scale-[1.02] transition">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-xl font-bold text-purple-800">
                  <BedDouble className="w-6 h-6 text-green-600" /> Room {room.number}
                </div>
                <button className="bg-red-500 hover:bg-red-700 text-white rounded-full px-4 py-2 font-semibold flex items-center gap-1 shadow" onClick={() => handleDeleteRoom(room._id)}>
                  <Trash2 className="w-5 h-5" /> Delete
                </button>
              </div>
              <div className="flex gap-6 text-base text-gray-700 mb-2">
                <div className="flex items-center gap-1"><BedDouble className="w-5 h-5 text-green-600" />Capacity: <span className="font-semibold">{room.capacity}</span></div>
                <div className="flex items-center gap-1"><Users className="w-5 h-5 text-pink-600" />Occupied: <span className="font-semibold">{room.occupants?.length || 0}</span></div>
              </div>
              <button className="bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-full px-5 py-2 font-semibold shadow hover:from-purple-800 hover:to-purple-600 transition flex items-center gap-2 w-max" onClick={() => openAssignModal(room._id)}>
                <User2 className="w-5 h-5" /> Assign Students
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowAddModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5" /> Add Room</h3>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input name="number" value={roomForm.number} onChange={handleRoomChange} required className="input input-bordered w-full rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input name="capacity" value={roomForm.capacity} onChange={handleRoomChange} required type="number" className="input input-bordered w-full rounded-lg" />
              </div>
              {roomError && <div className="text-red-600 text-sm">{roomError}</div>}
              <button
                type="submit"
                className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center justify-center"
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add Room'}
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
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <User2 className="w-6 h-6 text-purple-700" />
              <h3 className="text-2xl font-bold text-purple-900">Assign Student to Room</h3>
            </div>
            <div className="mb-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search className="w-5 h-5" /></span>
              <input
                type="text"
                placeholder="Search students by name or email..."
                className="input input-bordered w-full rounded-lg pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <select
                  className="input input-bordered w-full rounded-lg"
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  required
                >
                  <option value="">Select a student</option>
                  {filteredStudents.map(s => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.email})</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-700 to-purple-500 text-white py-2 rounded-lg font-semibold hover:from-purple-800 hover:to-purple-600 transition flex items-center justify-center text-lg"
                disabled={assigning}
              >
                {assigning ? 'Assigning...' : 'Assign Student'}
              </button>
            </form>
            <div className="mt-6">
              <div className="text-lg font-semibold mb-2 text-gray-800">Current Occupants</div>
              <div className="flex flex-col gap-2">
                {occupants.length === 0 ? (
                  <div className="text-gray-500">No students assigned to this room.</div>
                ) : (
                  occupants.map(o => (
                    <div key={o._id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 shadow-sm">
                      <User2 className="w-5 h-5 text-purple-700" />
                      <span className="font-medium text-gray-800">{o.firstName} {o.lastName} <span className="text-gray-500 text-sm">({o.email})</span></span>
                      <button className="ml-auto bg-red-500 hover:bg-red-700 text-white rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-1" onClick={() => handleRemoveStudent(assignRoomId, o._id)}>
                        <X className="w-4 h-4" /> Remove
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

export default HostelRooms; 