import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import SubjectManager from './SubjectManager';
import Select from 'react-select';

const SectionDetails = () => {
  const { classId, sectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('subjects');
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allSubjects, setAllSubjects] = useState([]); // All global subjects
  const [assignedSubjects, setAssignedSubjects] = useState([]); // Subjects assigned to this section
  const [subjectToAssign, setSubjectToAssign] = useState('');
  const [teacherToAssign, setTeacherToAssign] = useState('');
  const [assignError, setAssignError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]); // Students assigned to this section
  const [allStudents, setAllStudents] = useState([]); // All students in the school
  const [studentsToAdd, setStudentsToAdd] = useState([]);
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Fetch section, all subjects, all teachers, and all students
  useEffect(() => {
    if (!sectionId || !user) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        // Fetch section info (with students populated)
        const sectionRes = await api.get(`/api/section/${sectionId}`);
        const sectionData = sectionRes.data.data.section;
        setSection(sectionData);
        setStudents(sectionData?.students || []);

        // Fetch all subjects for the school (with teacher info)
        if (user?.school?._id || user?.schoolId) {
          const schoolId = user?.school?._id || user?.schoolId;
          const subjectsRes = await api.get('/api/subject?schoolId=' + schoolId);
          setAllSubjects(subjectsRes.data.data.subjects || []);
        } else {
          setAllSubjects([]);
        }

        // Fetch assigned subjects for this section
        const assignedSubjectsRes = await api.get(`/api/section/${sectionId}/subjects`);
        setAssignedSubjects(assignedSubjectsRes.data.data.subjects || []);

        // Fetch all teachers
        const teachersRes = await api.get('/api/teacher/admin');
        const data = teachersRes.data;
        setTeachers(Array.isArray(data) ? data : (data.teachers || data.data?.teachers || []));

        // Fetch all students in the school
        if (user?.school?._id) {
          const studentsRes = await api.get(`/api/users?role=student&schoolId=${user.school._id}`);
          const allStu = studentsRes.data.data?.users || studentsRes.data.users || [];
          setAllStudents(allStu);
        } else {
          setAllStudents([]);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sectionId, user]);

  // Add subject to section
  const handleAssignSubject = async e => {
    e.preventDefault();
    setAssignError(null);
    setAssigning(true);
    if (!subjectToAssign) {
      setAssignError('Please select a subject to assign.');
      setAssigning(false);
      toast.error('Please select a subject to assign.');
      return;
    }
    try {
      await api.post(`/api/section/${sectionId}/subjects`, { subjectId: subjectToAssign, teacherId: teacherToAssign });
      setSubjectToAssign('');
      setTeacherToAssign('');
      // Refresh assigned subjects
      const res = await api.get(`/api/section/${sectionId}/subjects`);
      console.log('Assigned subjects response:', res.data);
      setAssignedSubjects(res.data.data.subjects || []);
      toast.success('Subject assigned to section!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign subject';
      setAssignError(msg);
      toast.error(msg);
    }
    setAssigning(false);
  };

  // Add multiple students to section
  const handleAddStudents = async () => {
    if (!studentsToAdd.length) return;
    setAddingStudent(true);
    try {
      await api.post(`/api/section/${sectionId}/students`, {
        students: studentsToAdd
      });
      setStudentsToAdd([]);
      // Refresh students list
      const sectionRes = await api.get(`/api/section/${sectionId}`);
      const sectionData = sectionRes.data.data.section;
      setStudents(sectionData?.students || []);
    } finally {
      setAddingStudent(false);
    }
  };

  // Remove a student from the section
  const handleRemoveStudent = async (studentId) => {
    try {
      await api.delete(`/api/section/${sectionId}/students/${studentId}`);
      // Refresh students list
      const sectionRes = await api.get(`/api/section/${sectionId}`);
      const sectionData = sectionRes.data.data.section;
      setStudents(sectionData?.students || []);
      toast.success('Student removed from section');
    } catch (err) {
      toast.error('Failed to remove student');
    }
  };

  // Filter students for search
  const filteredStudents = allStudents.filter(stu => {
    const notAlreadyAdded = !students.some(s => s._id === stu._id);
    const matchesSearch = `${stu.firstName} ${stu.lastName} ${stu.email}`.toLowerCase().includes(studentSearch.toLowerCase());
    return notAlreadyAdded && matchesSearch;
  });

  // Prepare options for react-select
  const studentOptions = allStudents
    .filter(stu => !students.some(s => s._id === stu._id))
    .map(stu => ({ value: stu._id, label: `${stu.firstName} ${stu.lastName} (${stu.email})` }));

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Replace the plain link or text back button with a beautiful button above the section title */}
      <div className="flex items-center mb-8">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg font-semibold shadow hover:from-blue-800 hover:to-blue-600 transition"
          onClick={() => navigate(-1)}
          style={{ alignSelf: 'flex-start' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Section {section?.name || ''}</h2>
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-2 font-semibold ${activeTab === 'subjects' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('subjects')}
        >
          Subjects
        </button>
        <button
          className={`px-6 py-2 font-semibold ${activeTab === 'students' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
      </div>
      {activeTab === 'subjects' && (
        <div>
          {/* Add Subject + Teacher Assignment Form */}
          <form
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-4 mb-8 border border-blue-100"
            onSubmit={handleAssignSubject}
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-blue-900 mb-1">Select Subject</label>
              <select
                className="input input-bordered w-full rounded-lg"
                value={subjectToAssign}
                onChange={e => setSubjectToAssign(e.target.value)}
                required
              >
                <option value="">Select Subject</option>
                {allSubjects
                  .filter(sub => !assignedSubjects.some(as => as.subject._id === sub._id))
                  .map(sub => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-blue-900 mb-1">Assign Teacher</label>
              <select
                className="input input-bordered w-full rounded-lg"
                value={teacherToAssign}
                onChange={e => setTeacherToAssign(e.target.value)}
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName} ({t.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg font-semibold shadow hover:from-blue-800 hover:to-blue-600 transition"
                disabled={assigning}
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
            {assignError && <div className="text-red-600 text-sm mt-2 w-full">{assignError}</div>}
          </form>
          {/* End Assignment Form */}
          {assignedSubjects.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No subjects assigned to this section.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedSubjects.map((subj, idx) => (
                <div key={subj.subject?._id || idx} className="flex items-center justify-between bg-white rounded-xl shadow p-5 border border-blue-100">
                  <div>
                    <div className="font-semibold text-blue-800 text-lg">{subj.subject?.name || 'Unknown Subject'}</div>
                    <div className="text-sm text-gray-500">Code: {subj.subject?.code || '-'}</div>
                    <div className="text-sm text-blue-700 mt-1">
                      {subj.teacher ? (
                        <span>Teacher: <span className="font-semibold">{subj.teacher.firstName} {subj.teacher.lastName}</span> ({subj.teacher.email})</span>
                      ) : (
                        <span className="text-gray-400">No teacher assigned</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold shadow hover:bg-red-600 transition"
                    onClick={async () => {
                      await api.put(`/api/section/${sectionId}/remove-subject`, { subjectId: subj.subject._id });
                                              const res = await api.get(`/api/section/${sectionId}/subjects`);
                      setAssignedSubjects(res.data.data.subjects || []);
                      toast.success('Subject removed from section');
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'students' && (
        <div>
          <h3 className="text-xl font-bold text-blue-900 mb-6">Students in this Section</h3>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-100">
            <label className="block text-sm font-medium text-blue-900 mb-2">Add Students</label>
            <Select
              isMulti
              options={studentOptions}
              value={studentOptions.filter(opt => studentsToAdd.includes(opt.value))}
              onChange={selected => setStudentsToAdd(selected.map(opt => opt.value))}
              classNamePrefix="react-select"
              placeholder="Search and select students..."
            />
            <button
              onClick={handleAddStudents}
              className="mt-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-blue-800 hover:to-blue-600 transition"
              disabled={addingStudent || !studentsToAdd.length}
            >
              {addingStudent ? 'Adding...' : 'Add Selected Students'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500 py-8">No students found for this section.</div>
            ) : (
              students.map(stu => (
                <div key={stu._id} className="bg-white rounded-xl shadow p-5 flex flex-col items-center border border-blue-100">
                  <div className="font-bold text-blue-800 text-lg">{stu.firstName} {stu.lastName}</div>
                  <div className="text-sm text-gray-500 mt-1">{stu.email}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionDetails; 