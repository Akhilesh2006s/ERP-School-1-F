import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const ClassTodos = () => {
  const { user } = useAuth();
  const schoolId = user?.schoolId || user?.school?._id;
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState('');
  const [task, setTask] = useState('');
  const [link, setLink] = useState('');
  const [todos, setTodos] = useState([]);
  const [msg, setMsg] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!schoolId) return;
      try {
        const res = await api.get(`/api/class?schoolId=${schoolId}`);
        setClasses(res.data.data?.classes || []);
      } catch {
        setClasses([]);
      }
    };
    fetchClasses();
  }, [schoolId]);

  // Fetch sections for selected class
  useEffect(() => {
    if (!classId) { setSections([]); return; }
    const fetchSections = async () => {
      try {
        const res = await api.get(`/api/section?classId=${classId}`);
        setSections(res.data.sections || []);
      } catch {
        setSections([]);
      }
    };
    fetchSections();
  }, [classId]);

  // Fetch todos
  const fetchTodos = async () => {
    if (!classId || !sectionId) return;
    const res = await api.get(`/api/class-todo?classId=${classId}&sectionId=${sectionId}`);
    setTodos(res.data.todos);
  };
  useEffect(() => { fetchTodos(); /* eslint-disable-next-line */ }, [classId, sectionId]);

  // Handle form submit with link
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const todoData = {
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        date: date || undefined,
        task: task || undefined,
        link: link || undefined
      };

      await api.post('/api/class-todo', todoData);
      setMsg('To-Do posted!');
      setTask('');
      setDate('');
      setLink('');
      fetchTodos();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to post to-do.');
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

      <div className="max-w-3xl mx-auto p-8 relative z-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Class To-Dos</h1>
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-10 flex flex-col gap-6 border border-white/50">
        <div className="flex gap-4">
          <select value={classId} onChange={e => setClassId(e.target.value)} required className="select-dark">
            <option value="">Select Class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.number}</option>)}
          </select>
          <select value={sectionId} onChange={e => setSectionId(e.target.value)} required className="select-dark">
            <option value="">Select Section</option>
            {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex gap-4">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-dark flex-1" />
          <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="Enter link (optional)" className="input-dark flex-1" />
        </div>
        <input type="text" value={task} onChange={e => setTask(e.target.value)} placeholder="Enter to-do/work" required className="input-dark" />
        <button type="submit" className="btn-dark-primary py-3 px-6 rounded-xl font-bold shadow-lg flex items-center gap-2 text-lg transition">Post To-Do</button>
        {msg && <div className="text-green-400 font-semibold text-lg">{msg}</div>}
      </form>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">To-Do History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50">
          <thead>
            <tr>
              <th className="p-3 text-left text-gray-800 font-semibold">Work</th>
              <th className="p-3 text-left text-gray-800 font-semibold">Due Date</th>
              <th className="p-3 text-left text-gray-800 font-semibold">Link</th>
            </tr>
          </thead>
          <tbody>
            {todos.length === 0 ? (
              <tr><td colSpan={3} className="text-center p-4 text-gray-600">No to-dos found.</td></tr>
            ) : todos.map(todo => (
              <tr key={todo._id} className="border-b border-gray-200">
                <td className="p-3 text-gray-700">{todo.task}</td>
                <td className="p-3 text-gray-700">{new Date(todo.date).toLocaleDateString()}</td>
                <td className="p-3">
                  {todo.link ? (
                    <a
                      href={todo.link}
                      className="text-purple-400 hover:text-purple-300 hover:underline font-semibold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Link
                    </a>
                  ) : (
                    <span className="text-gray-400">No link</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};

export default ClassTodos; 