import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TeacherAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/class')
      .then(res => setClasses(res.data.classes || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      api.get(`/api/section/class/${selectedClass}`)
        .then(res => setSections(res.data.sections || []));
    } else {
      setSections([]);
    }
    setSelectedSection('');
  }, [selectedClass]);

  const handleGo = () => {
    if (selectedClass && selectedSection) {
      navigate(`/teacher/attendance/${selectedClass}/${selectedSection}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">Mark Attendance</h1>
      {loading ? <div className="text-gray-300">Loading classes...</div> : (
        <>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-white">Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="select-dark w-full">
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-white">Section</label>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="select-dark w-full" disabled={!selectedClass}>
              <option value="">Select Section</option>
              {sections.map(sec => (
                <option key={sec._id} value={sec._id}>{sec.name}</option>
              ))}
            </select>
          </div>
          <button className="btn-dark-primary w-full" onClick={handleGo} disabled={!selectedClass || !selectedSection}>Go</button>
        </>
      )}
    </div>
  );
};

export default TeacherAttendance; 