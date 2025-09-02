import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

function PollDashboard() {
  const [polls, setPolls] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [newPoll, setNewPoll] = useState({ title: '', description: '', questions: [] });
  const [newQuestion, setNewQuestion] = useState({ question: '', type: 'text', options: [''] });
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await api.get('/poll');
      setPolls(res.data);
    } catch {
      setError('Failed to load polls');
    }
    setLoading(false);
  };

  const handleAddPoll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/poll/add', newPoll);
      setShowAddModal(false);
      setNewPoll({ title: '', description: '', questions: [] });
      fetchPolls();
    } catch {
      setError('Failed to add poll');
    }
    setLoading(false);
  };

  const handleAddQuestion = () => {
    setNewPoll({ ...newPoll, questions: [...newPoll.questions, newQuestion] });
    setNewQuestion({ question: '', type: 'text', options: [''] });
  };

  const handleQuestionOptionChange = (idx, val) => {
    const opts = [...newQuestion.options];
    opts[idx] = val;
    setNewQuestion({ ...newQuestion, options: opts });
  };

  const handleAddOption = () => {
    setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] });
  };

  const handleRemoveOption = (idx) => {
    const opts = [...newQuestion.options];
    opts.splice(idx, 1);
    setNewQuestion({ ...newQuestion, options: opts });
  };

  const handleViewResponses = async (poll) => {
    setSelectedPoll(poll);
    setShowResponsesModal(true);
    setLoading(true);
    try {
      const res = await api.get(`/poll/${poll._id}/responses`);
      setResponses(res.data);
    } catch {
      setResponses([]);
    }
    setLoading(false);
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

      <div className="max-w-5xl mx-auto p-6 relative z-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Polls & Surveys</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowAddModal(true)}>
          + Add Poll
        </button>
      </div>
      {loading && <div className="p-4">Loading...</div>}
      {polls.length === 0 ? (
        <div className="text-gray-400 text-sm">No polls yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {polls.map(poll => (
            <div key={poll._id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="font-bold text-lg mb-1">{poll.title}</div>
                <div className="text-gray-600 mb-2">{poll.description}</div>
                <div className="text-xs text-gray-400 mb-2">{poll.questions.length} questions</div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button className="border px-3 py-1 rounded" onClick={() => handleViewResponses(poll)}>View Responses</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Add Poll Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowAddModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Add Poll</h3>
            <form onSubmit={handleAddPoll} className="space-y-4">
              <input className="input input-bordered w-full rounded-lg" placeholder="Title" value={newPoll.title} onChange={e => setNewPoll({ ...newPoll, title: e.target.value })} required />
              <textarea className="input input-bordered w-full rounded-lg" placeholder="Description" value={newPoll.description} onChange={e => setNewPoll({ ...newPoll, description: e.target.value })} />
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <div className="font-semibold mb-2">Add Question</div>
                <input className="input input-bordered w-full rounded-lg mb-2" placeholder="Question" value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })} />
                <select className="input input-bordered w-full rounded-lg mb-2" value={newQuestion.type} onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })}>
                  <option value="text">Text</option>
                  <option value="mcq">Multiple Choice</option>
                </select>
                {newQuestion.type === 'mcq' && (
                  <div className="space-y-2 mb-2">
                    {newQuestion.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input className="input input-bordered w-full rounded-lg" placeholder={`Option ${idx + 1}`} value={opt} onChange={e => handleQuestionOptionChange(idx, e.target.value)} />
                        <button type="button" className="text-red-500 font-bold" onClick={() => handleRemoveOption(idx)}>&times;</button>
                      </div>
                    ))}
                    <button type="button" className="text-blue-600 font-semibold" onClick={handleAddOption}>+ Add Option</button>
                  </div>
                )}
                <button type="button" className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleAddQuestion} disabled={!newQuestion.question}>Add Question</button>
              </div>
              <div>
                <div className="font-semibold mb-2">Questions</div>
                {newPoll.questions.length === 0 ? <div className="text-gray-400 text-sm">No questions added yet.</div> : (
                  <ul className="list-disc pl-5">
                    {newPoll.questions.map((q, idx) => (
                      <li key={idx} className="mb-1">
                        <span className="font-semibold">{q.question}</span> <span className="text-xs text-gray-500">({q.type})</span>
                        {q.type === 'mcq' && (
                          <span className="text-xs text-gray-400 ml-2">[{q.options.join(', ')}]</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold">Add Poll</button>
            </form>
          </div>
        </div>
      )}
      {/* View Responses Modal */}
      {showResponsesModal && selectedPoll && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowResponsesModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Responses for: {selectedPoll.title}</h3>
            {loading ? <div>Loading...</div> : responses.length === 0 ? <div className="text-gray-400 text-sm">No responses yet.</div> : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-2 py-1">Student</th>
                    {selectedPoll.questions.map((q, idx) => (
                      <th key={idx} className="text-left px-2 py-1">Q{idx + 1}</th>
                    ))}
                    <th className="text-left px-2 py-1">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map(resp => (
                    <tr key={resp._id}>
                      <td className="px-2 py-1">{resp.student?.firstName} {resp.student?.lastName}</td>
                      {resp.answers.map((ans, idx) => (
                        <td key={idx} className="px-2 py-1">{typeof ans === 'number' && selectedPoll.questions[idx].type === 'mcq' ? selectedPoll.questions[idx].options[ans] : ans}</td>
                      ))}
                      <td className="px-2 py-1">{resp.submittedAt ? new Date(resp.submittedAt).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default PollDashboard; 