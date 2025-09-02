import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('teachers');
  const [search, setSearch] = useState('');

  return (
    <div className="max-w-5xl mx-auto py-8">
      <button className="mb-4 text-blue-700 hover:text-blue-900" onClick={() => navigate(-1)}>&larr; Back</button>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Class Details (ID: {classId})</h2>
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-2 font-semibold ${activeTab === 'teachers' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('teachers')}
        >
          Teachers
        </button>
        <button
          className={`px-6 py-2 font-semibold ${activeTab === 'students' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input input-bordered rounded-lg w-64"
        />
        <button className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">Add {activeTab === 'teachers' ? 'Teacher' : 'Student'}</button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 min-h-[200px]">
        {/* Placeholder for list of teachers/students, to be implemented */}
        <div className="text-gray-500 text-center py-12">
          {activeTab === 'teachers' ? 'Teacher list goes here.' : 'Student list goes here.'}
        </div>
      </div>
    </div>
  );
};

export default ClassDetails; 