import React, { useState, useEffect } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { Users, GraduationCap, BookOpen, Calendar, DollarSign, Bell, Plus, UserPlus, Eye, Edit, Trash2, School, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import ClassManager from './ClassManager';
import HostelDashboard from '../Hostel/Dashboard';
import { useNavigate } from 'react-router-dom';

import api from '../../utils/api';

// Helper to fetch schoolId by code
const fetchSchoolIdByCode = async (code) => {
        const response = await api.get('/api/schools');
  const school = response.data.data.schools.find(s => s.code === code);
  return school ? school._id : null;
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('student');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studentForm, setStudentForm] = useState({ firstName: '', lastName: '', classId: '', phone: '', address: '', dateOfBirth: '', gender: '', parentInfo: '' });
  const [teacherForm, setTeacherForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    qualification: '',
    experience: '',
    subjects: [], // Ensure this is always an array
  });
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  
  // Get selected school from localStorage
  const selectedSchool = JSON.parse(localStorage.getItem('selectedSchool'));

  // Use schoolId from user context (no hardcoded value)
  const schoolId = user?.school?._id;

  // Fetch teachers, students, classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        
        if (!schoolId) {
          console.error('No school ID found');
          return;
        }

        const [studentsRes, teachersRes, classesRes] = await Promise.all([
          api.get(`/api/users?role=student&schoolId=${schoolId}`),
          api.get(`/api/users?role=teacher&schoolId=${schoolId}`),
          api.get(`/api/class?schoolId=${schoolId}`)
        ]);
        setStudents(studentsRes.data.data.users || []);
        setTeachers(teachersRes.data.data.users || []);
        setClasses(classesRes.data.data.classes || []);
      } catch (err) { 
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [user.token, schoolId]);

  useEffect(() => {
    if (!schoolId) return;
    api.get(`/api/subject?schoolId=${schoolId}`)
      .then(res => setAllSubjects(res.data.data.subjects || []))
      .catch(() => setAllSubjects([]));
  }, [schoolId]);

  // Create teacher
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!schoolId) {
        toast.error('School not found');
        setLoading(false);
        return;
      }
      const teacherData = {
        ...teacherForm,
        role: 'teacher',
        schoolId: schoolId,
        email: `${teacherForm.firstName.toLowerCase()}.${teacherForm.lastName.toLowerCase()}@${(user.school && user.school.code?.toLowerCase()) || 'school'}.com`,
        password: 'password123' // Default password
      };
      
      const res = await api.post(`/api/users`, teacherData);
      const createdTeacher = res.data.data.user;
      
      // Show credentials to admin
      toast.success(`Teacher created successfully! Login credentials: Username: ${createdTeacher.teacherId}, Password: password123`);
      
      setCredentials(createdTeacher);
      setShowCreateModal(false);
      setTeacherForm({ firstName: '', lastName: '', phone: '', address: '', qualification: '', experience: '', subjects: [] });
      // Refresh teachers
              const teachersRes = await api.get(`/api/users?role=teacher&schoolId=${schoolId}`);
      setTeachers(teachersRes.data.data.users || []);
    } catch (err) { 
      console.error('Error creating teacher:', err);
      toast.error('Failed to create teacher');
    }
    setLoading(false);
  };

  // Create student
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!schoolId) {
        toast.error('School not found');
        setLoading(false);
        return;
      }
      const studentData = {
        ...studentForm,
        role: 'student',
        schoolId: schoolId,
        email: `${studentForm.firstName.toLowerCase()}.${studentForm.lastName.toLowerCase()}@${(user.school && user.school.code?.toLowerCase()) || 'school'}.com`,
        password: 'password123' // Default password
      };
      
      const res = await api.post(`/api/users`, studentData);
      const createdStudent = res.data.data.user;
      
      // Show credentials to admin
      toast.success(`Student created successfully! Login credentials: Username: ${createdStudent.studentId}, Password: password123`);
      
      setCredentials(createdStudent);
      setShowCreateModal(false);
      setStudentForm({ firstName: '', lastName: '', classId: '', phone: '', address: '', dateOfBirth: '', gender: '', parentInfo: '' });
      // Refresh students
              const studentsRes = await api.get(`/api/users?role=student&schoolId=${schoolId}`);
      setStudents(studentsRes.data.data.users || []);
    } catch (err) { 
      console.error('Error creating student:', err);
      toast.error('Failed to create student');
    }
    setLoading(false);
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Welcome Message */}
      {selectedSchool && (
        <div className="bg-black rounded-xl p-6 mb-6 flex items-center shadow-lg border border-yellow-400/30">
          <div className="w-14 h-14 bg-yellow-500 rounded-lg flex items-center justify-center mr-6">
            <School className="w-8 h-8 text-black" />
              </div>
              <div>
            <h2 className="text-2xl font-bold text-yellow-300 mb-1">
                  Welcome to {selectedSchool.name}
                </h2>
            <p className="text-white font-medium">
                  School Code: {selectedSchool.code} • Location: {selectedSchool.address?.city}, {selectedSchool.address?.state}
                </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center shadow-lg border border-white/50">
          <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
          <div className="ml-6">
            <p className="text-base font-medium text-gray-800">Total Students</p>
            <p className="text-3xl font-bold text-gray-800">{students.length}</p>
            <p className="text-sm text-green-600">Present: {students.filter(s => s.status === 'active').length}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center shadow-lg border border-white/50">
          <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-600" />
              </div>
          <div className="ml-6">
            <p className="text-base font-medium text-gray-800">Total Teachers</p>
            <p className="text-3xl font-bold text-gray-800">{teachers.length}</p>
                <p className="text-sm text-gray-800">Active Staff</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center shadow-lg border border-white/50">
          <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-yellow-600" />
              </div>
          <div className="ml-6">
            <p className="text-base font-medium text-gray-800">Total Classes</p>
            <p className="text-3xl font-bold text-gray-800">{classes.length}</p>
                <p className="text-sm text-gray-800">Active Classes</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center shadow-lg border border-white/50">
          <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-green-600" />
              </div>
          <div className="ml-6">
            <p className="text-base font-medium text-gray-800">Pending Fees</p>
            <p className="text-3xl font-bold text-gray-800">₹{students.filter(s => s.feeStatus === 'pending').reduce((sum, s) => sum + s.feeAmount, 0).toLocaleString()}</p>
            <p className="text-sm text-green-600">Requires attention</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center shadow-lg border border-white/50">
          <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Bell className="w-8 h-8 text-indigo-600" />
              </div>
          <div className="ml-6">
            <p className="text-base font-medium text-gray-800">Active Notices</p>
            <p className="text-3xl font-bold text-gray-800">{classes.filter(c => c.activeNotices > 0).length}</p>
                <p className="text-sm text-gray-800">Published</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center shadow-lg border border-white/50">
          <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
          <div className="ml-6">
            <p className="text-base font-medium text-gray-800">Attendance Rate</p>
            <p className="text-3xl font-bold text-gray-800">
              {students.length > 0 ? Math.round((students.filter(s => s.status === 'active').length / students.length) * 100) : 0}%
            </p>
            <p className="text-sm text-orange-600">Today</p>
          </div>
        </div>
      </div>
      {/* Quick Actions removed for cleaner UI */}
    </div>
  );

  const renderStudentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Student Management</h3>
        <button 
          onClick={() => {
            setCreateType('student');
            setShowCreateModal(true);
          }}
          className="btn-dark-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              className="input-dark pl-10"
            />
          </div>
        </div>
        <select className="select-dark w-48">
          <option value="">All Classes</option>
          <option value="10A">Class 10A</option>
          <option value="9B">Class 9B</option>
        </select>
      </div>

      <div className="table-dark">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell text-purple-300">Student</th>
                <th className="table-header-cell text-purple-300">Class</th>
                <th className="table-header-cell text-purple-300">Contact</th>
                <th className="table-header-cell text-purple-300">Fee Status</th>
                <th className="table-header-cell text-purple-300">Status</th>
                <th className="table-header-cell text-purple-300">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {students.map((student) => (
                <tr key={student._id} className="border-b border-gray-700">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-white">{student.firstName} {student.lastName}</div>
                      <div className="text-sm text-gray-300">{student.studentId}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="font-medium text-gray-200">{student.class.name} - {student.class.section}</span>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="text-sm text-gray-200">{student.email}</div>
                      <div className="text-sm text-gray-300">{student.phone}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      student.feeStatus === 'paid' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {student.feeStatus}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      student.status === 'active' ? 'badge-success' : 'badge-secondary'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-purple-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-purple-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTeachersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Teacher Management</h3>
        <button 
          onClick={() => {
            setCreateType('teacher');
            setShowCreateModal(true);
          }}
          className="btn-dark-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </button>
      </div>

      <div className="table-dark">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell text-purple-300">Teacher</th>
                <th className="table-header-cell text-purple-300">Subject</th>
                <th className="table-header-cell text-purple-300">Contact</th>
                <th className="table-header-cell text-purple-300">Experience</th>
                <th className="table-header-cell text-purple-300">Status</th>
                <th className="table-header-cell text-purple-300">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="border-b border-gray-700">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-white">{teacher.firstName} {teacher.lastName}</div>
                      <div className="text-sm text-gray-300">{teacher.teacherId}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="font-medium text-gray-200">{Array.isArray(teacher.subjects) ? teacher.subjects.map(id => allSubjects.find(subj => subj._id === id)?.name).join(', ') : ''}</span>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="text-sm text-gray-200">{teacher.email}</div>
                      <div className="text-sm text-gray-300">{teacher.phone}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="font-medium text-gray-200">{teacher.experience} years</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      teacher.status === 'active' ? 'badge-success' : 'badge-secondary'
                    }`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-purple-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-purple-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderClassesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Class Management</h3>
      <ClassManager user={user} onSelectSection={setSelectedSection} />
      {/* Optionally, after selecting a section, render subject/student managers here */}
    </div>
  );

  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="mb-8 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/50">
          <div className="border-b border-white/30 pb-4 px-8 pt-8">
            <h2 className="text-3xl font-bold text-purple-900 tracking-tight">Dashboard Overview</h2>
          </div>
          <div className="pt-6 px-8">
            <div className="animate-fade-in">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'students' && renderStudentsTab()}
            {activeTab === 'teachers' && renderTeachersTab()}
            {activeTab === 'classes' && renderClassesTab()}
          </div>
        </div>
      </div>
      </main>
      {/* Footer */}
      <footer className="w-full py-6 bg-white/80 backdrop-blur-sm border-t border-purple-300/30 text-center text-xs text-gray-600 font-medium tracking-wide">
        &copy; {new Date().getFullYear()} {selectedSchool?.name || 'Your School'} OhYes!. All rights reserved.
      </footer>
      {/* Font stack and fade-in animation */}
      <style>{`
        html { font-family: Inter, Roboto, 'Segoe UI', Arial, sans-serif; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        .tab:focus { outline: 2px solid #2563eb; outline-offset: 2px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;