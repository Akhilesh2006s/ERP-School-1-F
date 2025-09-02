import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap } from 'lucide-react';

const GradesAndMarks = () => {
  const { user, token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClassSection, setSelectedClassSection] = useState('');
  const [marksStudents, setMarksStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [marksMsg, setMarksMsg] = useState('');
  const [marksLoading, setMarksLoading] = useState(false);

  // Fetch teacher assignments
  useEffect(() => {
    axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAssignments(res.data?.data?.user?.assignments || []))
      .catch(() => setAssignments([]));
  }, [token]);

  // Fetch exams
  useEffect(() => {
    axios.get('/api/exam', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setExams(res.data.exams || []))
      .catch(() => setExams([]));
  }, [token]);

  // Fetch students for selected class/section
  useEffect(() => {
    if (!selectedExam || !selectedClassSection) return;
    const [classId, sectionId] = selectedClassSection.split('::');
    setMarksLoading(true);
    axios.get(`/api/teacher/class-section-students?classId=${classId}&sectionId=${sectionId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setMarksStudents(res.data.students || []))
      .catch(() => setMarksStudents([]))
      .finally(() => setMarksLoading(false));
  }, [selectedExam, selectedClassSection, token]);

  const handleSaveMarks = async () => {
    setMarksMsg('');
    try {
      await axios.post(`/api/exam/${selectedExam._id}/marks`, {
        marks: Object.entries(marks).map(([student, marksObtained]) => ({ student, marksObtained }))
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMarksMsg('Marks updated!');
    } catch {
      setMarksMsg('Failed to update marks.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-900 flex items-center gap-2"><GraduationCap /> Grades & Marks</h1>
      {/* Exam Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {exams.map(exam => (
          <div
            key={exam._id}
            className={`bg-white rounded-xl shadow p-6 border border-blue-100 flex flex-col gap-2 cursor-pointer hover:bg-blue-50 transition ${selectedExam && selectedExam._id === exam._id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => { setSelectedExam(exam); setSelectedClassSection(''); setMarks({}); setMarksStudents([]); }}
          >
            <div className="font-bold text-lg text-blue-900 mb-1">{exam.name}</div>
            <div className="text-gray-700 text-sm mb-1">Max Marks: <span className="font-semibold">{exam.maxMarks}</span></div>
            <div className="text-gray-700 text-sm mb-1">{exam.date ? `Date: ${new Date(exam.date).toLocaleDateString()}` : ''}</div>
          </div>
        ))}
      </div>
      {/* Class/Section Dropdown */}
      {selectedExam && (
        <div className="mb-6 flex gap-4 items-center">
          <label className="font-semibold">Class/Section:</label>
          <select
            value={selectedClassSection}
            onChange={e => { setSelectedClassSection(e.target.value); setMarks({}); }}
            className="input"
          >
            <option value="">Select...</option>
            {assignments.map(a => (
              <option key={a.class._id + '::' + a.section._id} value={a.class._id + '::' + a.section._id}>
                {a.class.name} - {a.section.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Students Table */}
      {selectedExam && selectedClassSection && (
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
          <h2 className="text-lg font-semibold mb-4">Enter Marks</h2>
          {marksLoading ? <div>Loading students...</div> : marksStudents.length === 0 ? <div>No students found.</div> : (
            <table className="min-w-full mb-4">
              <thead>
                <tr>
                  <th className="text-left py-2">Student</th>
                  <th className="text-left py-2">Roll No</th>
                  <th className="text-left py-2">Marks</th>
                </tr>
              </thead>
              <tbody>
                {marksStudents.map(stu => (
                  <tr key={stu._id}>
                    <td className="py-2">{stu.firstName} {stu.lastName}</td>
                    <td className="py-2">{stu.studentId}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        value={marks[stu._id] || ''}
                        onChange={e => setMarks({ ...marks, [stu._id]: e.target.value })}
                        className="input"
                        min="0"
                        max={selectedExam.maxMarks}
                        placeholder={`Max ${selectedExam.maxMarks}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button className="btn btn-primary" onClick={handleSaveMarks}>Update</button>
          {marksMsg && <div className="mt-2 text-green-600">{marksMsg}</div>}
        </div>
      )}
    </div>
  );
};

export default GradesAndMarks; 