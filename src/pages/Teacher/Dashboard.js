import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import AttendanceToggle from '../../components/common/AttendanceToggle';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  FileText,
  Bell,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  GraduationCap,
  ClipboardList,
  LogOut,
  CheckSquare,
  User2
} from 'lucide-react';
import { DateTime } from 'luxon';
import { useLocation, useNavigate } from 'react-router-dom';
import BrandingFooter from '../../components/common/BrandingFooter';

// Mock data for demonstration
const mockClasses = [
  {
    id: 1,
    name: 'Class 10',
    section: 'A',
    subject: 'Mathematics',
    totalStudents: 35,
    presentToday: 32
  },
  {
    id: 2,
    name: 'Class 9',
    section: 'B',
    subject: 'Mathematics',
    totalStudents: 30,
    presentToday: 28
  }
];

const mockStudents = [
  { id: 1, name: 'John Doe', rollNo: '001', status: 'present' },
  { id: 2, name: 'Jane Smith', rollNo: '002', status: 'present' },
  { id: 3, name: 'Mike Johnson', rollNo: '003', status: 'absent' },
  { id: 4, name: 'Sarah Wilson', rollNo: '004', status: 'present' },
  { id: 5, name: 'David Brown', rollNo: '005', status: 'present' },
];

const mockHomework = [
  {
    id: 1,
    title: 'Algebra Practice',
    class: 'Class 10 A',
    subject: 'Mathematics',
    dueDate: '2024-01-20',
    submissions: 25,
    totalStudents: 35,
    status: 'active'
  },
  {
    id: 2,
    title: 'Geometry Problems',
    class: 'Class 9 B',
    subject: 'Mathematics',
    dueDate: '2024-01-18',
    submissions: 28,
    totalStudents: 30,
    status: 'grading'
  }
];

const mockNotices = [
  {
    id: 1,
    title: 'Parent-Teacher Meeting',
    content: 'Scheduled for next Friday at 2 PM',
    type: 'event',
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'Exam Schedule Released',
    content: 'Mid-term exams will start from February 1st',
    type: 'academic',
    date: '2024-01-14'
  }
];

const TeacherDashboard = ({ defaultTab }) => {
  const { user, logout, token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [attendanceData, setAttendanceData] = useState([]);
  // Use defaultTab for initial activeTab
  const [activeTab, setActiveTab] = useState(defaultTab || 'dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Add state for attendance tab
  const [attendanceClass, setAttendanceClass] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaveMsg, setAttendanceSaveMsg] = useState('');
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [homework, setHomework] = useState([]);
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  const [homeworkError, setHomeworkError] = useState('');
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    dueDate: '',
    subject: '',
  });
  const [homeworkMessage, setHomeworkMessage] = useState('');
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [grading, setGrading] = useState({});
  const [gradingMessage, setGradingMessage] = useState('');
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticesError, setNoticesError] = useState('');

  // --- Assignments & Homework State ---
  const [assignmentClass, setAssignmentClass] = useState('');
  const [assignmentSubject, setAssignmentSubject] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentMsg, setAssignmentMsg] = useState('');
  const [gradingAssignment, setGradingAssignment] = useState(null);
  const [gradingSubmissions, setGradingSubmissions] = useState([]);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [gradingMsg, setGradingMsg] = useState('');

  // --- Marks State ---
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClassSection, setSelectedClassSection] = useState('');
  const [marksStudents, setMarksStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [marksMsg, setMarksMsg] = useState('');
  const [marksLoading, setMarksLoading] = useState(false);

  // --- Students Tab State ---
  const [studentsSearch, setStudentsSearch] = useState("");
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // --- Notices Tab State ---
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Add state for My Classes modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [modalAssignment, setModalAssignment] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();



  // Sync activeTab with tab query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (activeTab && params.get('tab') !== activeTab) {
      params.set('tab', activeTab);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [activeTab]);

  // Fetch assignments from /api/auth/me
  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/api/auth/me')
      .then(res => {
        const asn = res.data?.data?.user?.assignments || [];
        setAssignments(asn);
      })
      .catch((error) => {
        console.error('API Error:', error);
        setError('Failed to load assignments.');
        // Use mock data instead of failing completely
        setAssignments(mockClasses.map(cls => ({
          class: { _id: cls.id, number: cls.name },
          section: { _id: cls.id, name: cls.section },
          subject: { _id: cls.id, name: cls.subject },
          students: mockStudents
        })));
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Set selected assignment when assignments change
  useEffect(() => {
    setSelectedAssignment(assignments[0] || null);
  }, [assignments]);

  // Update all dropdowns and logic to use assignments and selectedAssignment
  // For example, in attendance, homework, marks, etc., use selectedAssignment.class, selectedAssignment.section, selectedAssignment.subject
  // Show a list of assignments at the top:
  useEffect(() => {
    if (!selectedAssignment) return;
    setAttendanceData(selectedAssignment.students || []);
  }, [selectedAssignment]);

  // Fetch homework when selectedAssignment changes
  useEffect(() => {
    if (!selectedAssignment || !selectedAssignment.class || !selectedAssignment.class._id) return;
    setHomeworkLoading(true);
    setHomeworkError('');
    api.get(`/api/teacher/homework/${selectedAssignment.class._id}`)
      .then(res => {
        setHomework(res.data.data.homework || []);
      })
      .catch((error) => {
        console.error('Homework API Error:', error);
        setHomeworkError('Failed to load homework.');
        // Use mock homework data
        setHomework(mockHomework);
      })
      .finally(() => setHomeworkLoading(false));
  }, [selectedAssignment, token]);

  // Fetch notices when the Notices tab is active
  useEffect(() => {
    if (activeTab !== 'notices') return;
    setNoticesLoading(true);
    setNoticesError('');
    api.get('/api/notice')
      .then(res => {
        setNotices(res.data.data.notices || []);
      })
      .catch((error) => {
        console.error('Notices API Error:', error);
        setNoticesError('Failed to load notices.');
        // Use mock notices data
        setNotices(mockNotices);
      })
      .finally(() => setNoticesLoading(false));
  }, [activeTab, token]);

  // Fetch attendance for selected class/date
  useEffect(() => {
    if (activeTab !== 'attendance' || !attendanceClass || !attendanceDate) return;
    setAttendanceLoading(true);
    api.get(`/api/attendance/class/${attendanceClass?._id}?date=${attendanceDate}`)
      .then(res => {
        const att = res.data.data.attendance[0];
        if (att) {
          setAttendanceList(att.students.map(s => ({ ...s.student, status: s.status })));
        } else {
          setAttendanceList((attendanceClass.students || []).map(s => ({ ...s, status: 'present' })));
        }
      })
      .catch(() => setAttendanceList((attendanceClass.students || []).map(s => ({ ...s, status: 'present' }))))
      .finally(() => setAttendanceLoading(false));
  }, [activeTab, attendanceClass, attendanceDate, token]);

  // Fetch attendance history for selected class
  useEffect(() => {
    if (activeTab !== 'attendance' || !attendanceClass) return;
    api.get(`/api/attendance/report/${attendanceClass?._id}`)
      .then(res => setAttendanceHistory(res.data.data.attendance || []))
      .catch(() => setAttendanceHistory([]));
  }, [activeTab, attendanceClass, token]);

  // Fetch assignments for selected class
  useEffect(() => {
    if (activeTab !== 'assignments' || !assignmentClass) return;
    api.get(`/api/teacher/homework/${assignmentClass}`)
      .then(res => setAssignments(res.data.data.homework || []))
      .catch(() => setAssignments([]));
  }, [activeTab, assignmentClass, token]);

  // Fetch students for marks entry
  useEffect(() => {
    if (activeTab !== 'marks' || !selectedExam || !selectedClassSection) return;
    const [classId, sectionId] = selectedClassSection.split('::');
    setMarksLoading(true);
    api.get(`/api/teacher/class-section-students?classId=${classId}&sectionId=${sectionId}`)
      .then(res => setMarksStudents(res.data.students || []))
      .catch(() => setMarksStudents([]))
      .finally(() => setMarksLoading(false));
  }, [activeTab, selectedExam, selectedClassSection, token]);

  // Update studentsList whenever classes change
  useEffect(() => {
    // Flatten all students from all classes the teacher teaches
    const allStudents = assignments.flatMap(a =>
      (a.students || []).map(stu => ({
        ...stu,
        className: a.class.name,
        section: a.section.name,
        classId: a.class._id
      }))
    );
    setStudentsList(allStudents);
  }, [assignments]);

  // Handle attendance change
  const handleAttendanceChange = (studentId, newStatus) => {
    setAttendanceData(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, status: newStatus }
          : student
      )
    );
  };

  // Filter students based on search
  const filteredStudents = attendanceData.filter(student =>
    (student.name?.toLowerCase?.() || '').includes(searchTerm.toLowerCase()) ||
    (student.rollNo || '').includes(searchTerm)
  );

  const filteredStudentsList = studentsList.filter(stu =>
    ((stu.firstName || '') + ' ' + (stu.lastName || '')).toLowerCase().includes(studentsSearch.toLowerCase()) ||
    (stu.studentId || '').includes(studentsSearch)
  );

  // Calculate attendance stats
  const presentCount = attendanceData.filter(s => s.status === 'present').length;
  const absentCount = attendanceData.filter(s => s.status === 'absent').length;
  const attendancePercentage = Math.round((presentCount / attendanceData.length) * 100);

  const handleAttendanceStatus = (studentId, status) => {
    setAttendanceList(prev => prev.map(s => s._id === studentId ? { ...s, status } : s));
  };

  const handleSaveAttendance = async () => {
    setAttendanceSaving(true);
    setAttendanceMessage('');
    setAttendanceSaveMsg('');
    setAttendanceLoading(true);
    try {
      const studentsPayload = attendanceList.map(s => ({ student: s._id, status: s.status }));
      console.log('Saving attendance for:', {
        classId: attendanceClass?.class?._id,
        sectionId: attendanceClass?.section?._id,
        teacherId: user && user._id
      });
      await api.post('/api/attendance/mark', {
        classId: attendanceClass?.class?._id,
        sectionId: attendanceClass?.section?._id,
        date: attendanceDate,
        students: studentsPayload
      });
      setAttendanceMessage('Attendance saved successfully!');
      setAttendanceSaveMsg('Attendance saved!');
    } catch (err) {
      setAttendanceMessage(err.response?.data?.message || 'Failed to save attendance.');
      setAttendanceSaveMsg('Failed to save attendance.');
    }
    setAttendanceSaving(false);
    setAttendanceLoading(false);
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    setHomeworkMessage('');
    try {
      await api.post('/api/teacher/homework', {
        ...newHomework,
        classId: selectedAssignment?.class?._id,
        subject: newHomework.subject,
      });
      setHomeworkMessage('Homework created successfully!');
      setShowHomeworkForm(false);
      setNewHomework({ title: '', description: '', dueDate: '', subject: '' });
      // Refresh homework list
      const res = await api.get(`/api/teacher/homework/${selectedAssignment?.class?._id}`);
      setHomework(res.data.data.homework || []);
    } catch (err) {
      setHomeworkMessage(err.response?.data?.message || 'Failed to create homework.');
    }
  };

  const handleViewSubmissions = async (homeworkId) => {
    setSelectedHomework(null);
    setGradingMessage('');
    try {
      const res = await api.get(`/api/teacher/homework/${homeworkId}`);
      setSelectedHomework(res.data.data.homework);
    } catch (err) {
      setGradingMessage('Failed to load submissions.');
    }
  };
  const handleGrade = async (studentId, marks, feedback) => {
    setGrading(prev => ({ ...prev, [studentId]: true }));
    setGradingMessage('');
    try {
      await api.put(`/api/teacher/homework/${selectedHomework?._id}/grade`, {
        studentId,
        marks,
        feedback
      });
      setGradingMessage('Grade saved!');
      // Refresh the selectedHomework to show updated marks/feedback
      handleViewSubmissions(selectedHomework?._id);
    } catch (err) {
      setGradingMessage('Failed to save grade.');
    }
    setGrading(prev => ({ ...prev, [studentId]: false }));
  };

  // --- Assignment Handlers ---
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setAssignmentMsg('');
    try {
      await api.post('/api/teacher/homework', {
        classId: assignmentClass,
        subject: assignmentSubject,
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: assignmentDueDate
      });
      setAssignmentMsg('Assignment created!');
      setAssignmentTitle(''); setAssignmentDescription(''); setAssignmentDueDate('');
      // Refresh assignments
      const res = await api.get(`/api/teacher/homework/${assignmentClass}`);
      setAssignments(res.data.data.homework || []);
    } catch (err) {
      setAssignmentMsg('Failed to create assignment.');
    }
  };
  const openGradeModal = async (assn) => {
    setGradingAssignment(assn);
    setGradingLoading(true);
    setGradingMsg('');
    try {
      const res = await api.get(`/api/teacher/homework/${assn._id}`);
      setGradingSubmissions(res.data.data.homework.submissions || []);
    } catch {
      setGradingSubmissions([]);
    }
    setGradingLoading(false);
  };
  const saveGrade = async (studentId, marks, feedback) => {
    setGradingMsg('');
    setGradingLoading(true);
    try {
      await api.post(`/api/teacher/homework/${gradingAssignment._id}/grade`, {
        studentId, marks, feedback
      });
      setGradingMsg('Grade saved!');
      // Refresh submissions
      const res = await api.get(`/api/teacher/homework/${gradingAssignment._id}`);
      setGradingSubmissions(res.data.data.homework.submissions || []);
    } catch {
      setGradingMsg('Failed to save grade.');
    }
    setGradingLoading(false);
  };

  // --- Marks Handlers ---
  const handleSaveMarks = async () => {
    setMarksMsg('');
    try {
      await api.post(`/api/exam/${selectedExam?._id}/marks`, {
        marks: Object.entries(marks).map(([student, marksObtained]) => ({ student, marksObtained }))
              });
      setMarksMsg('Marks updated!');
    } catch {
      setMarksMsg('Failed to update marks.');
    }
  };

  const renderAttendanceTab = () => {
    // Group assignments by class-section
    const classSectionMap = new Map();
    assignments.forEach(a => {
      const key = a.class._id + '-' + a.section._id;
      if (!classSectionMap.has(key)) {
        classSectionMap.set(key, {
          classId: a.class._id,
          sectionId: a.section._id,
          className: a.class.name,
          sectionName: a.section.name,
          numStudents: (a.students || []).length,
        });
      }
    });
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[...classSectionMap.values()].map(cs => (
          <div
            key={cs.classId + '-' + cs.sectionId}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-blue-50 transition"
            onClick={() => navigate(`/teacher/class/${cs.classId}/section/${cs.sectionId}/attendance`)}
          >
            <div className="text-xl font-bold mb-2">{cs.className} - {cs.sectionName}</div>
            <div className="text-gray-600">{cs.numStudents} Students</div>
          </div>
        ))}
      </div>
    );
  };

  const renderHomeworkTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Homework Management</h3>
        <button className="btn btn-primary btn-md">
          <Plus className="w-4 h-4 mr-2" />
          Create Homework
        </button>
      </div>

      <div className="grid gap-4">
        {homeworkLoading ? (
          <div className="p-8 text-center">Loading homework...</div>
        ) : homeworkError ? (
          <div className="p-8 text-center text-red-600">{homeworkError}</div>
        ) : (
          <>
            {homework.map((hw) => (
              <div key={hw.id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{hw.title}</h4>
                      <p className="text-sm text-gray-500">{hw.class?.name || hw.class?.number || ''} - {hw.subject?.name || ''}</p>
                      <p className="text-sm text-gray-500">Due: {hw.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {hw.submissions}/{hw.totalStudents} submitted
                      </p>
                      <span className={`badge ${
                        hw.status === 'active' ? 'badge-primary' : 'badge-warning'
                      }`}>
                        {hw.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="btn btn-outline btn-sm" onClick={() => handleViewSubmissions(hw._id)}>View Submissions</button>
                    <button className="btn btn-outline btn-sm">Grade</button>
                    <button className="btn btn-outline btn-sm">Edit</button>
                  </div>
                </div>
              </div>
            ))}
            {showHomeworkForm && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Create New Homework</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleCreateHomework} className="space-y-4">
                    <div>
                      <label htmlFor="homeworkTitle" className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        id="homeworkTitle"
                        value={newHomework.title}
                        onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="homeworkDescription" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="homeworkDescription"
                        value={newHomework.description}
                        onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                        className="input"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label htmlFor="homeworkDueDate" className="block text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <input
                        type="date"
                        id="homeworkDueDate"
                        value={newHomework.dueDate}
                        onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="homeworkSubject" className="block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="homeworkSubject"
                        value={newHomework.subject}
                        onChange={(e) => setNewHomework({ ...newHomework, subject: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-md">
                      Create Homework
                    </button>
                    {homeworkMessage && (
                      <p className={`mt-2 text-sm ${homeworkMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                        {homeworkMessage}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderNoticesTab = () => (
    <div>
              <h1 className="text-2xl font-bold mb-4 text-purple-900 flex items-center gap-2"><Bell /> Notices</h1>
      <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
        {noticesLoading ? (
          <div className="p-8 text-center">Loading notices...</div>
        ) : noticesError ? (
          <div className="p-8 text-center text-red-600">{noticesError}</div>
        ) : notices.length === 0 ? (
          <div className="text-gray-500">No notices found.</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.map(notice => (
                <tr key={notice._id || notice.id}>
                  <td className="py-2">{notice.title}</td>
                  <td className="py-2">
                    <span className={`badge ${notice.type === 'event' ? 'badge-primary' : 'badge-secondary'}`}>{notice.type}</span>
                  </td>
                  <td className="py-2">{notice.date?.slice(0, 10)}</td>
                  <td className="py-2">
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedNotice(notice)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Notice Details Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" onClick={() => setSelectedNotice(null)}>
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedNotice.title}</h2>
            <div className="mb-2"><span className="font-semibold">Type:</span> <span className={`badge ${selectedNotice.type === 'event' ? 'badge-primary' : 'badge-secondary'}`}>{selectedNotice.type}</span></div>
            <div className="mb-2"><span className="font-semibold">Date:</span> {selectedNotice.date?.slice(0, 10)}</div>
            <div className="mb-4"><span className="font-semibold">Content:</span><br />{selectedNotice.content || selectedNotice.message}</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStudentsTab = () => {
    // Group assignments by class-section
    const classSectionMap = new Map();
    assignments.forEach(a => {
      if (!a || !a.class || !a.class._id || !a.section || !a.section._id) return;
      const key = a.class._id + '-' + a.section._id;
      if (!classSectionMap.has(key)) {
        classSectionMap.set(key, {
          classId: a.class._id,
          sectionId: a.section._id,
          className: a.class.name,
          sectionName: a.section.name,
          students: new Set(),
          subjects: new Set(),
        });
      }
      const entry = classSectionMap.get(key);
      (a.students || []).forEach(s => {
        if (!s || !s._id) return;
        entry.students.add(s._id);
      });
      entry.subjects.add(a.subject.name);
    });
    const classCards = Array.from(classSectionMap.values());
    return (
      <div>
        <h1 className="text-2xl font-bold text-purple-900 flex items-center gap-2 mb-8"><Users /> Student Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classCards.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">No classes assigned.</div>
          ) : (
            classCards.map((cls, idx) => {
              const allSubjects = Array.from(cls.subjects);
              return (
                <div
                  key={idx}
                  className="card-purple rounded-2xl p-8 flex flex-col gap-4 hover:shadow-2xl transition cursor-pointer"
                  onClick={() => navigate(`/teacher/class/${cls.classId}/section/${cls.sectionId}/students`)}
                >
                  <div className="font-bold text-xl text-white flex items-center gap-2 mb-2">Section: {cls.sectionName}</div>
                  <div className="flex items-center text-purple-200 mb-1 text-lg"><User2 className="w-5 h-5 mr-2 text-purple-300" /> {cls.students.size} Students</div>
                  <div className="flex items-center text-purple-200 mb-1 text-lg">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-300" />
                    {allSubjects.length === 0 ? (
                      <span className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm font-semibold border border-purple-300/30 shadow-sm">1 Subject</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {allSubjects.map((subj, i) => (
                          <span key={i} className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm font-semibold border border-purple-300/30 shadow-sm">
                            {subj.subject?.name || subj.name || '1 Subject'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderClassesTab = () => {
    // Group assignments by class-section
    const classMap = new Map();
    assignments.forEach(a => {
      const key = a.class._id + '-' + a.section._id;
      if (!classMap.has(key)) {
        classMap.set(key, {
          className: a.class.name,
          sectionName: a.section.name,
          students: new Set(),
          subjects: new Set(),
          classTeacher: a.section.classTeacher || a.class.classTeacher || null, // fallback if available
        });
      }
      const entry = classMap.get(key);
      (a.students || []).forEach(s => {
        if (!s || !s._id) return;
        entry.students.add(s._id);
      });
      entry.subjects.add(a.subject.name);
      // Optionally, update classTeacher if available in assignment
      if (a.classTeacher) entry.classTeacher = a.classTeacher;
    });
    const classCards = Array.from(classMap.values());
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4 text-purple-900 flex items-center gap-2">Classes Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {classCards.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500">No classes assigned.</div>
          ) : (
            classCards.map((cls, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-6 border border-blue-100 flex flex-col justify-between">
                <div className="font-bold text-lg text-blue-900 mb-2">{cls.className} - {cls.sectionName}</div>
                <div className="flex items-center text-gray-700 mb-1"><span className="mr-2">👥</span> {cls.students.size} Students</div>
                <div className="flex items-center text-gray-700 mb-1"><span className="mr-2">📚</span> {cls.subjects.size} Subjects</div>
                <div className="text-gray-600 text-sm mt-2">Teacher: {cls.classTeacher ? cls.classTeacher : user.firstName + ' ' + user.lastName}</div>
              </div>
            ))
          )}
        </div>
        {/* Existing My Classes cards below, if needed */}
        {/* ...existing code for assignment cards and modal... */}
      </div>
    );
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Sidebar items for all major features
  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <ClipboardList /> },
    { key: 'my-classes', label: 'My Classes', icon: <BookOpen /> },
    { key: 'students', label: 'My Students', icon: <Users /> },
    { key: 'assignments', label: 'Assignments', icon: <FileText /> },
    { key: 'marks', label: 'Marks', icon: <GraduationCap /> },
    { key: 'notices', label: 'Notices', icon: <Bell /> },
    { key: 'documents', label: 'Documents', icon: <Download /> },
    { key: 'calendar', label: 'Calendar', icon: <Clock /> },
  ];

  return (
    <div className="min-h-screen font-sans transition-all duration-1000 ease-in-out relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
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
      )}
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 transition-all duration-1000">
        {loading && <div className="p-8 text-center">Loading classes...</div>}
        {error && <div className="p-8 text-center text-red-600">{error}</div>}
        {activeTab === 'dashboard' && (
          <div>
            {/* Remove the inner dashboard header bar, keep only a section heading */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-2 transition-all duration-500 text-purple-900">
                <ClipboardList className="inline-block w-8 h-8 transition-all duration-500 text-blue-700" /> Dashboard Overview
              </h1>
              

            </div>

                            {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
                  <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">{assignments.length}</div>
                  <div className="text-gray-500">Classes</div>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
                  <Users className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-2xl font-bold">{assignments.reduce((acc, a) => acc + (a.students?.length || 0), 0)}</div>
                  <div className="text-gray-500">Students</div>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
                  <FileText className="w-8 h-8 text-yellow-600 mb-2" />
                  <div className="text-2xl font-bold">{homework.length}</div>
                  <div className="text-gray-500">Assignments</div>
                </div>
              </div>
                          {/* Today's Schedule */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center gap-2"><Calendar /> Today's Schedule</h2>
                  {/* Placeholder for timetable - replace with real data if available */}
                  <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
                    <div className="text-gray-700">No timetable data available.</div>
                  </div>
                </div>

                
                {/* Notifications & Upcoming Tasks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
                    <h2 className="text-lg font-semibold mb-2 text-blue-800 flex items-center gap-2"><Bell /> Notifications</h2>
                    {notices.length === 0 ? (
                      <div className="text-gray-500">No notifications.</div>
                    ) : (
                      <ul className="space-y-2">
                        {notices.slice(0, 5).map(notice => (
                          <li key={notice.id || notice._id} className="text-gray-700">
                            <span className="font-semibold">{notice.title}</span>: {notice.content || notice.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
                    <h2 className="text-lg font-semibold mb-2 text-blue-800 flex items-center gap-2"><ClipboardList /> Upcoming Tasks</h2>
                    <div className="text-gray-500">No upcoming tasks.</div>
                  </div>
                </div>
          </div>
        )}
        {activeTab === 'my-classes' && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-purple-900 flex items-center gap-2"><BookOpen /> My Classes</h1>
            {assignments.length === 0 ? (
              <div className="p-8 text-center text-red-600">No assignments found. Please contact admin to assign you to a class/subject.</div>
            ) : (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Your Assignments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignments.map((a, idx) => (
                    <div key={a.class._id + a.section._id + a.subject._id} className={`card cursor-pointer ${selectedAssignment && selectedAssignment.class._id === a.class._id && selectedAssignment.section._id === a.section._id && selectedAssignment.subject._id === a.subject._id ? 'border-blue-500' : ''}`}
                      onClick={() => setSelectedAssignment(a)}>
                      <div className="card-body">
                        <div className="font-bold text-blue-800">{a.class.name}</div>
                        <div className="text-gray-700">Section: {a.section.name}</div>
                        <div className="text-gray-700">Subject: {a.subject.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((a, index) => (
                <div key={a._id || `assignment-${index}`} className="bg-white rounded-xl shadow p-6 border border-blue-100">
                  <div className="text-xl font-semibold text-blue-800 mb-2">{a.class.name} {a.section.name && `- ${a.section.name}`}</div>
                  <div className="mb-2">
                    <span className="font-semibold">Subjects you teach:</span>
                    <ul className="list-disc ml-6">
                      {Array.isArray(a.subjects) ? a.subjects.filter(sub => sub.teacher === user._id || (sub.teacher?._id === user._id)).map(sub => (
                        <li key={sub.subject?._id || sub._id}>
                          {sub.subject?.name || sub.name}
                          {sub.teacherId && (sub.teacherId.firstName || sub.teacherId.lastName) && (
                            <span className="text-gray-500 ml-2">(
                              {sub.teacherId.firstName} {sub.teacherId.lastName}
                            )</span>
                          )}
                        </li>
                      )) : []}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold">Students:</span>
                    <ul className="list-disc ml-6">
                      {Array.isArray(a.students) ? a.students.map(stu => (
                        <li key={stu._id}>{stu.firstName} {stu.lastName} ({stu.studentId})</li>
                      )) : []}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'attendance' && renderAttendanceTab()}
        {activeTab === 'assignments' && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-purple-900 flex items-center gap-2"><FileText /> Assignments & Homework</h1>
            {/* Create Assignment Form */}
            <form onSubmit={handleCreateAssignment} className="mb-6 flex flex-wrap gap-4 items-end">
              <select value={assignmentClass} onChange={e => setAssignmentClass(e.target.value)} className="input">
                <option value="">Select Class</option>
                {assignments.map(a => (
                  <option key={a.class._id} value={a.class._id}>{a.class.name} {a.section.name && `- ${a.section.name}`}</option>
                ))}
              </select>
              <select value={assignmentSubject} onChange={e => setAssignmentSubject(e.target.value)} className="input">
                <option value="">Select Subject</option>
                {assignmentClass && assignments.find(a => a.class._id === assignmentClass)?.subjects.filter(sub => sub.teacher === user._id || (sub.teacher?._id === user._id)).map(sub => (
                  <option key={sub.subject?._id || sub._id} value={sub.subject?._id || sub._id}>{sub.subject?.name || sub.name}</option>
                ))}
              </select>
              <input type="text" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} placeholder="Title" className="input" required />
              <input type="date" value={assignmentDueDate} onChange={e => setAssignmentDueDate(e.target.value)} className="input" required />
              <button type="submit" className="btn btn-primary">Create</button>
              {assignmentMsg && <span className="ml-4 text-green-600">{assignmentMsg}</span>}
            </form>
            {/* List of Assignments */}
            <table className="min-w-full mb-6">
              <thead>
                <tr>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Class</th>
                  <th className="text-left py-2">Subject</th>
                  <th className="text-left py-2">Due Date</th>
                  <th className="text-left py-2">Submissions</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assn => (
                  <tr key={assn._id}>
                    <td className="py-2">{assn.title}</td>
                    <td className="py-2">{assn.class.name}</td>
                    <td className="py-2">{assn.subject?.name || ''}</td>
                    <td className="py-2">{assn.dueDate?.slice(0, 10)}</td>
                    <td className="py-2">{assn.submissions?.length || 0}</td>
                    <td className="py-2"><button className="btn btn-outline btn-sm" onClick={() => openGradeModal(assn)}>Grade</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Grade Modal */}
            {gradingAssignment && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
                  <h3 className="text-xl font-bold mb-4">Submissions for: {gradingAssignment.title}</h3>
                  {gradingLoading ? <div>Loading...</div> : gradingSubmissions.length === 0 ? (
                    <div>No submissions yet.</div>
                  ) : (
                    gradingSubmissions.map(sub => (
                      <div key={sub.student._id} className="mb-4 border-b pb-4">
                        <div className="font-semibold">{sub.student.firstName} {sub.student.lastName}</div>
                        <div>Status: {sub.status}</div>
                        <div>
                          <label>Marks:</label>
                          <input
                            type="number"
                            value={sub.marks || ''}
                            onChange={e => setGradingSubmissions(prev => prev.map(s => s.student._id === sub.student._id ? { ...s, marks: e.target.value } : s))}
                            className="input ml-2"
                          />
                        </div>
                        <div>
                          <label>Feedback:</label>
                          <input
                            type="text"
                            value={sub.feedback || ''}
                            onChange={e => setGradingSubmissions(prev => prev.map(s => s.student._id === sub.student._id ? { ...s, feedback: e.target.value } : s))}
                            className="input ml-2"
                          />
                        </div>
                        <button
                          className="btn btn-primary btn-sm mt-2"
                          onClick={() => saveGrade(sub.student._id, sub.marks, sub.feedback)}
                          disabled={gradingLoading}
                        >
                          Save Grade
                        </button>
                      </div>
                    ))
                  )}
                  {gradingMsg && <div className="mt-2 text-green-600">{gradingMsg}</div>}
                  <button className="btn btn-outline mt-4" onClick={() => setGradingAssignment(null)}>Close</button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'marks' && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-purple-900 flex items-center gap-2"><GraduationCap /> Marks</h1>
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
        )}
        {activeTab === 'students' && renderStudentsTab()}
        {activeTab === 'notices' && renderNoticesTab()}
        {activeTab === 'documents' && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-purple-900 flex items-center gap-2"><Download /> Documents</h1>
            <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
              <div className="text-gray-700">(Upload and access lesson materials here.)</div>
            </div>
          </div>
        )}
        {activeTab === 'calendar' && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-purple-900 flex items-center gap-2"><Clock /> Calendar & Events</h1>
            <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
              <div className="text-gray-700">(View school events, meetings, and reminders here.)</div>
            </div>
          </div>
        )}
      </main>
      
      <BrandingFooter />
    </div>
  );
};

export default TeacherDashboard;