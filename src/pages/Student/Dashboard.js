import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  FileText,
  Bell,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  GraduationCap,
  User,
  DollarSign,
  Award,
  Mail,
  Trophy,
  Star,
  Medal
} from 'lucide-react';

// Mock data for demonstration
const mockAttendance = {
  totalDays: 180,
  presentDays: 165,
  absentDays: 15,
  percentage: 92
};

const mockSubjects = [
  { id: 1, name: 'Mathematics', teacher: 'Dr. Sarah Wilson', grade: 'A+', marks: 95 },
  { id: 2, name: 'Physics', teacher: 'Prof. David Brown', grade: 'A', marks: 88 },
  { id: 3, name: 'Chemistry', teacher: 'Dr. Emily Davis', grade: 'A', marks: 90 },
  { id: 4, name: 'English', teacher: 'Ms. Lisa Johnson', grade: 'B+', marks: 82 },
  { id: 5, name: 'History', teacher: 'Mr. Robert Smith', grade: 'A-', marks: 85 }
];

const mockHomework = [
  {
    id: 1,
    title: 'Algebra Practice Problems',
    subject: 'Mathematics',
    assignedDate: '2024-01-10',
    dueDate: '2024-01-15',
    status: 'submitted',
    grade: 'A',
    feedback: 'Excellent work! Keep it up.'
  },
  {
    id: 2,
    title: 'Physics Lab Report',
    subject: 'Physics',
    assignedDate: '2024-01-12',
    dueDate: '2024-01-18',
    status: 'pending',
    grade: null,
    feedback: null
  },
  {
    id: 3,
    title: 'Essay on World War II',
    subject: 'History',
    assignedDate: '2024-01-08',
    dueDate: '2024-01-20',
    status: 'graded',
    grade: 'B+',
    feedback: 'Good analysis, but could use more detail.'
  }
];

const mockNotices = [
  {
    id: 1,
    title: 'Parent-Teacher Meeting',
    content: 'Scheduled for next Friday at 2 PM in the school auditorium.',
    type: 'event',
    date: '2024-01-15',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Mid-term Exam Schedule',
    content: 'Mid-term examinations will commence from February 1st, 2024.',
    type: 'academic',
    date: '2024-01-14',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Library Book Return',
    content: 'Please return all borrowed books by January 25th.',
    type: 'general',
    date: '2024-01-13',
    priority: 'low'
  }
];

const typeColors = {
  important: 'bg-red-100 text-red-700',
  notice: 'bg-blue-100 text-blue-700',
  reminder: 'bg-yellow-100 text-yellow-700',
};

const categories = [
  { name: 'Academic', color: 'bg-blue-100', icon: '🏆' },
  { name: 'Sports', color: 'bg-green-100', icon: '🥇' },
  { name: 'Arts', color: 'bg-purple-100', icon: '⭐' },
  { name: 'Leadership', color: 'bg-yellow-100', icon: '🎖️' },
];

const StudentDashboard = () => {
  const { user, logout, token } = useAuth();
  const selectedSchool = JSON.parse(localStorage.getItem('selectedSchool'));
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFile, setSelectedFile] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [homework, setHomework] = useState([]);
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  const [homeworkError, setHomeworkError] = useState('');
  const [submitting, setSubmitting] = useState({});
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticesError, setNoticesError] = useState('');
  const [materials, setMaterials] = useState([]);
  const [todos, setTodos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [hostelInfo, setHostelInfo] = useState(null);
  const [hostelLoading, setHostelLoading] = useState(false);
  const [hostelError, setHostelError] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [awards, setAwards] = useState([]);
  const [achLoading, setAchLoading] = useState(false);
  const [achError, setAchError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError('');
      try {
        // Use the current user data as student data
        setStudentData(user);
      } catch (err) {
        setError('Failed to load student data.');
        console.error('Error fetching student data:', err);
      }
      setLoading(false);
    };
    fetchStudentData();
  }, [user]);

  // Fetch attendance data when student data is loaded
  useEffect(() => {
    if (!studentData) return;
    setAttendanceLoading(true);
    setAttendanceError('');
          api.get(`/api/attendance/student/${studentData._id}`)
      .then(res => {
        setAttendanceData(res.data.data);
      })
      .catch(() => setAttendanceError('Failed to load attendance.'))
      .finally(() => setAttendanceLoading(false));
  }, [studentData, token]);

  // Fetch homework when student data is loaded
  useEffect(() => {
    if (!studentData) return;
    setHomeworkLoading(true);
    setHomeworkError('');
    api.get('/api/student/homework')
      .then(res => {
        setHomework(res.data.data.homework || []);
      })
      .catch(() => setHomeworkError('Failed to load homework.'))
      .finally(() => setHomeworkLoading(false));
  }, [studentData, token]);

  // Fetch notices when the Notices tab is active
  useEffect(() => {
    if (activeTab !== 'notices') return;
    setNoticesLoading(true);
    setNoticesError('');
    api.get('/api/notice')
      .then(res => {
        setNotices(res.data.data.notices || []);
      })
      .catch(() => setNoticesError('Failed to load notices.'))
      .finally(() => setNoticesLoading(false));
  }, [activeTab, token]);

  useEffect(() => {
    api.get('/api/teacher/student/materials')
      .then(res => setMaterials(res.data.materials || []));
  }, [token]);

  // Fetch class todos
  useEffect(() => {
    const studentClassId = user?.class?._id || user?.classId || null;
    const studentSectionId = user?.section?._id || user?.sectionId || null;
    if (!studentClassId || !studentSectionId) {
      setTodos([]);
      setTodosLoading(false);
      return;
    }
    setTodosLoading(true);
    api.get(`/api/class-todo?classId=${studentClassId}&sectionId=${studentSectionId}`)
      .then(res => setTodos(res.data.todos || []))
      .catch(() => setTodos([]))
      .finally(() => setTodosLoading(false));
  }, [user]);

  // Fetch communication messages
  useEffect(() => {
    setMessagesLoading(true);
    api.get('/api/student/messages')
      .then(res => setMessages(res.data.data.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }, [token]);

  // Fetch issued/returned books for the student
  useEffect(() => {
    if (activeTab !== 'library' || !user?._id) return;
    setLibraryLoading(true);
    setLibraryError('');
    api.get(`/api/library/transactions?userId=${user._id}`)
      .then(res => setLibraryBooks(res.data || []))
      .catch(() => setLibraryError('Failed to load library books.'))
      .finally(() => setLibraryLoading(false));
  }, [activeTab, user]);

  // Fetch hostel allocation for the student
  useEffect(() => {
    if (activeTab !== 'hostel' || !user?._id) return;
    setHostelLoading(true);
    setHostelError('');
    api.get(`/api/hostel/student/${user._id}`)
      .then(res => setHostelInfo(res.data))
      .catch(() => setHostelError('Failed to load hostel info.'))
      .finally(() => setHostelLoading(false));
  }, [activeTab, user]);

  useEffect(() => {
    const fetchAchievements = async () => {
      setAchLoading(true);
      try {
        const res = await api.get('/api/achievement');
        setAchievements(res.data);
      } catch {
        setAchError('Failed to load achievements');
      }
      setAchLoading(false);
    };
    const fetchAwards = async () => {
      try {
        const res = await api.get('/api/award');
        setAwards(res.data);
      } catch {}
    };
    fetchAchievements();
    fetchAwards();
  }, [user]);

  // Remove filtering for student-specific achievements and awards
  // Display all as posted in admin
  const studentAchievements = achievements; // Show all
  const studentAwards = awards; // Show all
  // Summary
  const totalAchievements = studentAchievements.length;
  const achievementsThisMonth = studentAchievements.filter(a => a.date && new Date(a.date).getMonth() === new Date().getMonth() && new Date(a.date).getFullYear() === new Date().getFullYear()).length;
  const nationalLevelCount = studentAchievements.filter(a => a.level && a.level.toLowerCase().includes('national')).length;

  const handleFileUpload = (homeworkId, file) => {
    // Handle file upload logic here
    console.log('Uploading file for homework:', homeworkId, file);
  };

  const handleSubmitHomework = async (homeworkId, textSubmission, files) => {
    setSubmitting(prev => ({ ...prev, [homeworkId]: true }));
    setSubmissionMessage('');
    try {
      const formData = new FormData();
      formData.append('textSubmission', textSubmission);
      if (files) {
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
      }
      await api.post(`/api/student/homework/${homeworkId}/submit`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      setSubmissionMessage('Homework submitted successfully!');
      // Refresh homework list
      const res = await api.get('/api/student/homework');
      setHomework(res.data.data.homework || []);
    } catch (err) {
      setSubmissionMessage(err.response?.data?.message || 'Failed to submit homework.');
    }
    setSubmitting(prev => ({ ...prev, [homeworkId]: false }));
  };

  if (loading) return <div className="p-8 text-center">Loading student data...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!studentData) return <div className="p-8 text-center">No student data found.</div>;

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Student Info Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Student ID</p>
              <p className="font-semibold text-gray-900">{studentData.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class & Section</p>
              <p className="font-semibold text-gray-900">{studentData.class?.number || 'N/A'} - {studentData.section?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Roll Number</p>
              <p className="font-semibold text-gray-900">{studentData.rollNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Admission Date</p>
              <p className="font-semibold text-gray-900">{studentData.admissionDate}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-purple rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-200">Attendance</p>
              <p className="text-2xl font-bold text-white">{attendanceData?.percentage || 'N/A'}%</p>
              <p className="text-sm text-purple-200">{attendanceData?.presentDays || 'N/A'}/{attendanceData?.totalDays || 'N/A'} days</p>
            </div>
          </div>
        </div>

        <div className="card-gold rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-200">Average Grade</p>
              <p className="text-2xl font-bold text-white">A</p>
              <p className="text-sm text-yellow-200">88% average</p>
            </div>
          </div>
        </div>

        <div className="card-purple rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-200">Homework</p>
              <p className="text-2xl font-bold text-white">{homework.length}</p>
              <p className="text-sm text-purple-200">Assignments</p>
            </div>
          </div>
        </div>

        <div className="card-gold rounded-xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-200">Fee Status</p>
              <p className="text-2xl font-bold text-white">Paid</p>
              <p className="text-sm text-yellow-200">₹{typeof studentData.paidFees === 'number' ? studentData.paidFees.toLocaleString() : '0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements & Awards Card */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Trophy className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Achievements & Awards</h3>
        </div>
        <div className="card-body">
          {achLoading ? <div>Loading...</div> : achError ? <div className="text-red-600">{achError}</div> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                <Trophy className="w-7 h-7 text-purple-500 mb-2" />
                <div className="text-2xl font-bold text-purple-700">{totalAchievements}</div>
                <div className="text-gray-600">Total Achievements</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                <Calendar className="w-7 h-7 text-green-500 mb-2" />
                <div className="text-2xl font-bold text-green-700">{achievementsThisMonth}</div>
                <div className="text-gray-600">This Month</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                <Star className="w-7 h-7 text-indigo-500 mb-2" />
                <div className="text-2xl font-bold text-indigo-700">{nationalLevelCount}</div>
                <div className="text-gray-600">National Level</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                <Medal className="w-7 h-7 text-yellow-500 mb-2" />
                <div className="text-2xl font-bold text-yellow-700">{studentAwards.length}</div>
                <div className="text-gray-600">Awards</div>
              </div>
            </div>
          )}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Recent Achievements</h4>
            {studentAchievements.length === 0 ? <div className="text-gray-600 text-sm">No achievements yet.</div> : (
              <ul className="space-y-2">
                {studentAchievements.slice(0, 3).map(ach => (
                  <li key={ach._id} className="bg-gray-50 rounded p-3 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <span className="font-bold">{ach.title}</span> <span className="text-xs text-gray-500">({ach.category})</span>
                      <div className="text-gray-600 text-sm">{ach.description}</div>
                      <div className="text-xs text-gray-400">{ach.date ? new Date(ach.date).toLocaleDateString() : ''}</div>
                    </div>
                    {ach.certificateUrl && <a href={ach.certificateUrl} className="text-blue-600 underline ml-2" target="_blank" rel="noopener noreferrer">Certificate</a>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Recent Awards</h4>
            {studentAwards.length === 0 ? <div className="text-gray-600 text-sm">No awards yet.</div> : (
              <ul className="space-y-2">
                {studentAwards.slice(0, 3).map(a => (
                  <li key={a._id} className="bg-gray-50 rounded p-3 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <span className="font-bold">{a.eventName}</span>
                      <div className="text-xs text-gray-400">{a.date ? new Date(a.date).toLocaleDateString() : ''}</div>
                      <div className="text-gray-600 text-sm">{a.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Course Materials */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Course Materials</h3>
        </div>
        <div className="card-body">
          {materials.length === 0 ? (
            <div className="text-gray-500">No materials found.</div>
          ) : (
            <ul className="space-y-3">
              {materials.map(mat => (
                <li key={mat._id} className="flex items-center gap-3 border-b last:border-b-0 py-2">
                  <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold hover:underline">
                    {mat.title || mat.fileUrl.split('/').pop()}
                  </a>
                  {mat.description && <span className="text-gray-500 text-sm">{mat.description}</span>}
                  <span className="ml-auto text-xs text-gray-400">{mat.createdAt ? new Date(mat.createdAt).toLocaleDateString() : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Homework & To-Dos</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {homework.slice(0, 3).map((hw) => (
                <div key={hw.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{hw.title}</p>
                    <p className="text-sm text-gray-500">{hw.subject} • Due: {hw.dueDate}</p>
                  </div>
                  <span className={`badge ${
                    hw.status === 'submitted' ? 'badge-success' :
                    hw.status === 'graded' ? 'badge-primary' : 'badge-warning'
                  }`}>
                    {hw.status}
                  </span>
                </div>
              ))}
              {/* Recent To-Dos */}
              {todosLoading ? <div className="text-gray-400">Loading to-dos...</div> : todos.slice(0, 3).map(todo => (
                <div key={todo._id} className="flex items-center justify-between p-3 border border-blue-100 rounded-lg bg-blue-50">
                  <div>
                    <p className="font-medium text-blue-900">{todo.task}</p>
                    <p className="text-sm text-blue-700">Due: {new Date(todo.date).toLocaleDateString()}</p>
                  </div>
                  {todo.fileUrl ? (
                    <a href={todo.fileUrl} download={todo.fileName} className="inline-flex items-center gap-1 px-3 py-2 rounded-md font-bold bg-blue-600 text-white hover:bg-blue-700 transition" target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4" /> Download
                    </a>
                  ) : (
                    <span className="text-gray-400">No file</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notices & Communication</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {notices.slice(0, 3).map((notice) => (
                <div key={notice.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notice.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                    </div>
                    <span className={`badge ml-2 ${
                      notice.priority === 'high' ? 'badge-danger' :
                      notice.priority === 'medium' ? 'badge-warning' : 'badge-secondary'
                    }`}>
                      {notice.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{notice.date}</p>
                </div>
              ))}
              {/* Recent Communication */}
              {messagesLoading ? <div className="text-gray-400">Loading communication...</div> : messages.slice(0, 3).map(m => (
                <div key={m._id} className="p-3 border border-blue-100 rounded-lg bg-blue-50 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{m.subject}</p>
                    <p className="text-sm text-blue-700 mt-1">{m.message}</p>
                  </div>
                  <div className="flex flex-col items-end mt-2 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[m.type] || 'bg-gray-100 text-gray-700'}`}>{m.type?.charAt(0).toUpperCase() + m.type?.slice(1)}</span>
                    <span className="text-xs text-gray-500 mt-2">By: {m.senderName || 'Teacher'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendanceTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{attendanceData?.totalDays || 'N/A'}</p>
              <p className="text-sm text-gray-500">Total Days</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{attendanceData?.presentDays || 'N/A'}</p>
              <p className="text-sm text-gray-500">Present</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{attendanceData?.absentDays || 'N/A'}</p>
              <p className="text-sm text-gray-500">Absent</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{attendanceData?.percentage || 'N/A'}%</p>
              <p className="text-sm text-gray-500">Percentage</p>
            </div>
          </div>

          {/* Attendance Chart Placeholder */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Attendance chart will be displayed here</p>
            <p className="text-sm text-gray-500">Monthly attendance visualization</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHomeworkTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Homework & Assignments</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {homework.map((hw) => (
              <div key={hw.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{hw.title}</h4>
                    <p className="text-sm text-gray-500">{hw.subject}</p>
                    <p className="text-sm text-gray-500">
                      Assigned: {hw.assignedDate} • Due: {hw.dueDate}
                    </p>
                  </div>
                  <span className={`badge ${
                    hw.status === 'submitted' ? 'badge-success' :
                    hw.status === 'graded' ? 'badge-primary' : 'badge-warning'
                  }`}>
                    {hw.status}
                  </span>
                </div>

                {hw.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">Upload your assignment:</p>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        accept=".pdf,.doc,.docx,.txt"
                      />
                      <button
                        onClick={() => handleFileUpload(hw.id, selectedFile)}
                        className="btn btn-primary btn-sm"
                        disabled={!selectedFile}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Submit
                      </button>
                    </div>
                  </div>
                )}

                {hw.status === 'graded' && hw.feedback && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-blue-800">Teacher Feedback:</p>
                      <span className="badge badge-primary">{hw.grade}</span>
                    </div>
                    <p className="text-sm text-blue-700">{hw.feedback}</p>
                  </div>
                )}

                {hw.status === 'submitted' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Assignment submitted successfully. Waiting for grading.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNoticesTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">School Notices</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{notice.title}</h4>
                      <p className="text-gray-600 mt-1">{notice.content}</p>
                    </div>
                  </div>
                  <span className={`badge ${
                    notice.priority === 'high' ? 'badge-danger' :
                    notice.priority === 'medium' ? 'badge-warning' : 'badge-secondary'
                  }`}>
                    {notice.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className={`badge ${
                    notice.type === 'event' ? 'badge-primary' :
                    notice.type === 'academic' ? 'badge-success' : 'badge-secondary'
                  }`}>
                    {notice.type}
                  </span>
                  <span>{notice.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLibraryTab = () => (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Library Books</h2>
      {libraryLoading ? (
        <div className="text-blue-600">Loading...</div>
      ) : libraryError ? (
        <div className="text-red-600">{libraryError}</div>
      ) : libraryBooks.length === 0 ? (
        <div className="text-gray-500">No books issued.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-100 bg-white rounded-xl shadow">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Issued</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Due</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Returned</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {libraryBooks.map((txn, idx) => (
                <tr key={txn._id} className={idx % 2 === 0 ? 'bg-blue-50/40' : 'bg-white'}>
                  <td className="px-4 py-3 font-medium text-blue-900">{txn.book?.title}</td>
                  <td className="px-4 py-3">{txn.date ? new Date(txn.date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">{txn.dueDate ? new Date(txn.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">{txn.returnedAt ? new Date(txn.returnedAt).toLocaleDateString() : <span className="text-red-500">Not Returned</span>}</td>
                  <td className="px-4 py-3">
                    {txn.returnedAt ? (
                      <span className="text-green-600 font-semibold">Returned</span>
                    ) : new Date(txn.dueDate) < new Date() ? (
                      <span className="text-red-600 font-semibold">Overdue</span>
                    ) : (
                      <span className="text-blue-600 font-semibold">Issued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderHostelTab = () => (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Hostel Information</h2>
      {hostelLoading ? (
        <div className="text-blue-600">Loading...</div>
      ) : hostelError ? (
        <div className="text-red-600">{hostelError}</div>
      ) : !hostelInfo ? (
        <div className="text-gray-500">Not registered in hostel.</div>
      ) : (
        <div className="bg-white rounded-xl shadow p-6 max-w-lg">
          <div className="text-xl font-semibold mb-2">{hostelInfo.hostel?.name || 'Hostel'}</div>
          <div className="text-gray-700 mb-1">Room: <span className="font-bold">{hostelInfo.room?.number || '-'}</span></div>
          <div className="text-gray-700 mb-1">Allocated At: <span className="font-bold">{hostelInfo.allocatedAt ? new Date(hostelInfo.allocatedAt).toLocaleDateString() : '-'}</span></div>
          <div className="text-gray-700 mb-1">Hostel Address: <span className="font-bold">{hostelInfo.hostel?.address || '-'}</span></div>
        </div>
      )}
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <Trophy className="w-7 h-7 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-purple-700">{totalAchievements}</div>
          <div className="text-gray-600">Total Achievements</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <Calendar className="w-7 h-7 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-green-700">{achievementsThisMonth}</div>
          <div className="text-gray-600">This Month</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <Star className="w-7 h-7 text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-indigo-700">{nationalLevelCount}</div>
          <div className="text-gray-600">National Level</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <Medal className="w-7 h-7 text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-yellow-700">{studentAwards.length}</div>
          <div className="text-gray-600">Awards</div>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">All Achievements</h4>
        {studentAchievements.length === 0 ? <div className="text-gray-400 text-sm">No achievements yet.</div> : (
          <ul className="space-y-2">
            {studentAchievements.map(ach => (
              <li key={ach._id} className="bg-gray-50 rounded p-3 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <span className="font-bold">{ach.title}</span> <span className="text-xs text-gray-500">({ach.category})</span>
                  <div className="text-gray-600 text-sm">{ach.description}</div>
                  <div className="text-xs text-gray-400">{ach.date ? new Date(ach.date).toLocaleDateString() : ''}</div>
                </div>
                {ach.certificateUrl && <a href={ach.certificateUrl} className="text-blue-600 underline ml-2" target="_blank" rel="noopener noreferrer">Certificate</a>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4">
        <h4 className="font-semibold mb-2">All Awards</h4>
        {studentAwards.length === 0 ? <div className="text-gray-400 text-sm">No awards yet.</div> : (
          <ul className="space-y-2">
            {studentAwards.map(a => (
              <li key={a._id} className="bg-gray-50 rounded p-3 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <span className="font-bold">{a.eventName}</span>
                  <div className="text-xs text-gray-400">{a.date ? new Date(a.date).toLocaleDateString() : ''}</div>
                  <div className="text-gray-600 text-sm">{a.description}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-start relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
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

      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="flex flex-col items-center mt-8">
          <div className="w-full flex flex-col items-center">
            {/* Only render overview content here, with a section heading */}
            <div className="w-full mb-6">
              <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-2">Welcome, Student!</h1>
            </div>
            <div className="w-full">
              {renderOverviewTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;