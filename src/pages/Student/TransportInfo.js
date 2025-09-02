import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const StudentTransportInfo = () => {
  const { user, token } = useAuth();
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    api.get(`/api/transport/student/${user._id}`)
      .then(res => {
        console.log('Transport API response:', res.data);
        if (res.data && res.data.success && res.data.allocation) {
          setAllocation(res.data.allocation);
        } else {
          setAllocation(null);
        }
      })
      .catch((err) => {
        console.log('Transport API error:', err);
        setAllocation(null);
      })
      .finally(() => setLoading(false));
  }, [user, token]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-2xl mx-auto p-6 relative z-10">
      <h1 className="text-2xl font-bold mb-4">Transport Information</h1>
      {loading ? (
        <div className="text-blue-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : !allocation ? (
        <div className="text-gray-500">You are not registered for transport.</div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-xl font-semibold mb-2">Bus: {allocation.vehicle?.number || '-'}</div>
          <div className="text-gray-700 mb-1">Route: <span className="font-bold">{allocation.route?.name || '-'}</span></div>
          <div className="text-gray-700 mb-1">Driver: <span className="font-bold">{allocation.vehicle?.driver || '-'}</span></div>
          <div className="text-gray-700 mb-1">Pickup Point: <span className="font-bold">{allocation.stop?.name || '-'}</span></div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentTransportInfo; 