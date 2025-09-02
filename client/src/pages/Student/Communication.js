import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Mail } from 'lucide-react';

const typeColors = {
  important: 'bg-red-100 text-red-700',
  notice: 'bg-blue-100 text-blue-700',
  reminder: 'bg-yellow-100 text-yellow-700',
};

const StudentCommunication = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/student/messages');
        setMessages(res.data.data.messages || []);
      } catch {
        setMessages([]);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [token]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-6xl mx-auto p-8 relative z-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-900 flex items-center gap-2"><Mail className="w-8 h-8 text-blue-700" /> Communication Center</h1>
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Recent Announcements</h2>
        <div className="space-y-4">
          {loading ? <div>Loading...</div> : messages.length === 0 ? <div className="text-gray-500">No announcements yet.</div> : messages.map(m => (
            <div key={m._id} className="bg-white rounded-lg shadow p-4 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-bold text-lg text-blue-900 mb-1">{m.subject}</div>
                <div className="text-gray-700 mb-1">{m.message}</div>
                <div className="text-sm text-gray-500">To: {m.recipients && m.recipients.length > 0 ? m.recipients.join(', ') : 'N/A'}</div>
                <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex flex-col items-end mt-2 md:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[m.type] || 'bg-gray-100 text-gray-700'}`}>{m.type?.charAt(0).toUpperCase() + m.type?.slice(1)}</span>
                <span className="text-xs text-gray-500 mt-2">By: {m.senderName || 'Teacher'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default StudentCommunication; 