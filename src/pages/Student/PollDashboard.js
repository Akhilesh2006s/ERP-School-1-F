import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

function StudentPollDashboard() {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [prevAnswers, setPrevAnswers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/poll');
      setPolls(res.data);
    } catch {
      setError('Failed to load polls');
    }
    setLoading(false);
  };

  const handleSelectPoll = async (poll) => {
    setSelectedPoll(poll);
    setAnswers(Array(poll.questions.length).fill(''));
    setPrevAnswers(null);
    setSubmitted(false);
    setLoading(true);
    try {
      const res = await api.get(`/api/poll/${poll._id}/responses`);
      // If the student has already submitted, show their previous answers
      if (res.data && Array.isArray(res.data)) {
        const myResp = res.data.find(r => r.student && r.student._id === window.userId); // window.userId should be set from auth context
        if (myResp) {
          setPrevAnswers(myResp.answers);
          setSubmitted(true);
        }
      }
    } catch {}
    setLoading(false);
  };

  const handleAnswerChange = (idx, val) => {
    const arr = [...answers];
    arr[idx] = val;
    setAnswers(arr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post(`/api/poll/${selectedPoll._id}/submit`, { answers });
      setSubmitted(true);
      setPrevAnswers(answers);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      
      <div className="max-w-3xl mx-auto p-6 relative z-10">
      <h1 className="text-3xl font-bold mb-6">Polls & Surveys</h1>
      {loading && <div className="p-4">Loading...</div>}
      {!selectedPoll ? (
        polls.length === 0 ? (
          <div className="text-gray-400 text-sm">No polls available.</div>
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
                  <button className="border px-3 py-1 rounded" onClick={() => handleSelectPoll(poll)}>Fill Survey</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
          <button className="text-blue-600 mb-4" onClick={() => setSelectedPoll(null)}>&larr; Back to Polls</button>
          <h2 className="text-xl font-bold mb-2">{selectedPoll.title}</h2>
          <div className="text-gray-600 mb-4">{selectedPoll.description}</div>
          {submitted ? (
            <div className="text-green-700 font-semibold mb-4">Thank you for your feedback!</div>
          ) : null}
          {prevAnswers ? (
            <div>
              <h3 className="font-semibold mb-2">Your Previous Answers:</h3>
              <ul className="list-disc pl-5">
                {selectedPoll.questions.map((q, idx) => (
                  <li key={idx} className="mb-1">
                    <span className="font-semibold">{q.question}</span>: {q.type === 'mcq' ? q.options[prevAnswers[idx]] : prevAnswers[idx]}
                  </li>
                ))}
              </ul>
            </div>
          ) : !submitted && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedPoll.questions.map((q, idx) => (
                <div key={idx}>
                  <label className="block font-semibold mb-1">Q{idx + 1}. {q.question}</label>
                  {q.type === 'mcq' ? (
                    <select className="input input-bordered w-full rounded-lg" value={answers[idx]} onChange={e => handleAnswerChange(idx, e.target.value)} required>
                      <option value="">Select an option</option>
                      {q.options.map((opt, oidx) => (
                        <option key={oidx} value={oidx}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input className="input input-bordered w-full rounded-lg" value={answers[idx]} onChange={e => handleAnswerChange(idx, e.target.value)} required />
                  )}
                </div>
              ))}
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold">Submit</button>
            </form>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default StudentPollDashboard; 