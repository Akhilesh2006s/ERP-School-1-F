import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import { GraduationCap, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '';
  return (firstName?.[0] || '') + (lastName?.[0] || '');
};

const Marks = () => {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClassSection, setSelectedClassSection] = useState('');
  const [marksStudents, setMarksStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [marksMsg, setMarksMsg] = useState('');
  const [marksLoading, setMarksLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const inputRefs = useRef({});

  useEffect(() => {
    api.get('/api/auth/me')
      .then(res => setAssignments(res.data?.data?.user?.assignments || []))
      .catch(() => setAssignments([]));
  }, [token]);

  useEffect(() => {
    api.get('/api/exam')
      .then(res => setExams(res.data.exams || []))
      .catch(() => setExams([]));
  }, [token]);

  const fetchMarks = async (examId, classId, sectionId, subjectId) => {
    if (!subjectId) { setMarks({}); return; }
    try {
      const res = await api.get(`/api/exam/${examId}/marks/class-section?classId=${classId}&sectionId=${sectionId}&subjectId=${subjectId}`);
      const marksMap = {};
      (res.data.marks || []).forEach(m => { marksMap[m.student] = m.marksObtained; });
      setMarks(marksMap);
    } catch {
      setMarks({});
    }
  };

  // Fetch marks when exam, class/section, or subject changes
  useEffect(() => {
    if (!selectedExam || !selectedClassSection || !selectedSubject) { setMarks({}); return; }
    const [classId, sectionId] = selectedClassSection.split('::');
    setMarksLoading(true);
    api.get(`/api/teacher/class-section-students?classId=${classId}&sectionId=${sectionId}`)
      .then(res => setMarksStudents(res.data.students || []))
      .catch(() => setMarksStudents([]))
      .finally(() => {
        setMarksLoading(false);
        fetchMarks(selectedExam._id, classId, sectionId, selectedSubject);
      });
  }, [selectedExam, selectedClassSection, selectedSubject, token]);

  // When subject changes, clear marks state
  useEffect(() => {
    setMarks({});
  }, [selectedSubject]);

  const handleSaveMarks = async () => {
    setMarksMsg('');
    if (!selectedSubject) {
      setMarksMsg('Please select a subject.');
      return;
    }
    try {
      await api.post(`/api/exam/${selectedExam._id}/marks`, {
        marks: Object.entries(marks).map(([student, marksObtained]) => ({ student, marksObtained, subject: selectedSubject }))
      });
      setMarksMsg('Marks updated!');
      // Refetch marks after saving
      const [classId, sectionId] = selectedClassSection.split('::');
      fetchMarks(selectedExam._id, classId, sectionId, selectedSubject);
    } catch {
      setMarksMsg('Failed to update marks.');
    }
  };

  // Helper: validate mark
  const isValidMark = (val) => {
    if (val === '' || val === undefined) return false;
    const num = Number(val);
    return !isNaN(num) && num >= 0 && num <= (selectedExam?.maxMarks || 0);
  };

  // Filter students by search
  const filteredStudents = (marksStudents || []).filter(stu => {
    if (!stu || !stu._id) return false;
    const name = `${stu.firstName || ''} ${stu.lastName || ''}`.toLowerCase();
    const roll = (stu.studentId || '').toLowerCase();
    return name.includes(search.toLowerCase()) || roll.includes(search.toLowerCase());
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

      <div className="max-w-5xl mx-auto p-8 relative z-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"><GraduationCap className="text-purple-600" /> Marks</h1>
      {/* Exam Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {exams.map(exam => {
          if (!exam || !exam._id) return null;
          return (
            <div
              key={exam._id}
              className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/50 flex flex-col gap-2 cursor-pointer hover:shadow-xl transition ${selectedExam && selectedExam._id === exam._id ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => { setSelectedExam(exam); setSelectedClassSection(''); setMarks({}); setMarksStudents([]); }}
            >
              <div className="font-bold text-lg text-gray-800 mb-1">{exam.name}</div>
              <div className="text-gray-600 text-sm mb-1">Max Marks: <span className="font-semibold">{exam.maxMarks}</span></div>
              <div className="text-gray-600 text-sm mb-1">{exam.date ? `Date: ${new Date(exam.date).toLocaleDateString()}` : ''}</div>
            </div>
          );
        })}
      </div>
      {/* Class/Section Selection Cards */}
      {selectedExam && (
        <div className="mb-6">
          <div className="font-semibold mb-2 text-gray-800">Class/Section:</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assignments.map(a => {
              if (!a || !a.class || !a.class._id || !a.section || !a.section._id) return null;
              const value = a.class._id + '::' + a.section._id;
              const isSelected = selectedClassSection === value;
              return (
                <button
                  key={value}
                  className={`rounded-lg border px-4 py-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium ${isSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/80 backdrop-blur-sm text-gray-800 border-white/50 hover:shadow-lg'}`}
                  onClick={() => { setSelectedClassSection(value); setMarks({}); }}
                >
                  <div className="text-base">{a.class.name} - {a.section.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {selectedExam && selectedClassSection && (
        <>
          {/* Subject Dropdown */}
          <div className="mb-4">
            <label className="font-semibold mr-2 text-gray-800">Subject:</label>
            <select
              className="select-dark"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">Select Subject</option>
              {assignments
                .filter(a => a && a.subject && a.subject._id && (a.class && a.class._id && a.section && a.section._id) && (a.class._id + '::' + a.section._id) === selectedClassSection)
                .map(a => (
                  <option key={a.subject._id} value={a.subject._id}>
                    {a.subject.name}
                  </option>
                ))}
            </select>
          </div>
          {/* Students Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/50">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Enter Marks</h2>
            {/* Search/filter box */}
            <div className="mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="input-dark w-64"
                placeholder="Search by name or roll no..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Batch Actions */}
            <div className="mb-4 flex gap-2">
              <button
                className="btn btn-sm bg-purple-900/50 text-purple-200 hover:bg-purple-800/50 border border-purple-500/30"
                type="button"
                onClick={() => {
                  const newMarks = { ...marks };
                  filteredStudents.forEach(stu => {
                    if (!stu || !stu._id) return;
                    newMarks[stu._id] = selectedExam.maxMarks;
                  });
                  setMarks(newMarks);
                }}
              >
                Fill All (Max)
              </button>
              <button
                className="btn btn-sm bg-gray-700/50 text-gray-200 hover:bg-gray-600/50 border border-gray-500/30"
                type="button"
                onClick={() => {
                  const newMarks = { ...marks };
                  filteredStudents.forEach(stu => {
                    if (!stu || !stu._id) return;
                    newMarks[stu._id] = '';
                  });
                  setMarks(newMarks);
                }}
              >
                Clear All
              </button>
              <button
                className="btn btn-sm bg-green-900/50 text-green-200 hover:bg-green-800/50 border border-green-500/30"
                type="button"
                onClick={handleSaveMarks}
              >
                Save All
              </button>
            </div>
            {marksLoading ? <div className="text-gray-300">Loading students...</div> : filteredStudents.length === 0 ? <div className="text-gray-300">No students found.</div> : (
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full mb-4">
                  <thead className="sticky top-0 bg-gray-800 z-10">
                    <tr>
                      <th className="text-left py-2 text-purple-300">Student</th>
                      <th className="text-left py-2 text-purple-300">Roll No</th>
                      <th className="text-left py-2 text-purple-300">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((stu, idx) => {
                      if (!stu || !stu._id) return null;
                      return (
                        <tr key={stu._id} className="border-b border-gray-700">
                          <td className="py-2 flex items-center gap-2 text-gray-200">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-900/50 text-purple-200 font-bold text-sm border border-purple-500/30">
                              {getInitials(stu.firstName, stu.lastName)}
                            </span>
                            {stu.firstName} {stu.lastName}
                          </td>
                          <td className="py-2 text-gray-200">{stu.studentId}</td>
                          <td className="py-2">
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                ref={el => inputRefs.current[stu._id] = el}
                                value={marks[stu._id] || ''}
                                onChange={e => setMarks({ ...marks, [stu._id]: e.target.value })}
                                className={`input-dark pr-8 ${isValidMark(marks[stu._id]) || marks[stu._id] === undefined || marks[stu._id] === '' ? '' : 'border-red-500 bg-red-900/50'}`}
                                min="0"
                                max={selectedExam.maxMarks}
                                placeholder={`Max ${selectedExam.maxMarks}`}
                                onKeyDown={e => {
                                  // Keyboard navigation
                                  if (['Enter', 'Tab', 'ArrowDown'].includes(e.key)) {
                                    e.preventDefault();
                                    const nextIdx = idx + 1;
                                    if (nextIdx < filteredStudents.length) {
                                      inputRefs.current[filteredStudents[nextIdx]._id]?.focus();
                                    }
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    const prevIdx = idx - 1;
                                    if (prevIdx >= 0) {
                                      inputRefs.current[filteredStudents[prevIdx]._id]?.focus();
                                    }
                                  }
                                }}
                              />
                              {/* Validation checkmark or warning */}
                              {isValidMark(marks[stu._id]) && (
                                <span className="absolute right-2 text-green-400" title="Valid">
                                  ✓
                                </span>
                              )}
                              {!isValidMark(marks[stu._id]) && marks[stu._id] !== undefined && marks[stu._id] !== '' && (
                                <span className="absolute right-2 text-red-400" title="Invalid">
                                  !
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {/* Replace the old Update button with a new Save Marks button */}
            <button className="btn btn-lg bg-purple-600 text-white hover:bg-purple-700 mt-4 w-full" onClick={handleSaveMarks}>
              Save Marks
            </button>
            {marksMsg && <div className="mt-2 text-green-400">{marksMsg}</div>}
          </div>
        </>
      )}
    </div>
  </div>
  );
};

export default Marks; 