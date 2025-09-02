import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, Loader2, Edit, Trash2, ChevronRight, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const getAcademicYearOptions = () => {
  const now = new Date();
  const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1; // Academic year usually starts mid-year
  return Array.from({ length: 5 }, (_, i) => {
    const y1 = startYear + i;
    const y2 = (y1 + 1).toString().slice(-2);
    return { value: `${y1}-${y2}`, label: `${y1}-${y2}` };
  });
};
const initialClassForm = { number: '', academicYear: '2025-26' };
const initialSectionForm = { name: '' };
const initialSubjectForm = { name: '', teacherId: '' };
const initialStudentForm = { firstName: '', lastName: '', email: '', password: '' };

const ClassManager = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [classForm, setClassForm] = useState(initialClassForm);
  const [sectionForm, setSectionForm] = useState(initialSectionForm);
  const [subjectForm, setSubjectForm] = useState(initialSubjectForm);
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [formError, setFormError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [promoteLoading, setPromoteLoading] = useState(false);

  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [classSections, setClassSections] = useState({}); // {classId: [sections]}

  // Remove all hardcoded schoolId and auto-selection logic
  // Only use user.school._id for all school logic
  // If user.school or user.school._id is missing, show a clear error and do not try to patch it
  const schoolId = authUser?.school?._id || (authUser?.schoolId?._id || authUser?.schoolId);

  // Fetch all classes and their sections
  const fetchClassesAndSections = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/class?schoolId=${schoolId}`);
      const classList = res.data.data.classes || [];
      setClasses(classList);
      // Fetch sections for each class
      const sectionsMap = {};
      await Promise.all(classList.map(async (cls) => {
        try {
          const secRes = await api.get(`/api/section?classId=${cls._id}`);
          // Use only secRes.data.sections for mapping
          const sectionsArr = secRes.data.sections || [];
          sectionsMap[cls._id] = sectionsArr.map(sec => ({
            _id: sec._id,
            name: sec.name
          }));
          console.log('Mapped sections for class', cls._id, sectionsMap[cls._id]);
        } catch {
          sectionsMap[cls._id] = [];
        }
      }));
      setClassSections(sectionsMap);
    } catch (err) {
      toast.error('Failed to load classes or sections');
    }
    setLoading(false);
  };

  // Fetch sections for a class
  const fetchSections = async (classId) => {
    if (!schoolId || !classId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/section/all?schoolId=${schoolId}&classId=${classId}`);
      setSections(res.data.data.classSections || []);
    } catch (err) {
      toast.error('Failed to load sections');
    }
    setLoading(false);
  };

  // Fetch subjects for a section
  const fetchSubjects = async (sectionId) => {
    if (!sectionId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/subject?sectionId=${sectionId}`);
      setSubjects(res.data.data.subjects || []);
    } catch (err) {
      toast.error('Failed to load subjects');
    }
    setLoading(false);
  };

  // Fetch students for a section
  const fetchStudents = async (sectionId) => {
    if (!sectionId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/student/admin?sectionId=${sectionId}`);
      setStudents(res.data.data.students || []);
    } catch (err) {
      toast.error('Failed to load students');
    }
    setLoading(false);
  };

  // Fetch teachers for subject assignment
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/teacher/admin?schoolId=${schoolId}`);
      setTeachers(res.data || []);
    } catch (err) {
      toast.error('Failed to load teachers');
    }
    setLoading(false);
  };

  // Promotion handler
  const handlePromoteClasses = async () => {
    setPromoteLoading(true);
    try {
      // Call backend endpoint to promote classes (to be implemented)
      const currentYear = selectedYear || (classes[0]?.academicYear);
      let nextYear = '';
      if (currentYear) {
        const [startYear] = currentYear.split('-');
        const nextStartYear = parseInt(startYear) + 1;
        const nextEndYear = nextStartYear + 1;
        nextYear = `${nextStartYear}-${nextEndYear.toString().slice(-2)}`;
      }
      
      console.log('Promotion Details:', {
        currentYear,
        nextYear,
        schoolId,
        classesCount: classes.length
      });
      
      const response = await api.post('/api/class/promote', { currentAcademicYear: currentYear, nextAcademicYear: nextYear, schoolId });
      console.log('Promotion Response:', response.data);
      
      toast.success('Classes and students promoted!');
      setShowPromoteConfirm(false);
      fetchClassesAndSections();
    } catch (err) {
      console.error('Promotion Error:', err);
      toast.error('Promotion failed.');
    }
    setPromoteLoading(false);
  };

  useEffect(() => {
    if (!schoolId) {
      toast.error('No school selected. Please select a school.');
      return;
    }
    fetchClassesAndSections();
  }, [schoolId, authUser]);

  if (!schoolId) {
    return <div className="text-center text-red-600 mt-8">No school selected. Please select a school.</div>;
  }

  // Add Class
  const handleAddClass = async (e) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    if (!schoolId) {
      setFormError('No school selected. Please select a school.');
      setLoading(false);
      return;
    }
    const payload = { ...classForm, schoolId, academicYear: classForm.academicYear };
    try {
      await api.post('/api/class', payload);
      setClassForm(initialClassForm);
      setShowAddClassModal(false);
      fetchClassesAndSections(); // Refresh classes and sections
      toast.success('Class created!');
    } catch (err) {
      setFormError('Failed to create class');
    }
    setLoading(false);
  };

  // Add Section
  const handleAddSection = async (e) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      await api.post('/api/section', {
        classId: selectedClass._id,
        name: sectionForm.name,
        schoolId
      });
      setSectionForm(initialSectionForm);
      setShowAddSectionModal(false);
      fetchSections(selectedClass._id);
      fetchClassesAndSections(); // Refresh classes and sections
      toast.success('Section added!');
    } catch (err) {
      setFormError('Failed to add section');
    }
    setLoading(false);
  };

  // Add Subject (now allows creation without section)
  const handleAddSubject = async (e) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      await api.post('/api/subject', {
        name: subjectForm.name,
        teacherId: subjectForm.teacherId || undefined,
        schoolId
      });
      setSubjectForm(initialSubjectForm);
      setShowAddSubjectModal(false);
      // Optionally refresh subjects if needed
      toast.success('Subject added!');
    } catch (err) {
      setFormError('Failed to add subject');
    }
    setLoading(false);
  };

  // Add Student (now allows creation without section/class)
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      await api.post('/api/student/admin', {
        ...studentForm,
        schoolId
      });
      setStudentForm(initialStudentForm);
      setShowAddStudentModal(false);
      // Optionally refresh students if needed
      toast.success('Student added!');
    } catch (err) {
      setFormError('Failed to add student');
    }
    setLoading(false);
  };

  // Delete Class Handler
  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/api/class/${classToDelete._id}`);
      setShowDeleteConfirm(false);
      setClassToDelete(null);
      fetchClassesAndSections();
      toast.success('Class deleted!');
    } catch (err) {
      toast.error('Failed to delete class');
    }
    setLoading(false);
  };

  // UI
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

      <div className="py-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-blue-900">Class Management</h2>
          <select
            className="input input-bordered rounded-lg"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            <option value="">All Years</option>
            {Array.from(new Set(classes.map(cls => cls.academicYear))).sort().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <button
            className="bg-gradient-to-r from-green-600 to-green-400 text-white rounded-full p-4 shadow-xl hover:from-green-700 hover:to-green-500 transition flex items-center gap-2 text-lg font-semibold"
            onClick={() => setShowPromoteConfirm(true)}
            disabled={classes.length === 0}
            title="Promote all classes and students to next academic year"
          >
            <ArrowUpRight className="w-6 h-6" />
            <span className="hidden md:inline">Promote Classes</span>
          </button>
          <button
            className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full p-4 shadow-xl hover:from-blue-800 hover:to-blue-600 transition flex items-center gap-2 text-lg font-semibold"
            onClick={() => setShowAddClassModal(true)}
          >
            <Plus className="w-6 h-6" />
            <span className="hidden md:inline">Add Class</span>
          </button>
        </div>
      </div>
      {/* Class Grid */}
      <div className="flex flex-wrap gap-8 pb-4">
        {(() => {
          const filtered = classes.filter(cls => !selectedYear || cls.academicYear === selectedYear);
          const cards = filtered.map(cls => (
            <div
              key={cls._id}
              className="bg-white rounded-2xl shadow-xl p-8 flex flex-col border border-blue-100 hover:shadow-2xl hover:scale-[1.03] transition-all duration-200 group min-h-[220px] min-w-[320px] relative"
            >
              {/* Section Pills Row */}
              <div className="flex flex-row flex-wrap gap-2 mb-6 items-center justify-between">
                <div className="flex flex-row flex-wrap gap-2">
                  {(classSections[cls._id] || []).map(sec => (
                    <button
                      key={sec._id}
                      className="flex items-center gap-1 px-4 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition shadow-sm text-base"
                      onClick={() => navigate(`/admin/class/${cls._id}/section/${sec._id}`)}
                    >
                      <ChevronRight className="w-4 h-4 text-blue-400" />
                      {sec.name}
                    </button>
                  ))}
                  <button
                    className="flex items-center gap-1 px-4 py-1 rounded-full bg-green-100 text-green-800 font-semibold hover:bg-green-200 transition shadow-sm text-base"
                    onClick={() => { setSelectedClass(cls); setShowAddSectionModal(true); }}
                  >
                    <Plus className="w-4 h-4" /> Add Section
                  </button>
                </div>
                {/* Delete Button Far Right */}
                <button
                  className="p-2 hover:bg-red-50 rounded-full ml-4"
                  title="Delete Class"
                  onClick={() => { setClassToDelete(cls); setShowDeleteConfirm(true); }}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Trash2 className="w-6 h-6 text-red-500" />
                </button>
              </div>
              {/* Class Card Content */}
              <div className="flex-1 flex flex-col justify-center items-center mt-2">
                <div className="text-5xl font-extrabold text-blue-800 group-hover:text-yellow-400 transition">Class {cls.number}</div>
                <div className="text-lg text-gray-500 mt-2">Academic Year: <span className="font-semibold text-blue-700">{cls.academicYear || '2025-26'}</span></div>
              </div>
            </div>
          ));
          // Add ghost cards to fill the last row (3 per row)
          const cardsPerRow = 3;
          const remainder = cards.length % cardsPerRow;
          if (remainder !== 0) {
            for (let i = 0; i < cardsPerRow - remainder; i++) {
              cards.push(<div key={`ghost-${i}`} className="min-w-[320px] flex-1 invisible" />);
            }
          }
          return cards;
        })()}
      </div>
      {/* Subject List */}
      {selectedSection && (
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <button className="mr-4 text-blue-700 hover:text-blue-900" onClick={() => { setSelectedSection(null); setSubjects([]); setStudents([]); }}>
              &larr; Back
            </button>
            <h3 className="text-xl font-bold text-blue-900">Subjects for Section {selectedSection.sectionName || selectedSection.name}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500 py-8">No subjects found for this section.</div>
            ) : (
              subjects.map(sub => (
                <div key={sub._id} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center border border-blue-100">
                  <div className="font-bold text-blue-800">{sub.name}</div>
                  <div className="text-sm text-gray-500 mt-1">Teacher: {sub.teacherId?.firstName ? `${sub.teacherId.firstName} ${sub.teacherId.lastName}` : '-'}</div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-bold text-blue-900">Students in Section {selectedSection.sectionName || selectedSection.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {students.length === 0 ? (
                <div className="col-span-2 text-center text-gray-500 py-8">No students found for this section.</div>
              ) : (
                students.map(stu => (
                  <div key={stu._id} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center border border-blue-100">
                    <div className="font-bold text-blue-800">{stu.firstName} {stu.lastName}</div>
                    <div className="text-sm text-gray-500 mt-1">{stu.email}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowAddClassModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Add Class</h3>
            <form onSubmit={handleAddClass} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Number</label>
                <input
                  type="number"
                  value={classForm.number}
                  onChange={e => setClassForm({ ...classForm, number: e.target.value })}
                  placeholder="e.g. 1, 2, 3"
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <select
                  value={classForm.academicYear}
                  onChange={e => setClassForm({ ...classForm, academicYear: e.target.value })}
                  className="input input-bordered w-full rounded-lg"
                  required
                >
                  {getAcademicYearOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button type="submit" className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 px-6 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}Add
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowAddSectionModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Add Section to Class {selectedClass?.number}</h3>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                <input
                  type="text"
                  value={sectionForm.name}
                  onChange={e => setSectionForm({ ...sectionForm, name: e.target.value.toUpperCase() })}
                  placeholder="e.g. A, B, C"
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}Add
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowAddSubjectModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Add Subject</h3>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Math, Science"
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Teacher</label>
                <select
                  value={subjectForm.teacherId}
                  onChange={e => setSubjectForm({ ...subjectForm, teacherId: e.target.value })}
                  className="input input-bordered w-full rounded-lg"
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}Add
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowAddStudentModal(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Add Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={studentForm.firstName}
                  onChange={e => setStudentForm({ ...studentForm, firstName: e.target.value })}
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={studentForm.lastName}
                  onChange={e => setStudentForm({ ...studentForm, lastName: e.target.value })}
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={studentForm.password}
                  onChange={e => setStudentForm({ ...studentForm, password: e.target.value })}
                  required
                  className="input input-bordered w-full rounded-lg"
                />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition flex items-center justify-center" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}Add
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && classToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowDeleteConfirm(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-red-700 mb-4">Delete Class</h3>
            <p className="mb-6">Are you sure you want to delete <span className="font-bold">Class {classToDelete.number}</span>? This action cannot be undone.</p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                onClick={handleDeleteClass}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> : null}Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Promotion Confirmation Modal */}
      {showPromoteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setShowPromoteConfirm(false)}>&times;</button>
            <h3 className="text-xl font-semibold text-green-700 mb-4">Promote Classes</h3>
            <p className="mb-6">Are you sure you want to promote all classes and students from <span className="font-bold">{selectedYear || (classes[0]?.academicYear)}</span> to the next academic year?</p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                onClick={() => setShowPromoteConfirm(false)}
                disabled={promoteLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                onClick={handlePromoteClasses}
                disabled={promoteLoading}
              >
                {promoteLoading ? <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> : null}Promote
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ClassManager; 