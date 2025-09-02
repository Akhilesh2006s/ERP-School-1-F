import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Mail, Tag, Send, BookOpen, Trash2 } from 'lucide-react';

const quickActions = [
  { label: 'Send Email', icon: '📧' },
  { label: 'SMS Alert', icon: '💬' },
  { label: 'Push Notification', icon: '🔔' },
  { label: 'Group Message', icon: '👥' },
];

const typeColors = {
  important: 'bg-red-900/50 text-red-200 border border-red-500/30',
  notice: 'bg-purple-900/50 text-purple-200 border border-purple-500/30',
  reminder: 'bg-yellow-900/50 text-yellow-200 border border-yellow-500/30',
};

const Communication = () => {
  const { user, token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    recipientType: 'class',
    recipients: [],
    subject: '',
    message: '',
    type: 'notice',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchMessages();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setAssignments(res.data?.data?.user?.assignments || []);
    } catch {
      setAssignments([]);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/teacher/messages');
      setMessages(res.data.data.messages || []);
    } catch {
      setMessages([]);
    }
    setLoading(false);
  };

  // Recipients options: assigned classes/sections
  const isPrincipal = user?.specialRoles?.some(r => r.type === 'principal' || r.type === 'vice_principal');
  const recipientOptions = [
    ...(isPrincipal ? [
      { value: 'all_students', label: 'All Students' },
      { value: 'all_teachers', label: 'All Teachers' },
      { value: 'all_parents', label: 'All Parents' },
    ] : []),
    ...assignments
      .filter(a => a && a.class && a.section && a.section.name)
      .map(a => ({
        value: a.class._id + '-' + a.section._id,
        label: `${a.class.name || a.class.number || a.class.code || a.class._id || 'Class'} - ${a.section.name}`
      }))
  ];

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleRecipientsChange = e => {
    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setForm(f => ({ ...f, recipients: options }));
  };

  const handleSend = async e => {
    e.preventDefault();
    setSending(true);
    setMsg('');
    try {
      await api.post('/api/teacher/messages', {
        ...form,
        recipients: form.recipients,
      });
      setMsg('Message sent!');
      setForm({ recipientType: 'class', recipients: [], subject: '', message: '', type: 'notice' });
      fetchMessages();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to send message.');
    }
    setSending(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/api/teacher/messages/${id}`);
      fetchMessages();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete message.');
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

      <div className="max-w-6xl mx-auto p-8 relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Communication Center</h1>
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {quickActions.map(a => (
          <div key={a.label} className="card-purple rounded-xl shadow-lg p-6 flex flex-col items-center border border-purple-500/30 hover:shadow-xl transition cursor-pointer">
            <span className="text-4xl mb-2">{a.icon}</span>
            <span className="font-semibold text-white">{a.label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Recent Announcements */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-white">Recent Announcements</h2>
          <div className="space-y-4">
            {loading ? <div className="text-gray-300">Loading...</div> : messages.length === 0 ? <div className="text-gray-300">No announcements yet.</div> : messages.map(m => {
              if (!m || !m._id) return null;
              return (
                <div key={m._id} className="card-purple rounded-lg shadow-lg p-4 border border-purple-500/30 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-bold text-lg text-white mb-1">{m.subject}</div>
                    <div className="text-gray-200 mb-1">{m.message}</div>
                    <div className="text-sm text-gray-300">To: {m.recipients && m.recipients.length > 0 ? m.recipients.join(', ') : 'N/A'}</div>
                    <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex flex-col items-end mt-2 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[m.type] || 'bg-gray-700/50 text-gray-200 border border-gray-500/30'}`}>{m.type.charAt(0).toUpperCase() + m.type.slice(1)}</span>
                    <span className="text-xs text-gray-400 mt-2">By: {m.senderName || 'You'}</span>
                  </div>
                  {((m.sender === user._id) || isPrincipal) && (
                    <button
                      className="ml-4 p-2 rounded-full hover:bg-red-900/50 text-red-400 transition"
                      title="Delete"
                      onClick={() => handleDelete(m._id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Compose Message */}
        <div>
          <div className="modal-dark rounded-2xl shadow-xl border border-purple-500/30 p-8 flex flex-col gap-6">
            <h2 className="text-xl font-bold mb-2 text-white flex items-center gap-2"><Mail className="w-5 h-5 text-purple-400" /> Compose Message</h2>
            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-1 flex items-center gap-2 text-white"><Users className="w-4 h-4 text-purple-400" /> Recipients</label>
                <select
                  name="recipients"
                  multiple
                  value={form.recipients}
                  onChange={handleRecipientsChange}
                  className="select-dark w-full rounded-lg"
                  required
                >
                  {recipientOptions.map(opt => {
                    if (!opt || !opt.value) return null;
                    return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                  })}
                </select>
                {form.recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.recipients.map(val => {
                      const opt = recipientOptions.find(o => o && o.value === val);
                      if (!val) return null;
                      return (
                        <span key={val} className="inline-flex items-center px-3 py-1 rounded-full bg-purple-900/50 text-purple-200 text-xs font-semibold border border-purple-500/30"><Tag className="w-3 h-3 mr-1" />{opt?.label || val}</span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 flex items-center gap-2 text-white"><BookOpen className="w-4 h-4 text-purple-400" /> Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleFormChange}
                  className="input-dark w-full rounded-lg"
                  placeholder="Enter message subject"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-white">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleFormChange}
                  className="input-dark w-full rounded-lg"
                  rows={5}
                  placeholder="Type your message here..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 flex items-center gap-2 text-white"><Tag className="w-4 h-4 text-purple-400" /> Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="select-dark w-full rounded-lg"
                >
                  <option value="notice">Notice</option>
                  <option value="important">Important</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-dark-primary py-3 px-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 text-lg transition"
                  disabled={sending}
                >
                  <Send className="w-5 h-5" /> {sending ? 'Sending...' : 'Send Now'}
                </button>
                {msg && <div className="text-green-400 font-semibold mt-3 text-center">{msg}</div>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Communication; 