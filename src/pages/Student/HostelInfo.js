import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const HostelInfo = () => {
  const { user, token } = useAuth();
  const [hostelInfo, setHostelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    api.get(`/api/hostel/student/${user._id}`)
      .then(res => setHostelInfo(res.data))
      .catch(() => setHostelInfo(null))
      .finally(() => setLoading(false));
  }, [user, token]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-2xl mx-auto p-6 relative z-10">
      <h1 className="text-2xl font-bold mb-4">Hostel Information</h1>
      {loading ? (
        <div className="text-blue-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : !hostelInfo ? (
        <div className="text-gray-500">You are not registered in hostel.</div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-xl font-semibold mb-2">{hostelInfo.hostel?.name || 'Hostel'}</div>
          <div className="text-gray-700 mb-1">Room: <span className="font-bold">{hostelInfo.room?.number || '-'}</span></div>
          <div className="text-gray-700 mb-1">Allocated At: <span className="font-bold">{hostelInfo.allocatedAt ? new Date(hostelInfo.allocatedAt).toLocaleDateString() : '-'}</span></div>
          <div className="text-gray-700 mb-1">Hostel Address: <span className="font-bold">{hostelInfo.hostel?.address || '-'}</span></div>
        </div>
      )}
      </div>
    </div>
  );
};

export default HostelInfo; 