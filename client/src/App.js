import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import Pages
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import TeacherDashboard from './pages/Teacher/Dashboard';
import StudentDashboard from './pages/Student/Dashboard';
import InventoryDashboard from './pages/Inventory/Dashboard';
import LibraryDashboard from './pages/Library/Dashboard';
import NoticeDashboard from './pages/Notice/Dashboard';
import HomeworkDashboard from './pages/Homework/Dashboard';
import FeeDashboard from './pages/Fee/Dashboard';
import ClassDashboard from './pages/Class/Dashboard';
import SubjectDashboard from './pages/Subject/Dashboard';
import ClassManager from './pages/Admin/ClassManager';
import ClassDetails from './pages/Admin/ClassDetails';
import SectionDetails from './pages/Admin/SectionDetails';
import SubjectManager from './pages/Admin/SubjectManager';
import StudentManager from './pages/Admin/StudentManager';
import TeacherManager from './pages/Admin/TeacherManager';
import NotificationDashboard from './pages/NotificationDashboard';
import VisitorDashboard from './pages/VisitorDashboard';
import TeacherLogin from './pages/Teacher/TeacherLogin';
import StudentLogin from './pages/Student/StudentLogin';
import HostelDashboard from './pages/Hostel/Dashboard';
import HostelRooms from './pages/Hostel/Rooms';
import MyStudents from './pages/Teacher/MyStudents';
import ClassSectionStudents from './pages/Teacher/ClassSectionStudents';
import RoleManagement from './pages/Admin/RoleManagement';
import Communication from './pages/Teacher/Communication';
import CourseMaterials from './pages/Teacher/CourseMaterials';
import ExamManager from './pages/Admin/ExamManager';
import Exams from './pages/Teacher/Exams';
import Marks from './pages/Teacher/Marks';
import ClassTodos from './pages/Teacher/ClassTodos';
import StudentClassTodos from './pages/Student/ClassTodos';
import StudentMarks from './pages/Student/Marks';
import StudentPerformance from './pages/Teacher/StudentPerformance';
import StudentCourseMaterials from './pages/Student/CourseMaterials';
import StudentCommunication from './pages/Student/Communication';
import TeacherAttendance from './pages/Teacher/Attendance';
import ClassSectionAttendance from './pages/Teacher/ClassSectionAttendance';
import StudentAttendance from './pages/Student/Attendance';
import Profile from './pages/Admin/Profile';
import TeacherProfile from './pages/Teacher/Profile';
import StudentProfile from './pages/Student/Profile';
import TransportManager from './pages/Admin/TransportManager';
import AchievementsDashboard from './pages/Admin/Achievements';
import OnlineStoreDashboard from './pages/Admin/OnlineStoreDashboard';
import StudentPollDashboard from './pages/Student/PollDashboard';
import AdminPollDashboard from './pages/Admin/PollDashboard';
import StudentStore from './pages/Student/StudentStore';
import StudentTransportInfo from './pages/Student/TransportInfo';
import HostelInfo from './pages/Student/HostelInfo';
import ClassSectionInfo from './pages/Student/ClassSectionInfo';
import StudentFeeDashboard from './pages/Student/StudentFeeDashboard';
import FinanceDashboard from './pages/Finance/Dashboard';
import StudentPerformancePage from './pages/Student/Performance';
import YouTubeVideos from './pages/Teacher/YouTubeVideos';
import StudentYouTubeVideos from './pages/Student/YouTubeVideos';

// Import Components
import LoadingSpinner from './components/common/LoadingSpinner';
import Sidebar from './components/common/Sidebar';
import HeaderBar from './components/common/HeaderBar';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useState } from 'react';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'superadmin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Unauthorized Page Component
const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary btn-md"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

// Main Layout with Full Page Dashboard
const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const selectedSchool = JSON.parse(localStorage.getItem('selectedSchool'));
  const navigate = useNavigate();
  const handleProfile = () => {
    if (user?.role === 'admin') navigate('/admin/profile');
    else if (user?.role === 'teacher') navigate('/teacher/profile');
    else if (user?.role === 'student') navigate('/student/profile');
    else navigate('/profile');
  };
  
  // Check if we're on the main dashboard route
  const isDashboardRoute = window.location.pathname === '/dashboard' || 
                          window.location.pathname === '/admin/dashboard' ||
                          window.location.pathname === '/teacher/dashboard' ||
                          window.location.pathname === '/student/dashboard' ||
                          window.location.pathname === '/superadmin/dashboard';
  
  // If on dashboard route, show the full page dashboard
  if (isDashboardRoute) {
    return <Sidebar />;
  }
  
  // Otherwise show the regular layout with header
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <HeaderBar
        user={user}
        school={selectedSchool}
        onProfile={handleProfile}
      />
      
      {/* Page Content */}
      <main className="flex-1">
        <div className="p-4 md:p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};

// Add a wrapper to set the default tab for TeacherDashboard
const TeacherDashboardWithTab = ({ tab }) => <TeacherDashboard defaultTab={tab} />;

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/teacher/login" element={<TeacherLogin />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Main Layout for all protected and module routes */}
              <Route
                path="/*"
                element={
                  <MainLayout>
                    <Routes>
                      {/* Remove /dashboard route and DashboardRouter */}
                      {/* Redirect /dashboard to /teacher/dashboard for teachers, or to the correct dashboard for other roles */}
                      <Route
                        path="dashboard"
                        element={<RedirectDashboard />}
                      />
                      {/* Super Admin Routes */}
                      <Route
                        path="superadmin/*"
                        element={
                          <ProtectedRoute allowedRoles={['superadmin']}>
                            <SuperAdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Routes */}
                      <Route
                        path="admin/*"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Manager Routes */}
                      <Route
                        path="admin/classes"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <ClassManager />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/subjects"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <SubjectManager />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/students"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <StudentManager />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/teachers"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <TeacherManager />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Subject Route */}
                      <Route
                        path="admin/subject"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <SubjectManager />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Class Details Route */}
                      <Route
                        path="admin/class/:classId"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <ClassDetails />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Section Details Route */}
                      <Route
                        path="admin/class/:classId/section/:sectionId"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <SectionDetails />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Visitor Management Route */}
                      <Route
                        path="admin/visitors"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <VisitorDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Fee Route */}
                      <Route
                        path="admin/fee"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <FeeDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Inventory Route */}
                      <Route
                        path="admin/inventory"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <InventoryDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Library Route */}
                      <Route
                        path="admin/library"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <LibraryDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Profile Route */}
                      <Route
                        path="admin/profile"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Achievements Route */}
                      <Route
                        path="admin/achievements"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AchievementsDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Finance Route */}
                      <Route
                        path="admin/finance"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <FinanceDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Hostel Management Routes */}
                      <Route
                        path="hostel-management"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <HostelDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="hostel/:hostelId/rooms"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <HostelRooms />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Hostel Route */}
                      <Route
                        path="admin/hostel"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <HostelDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Role Management Route */}
                      <Route
                        path="admin/role-management"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <RoleManagement />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Exams Route */}
                      <Route
                        path="admin/exams"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <ExamManager />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Transport Route */}
                      <Route
                        path="admin/transport"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <TransportManager />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Store Route */}
                      <Route
                        path="admin/store"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <OnlineStoreDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Polls Route */}
                      <Route
                        path="admin/polls"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminPollDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Teacher Routes */}
                      <Route
                        path="teacher/*"
                        element={
                          <ProtectedRoute allowedRoles={['teacher']}>
                            <TeacherDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Teacher Profile Route */}
                      <Route
                        path="teacher/profile"
                        element={
                          <ProtectedRoute allowedRoles={['teacher']}>
                            <TeacherProfile />
                          </ProtectedRoute>
                        }
                      />
                      {/* Teacher Dashboard Route (catch-all for other teacher pages) */}
                      <Route
                        path="teacher/dashboard"
                        element={
                          <ProtectedRoute allowedRoles={['teacher']}>
                            <TeacherDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="teacher/students"
                        element={<TeacherDashboardWithTab tab="students" />}
                      />
                      <Route
                        path="teacher/grades"
                        element={
                          <ProtectedRoute allowedRoles={['teacher']}>
                            <TeacherGrades />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="teacher/classes"
                        element={<TeacherDashboardWithTab tab="my-classes" />}
                      />
                      <Route
                        path="teacher/communication"
                        element={
                          <ProtectedRoute allowedRoles={['teacher']}>
                            <Communication />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="teacher/materials"
                        element={
                          <ProtectedRoute allowedRoles={['teacher']}>
                            <CourseMaterials />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="teacher/youtube-videos"
                        element={
                          <ProtectedRoute allowedRoles={['teacher']}>
                            <YouTubeVideos />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="teacher/messages"
                        element={
                          <ProtectedRoute allowedRoles={['teacher']}>
                            <TeacherMessages />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="teacher/exams"
                        element={<ProtectedRoute allowedRoles={['teacher']}><Exams /></ProtectedRoute>}
                      />
                      <Route
                        path="teacher/marks"
                        element={<ProtectedRoute allowedRoles={['teacher']}><Marks /></ProtectedRoute>}
                      />
                      <Route
                        path="teacher/student-performance"
                        element={
                          <ProtectedRoute allowedRoles={['teacher']}>
                            <StudentPerformance />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="teacher/class/:classId/section/:sectionId/students"
                        element={<ClassSectionStudents />}
                      />
                      <Route
                        path="teacher/class-todos"
                        element={
                          <ProtectedRoute allowedRoles={['teacher']}>
                            <ClassTodos />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="teacher/attendance"
                        element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAttendance /></ProtectedRoute>}
                      />
                      <Route
                        path="teacher/attendance/:classId/:sectionId"
                        element={<ProtectedRoute allowedRoles={['teacher']}><ClassSectionAttendance /></ProtectedRoute>}
                      />
                      {/* Student Fee Route - must be before /student/* */}
                      <Route
                        path="student/fee"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentFeeDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Student Routes */}
                      <Route
                        path="student/*"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Student Profile Route */}
                      <Route
                        path="student/profile"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentProfile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/polls"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentPollDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/class-todos"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentClassTodos />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/class-section"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <ClassSectionInfo />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/marks"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentMarks />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/performance"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentPerformancePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/materials"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentCourseMaterials />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/youtube-videos"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentYouTubeVideos />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/communication"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentCommunication />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/attendance"
                        element={<ProtectedRoute allowedRoles={['student']}><StudentAttendance /></ProtectedRoute>}
                      />
                      <Route
                        path="student/store"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentStore />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/transport"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <StudentTransportInfo />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/hostel"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <HostelInfo />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="student/library"
                        element={
                          <ProtectedRoute allowedRoles={['student']}>
                            <LibraryDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Inventory */}
                      <Route path="inventory" element={<InventoryDashboard />} />
                      {/* Library */}
                      <Route path="library" element={<LibraryDashboard />} />
                      {/* Notice */}
                      <Route path="notice" element={<NoticeDashboard />} />
                      {/* Homework */}
                      <Route path="homework" element={<HomeworkDashboard />} />
                      {/* Fee */}
                      <Route path="fee" element={<FeeDashboard />} />
                      {/* Class */}
                      <Route path="class" element={<ClassDashboard />} />
                      {/* Subject */}
                      <Route path="subject" element={<SubjectDashboard />} />
                      {/* Notifications Route for all roles */}
                      <Route
                        path="notifications"
                        element={
                          <ProtectedRoute>
                            <NotificationDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Default Route */}
                      <Route path="/" element={<Navigate to="/teacher/dashboard" replace />} />
                      {/* 404 Route */}
                      <Route
                        path="*"
                        element={
                          <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                              <p className="text-xl text-gray-600 mb-8">Page not found</p>
                              <button
                                onClick={() => window.history.back()}
                                className="btn btn-primary btn-lg"
                              >
                                Go Back
                              </button>
                            </div>
                          </div>
                        }
                      />
                    </Routes>
                  </MainLayout>
                }
              />
            </Routes>
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
// Add this component above App
function RedirectDashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'superadmin':
      return <Navigate to="/superadmin" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
      return <Navigate to="/teacher/dashboard" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// Placeholders for teacher pages
const TeacherStudents = () => <div>My Students Page</div>;
const TeacherGrades = () => <div>Grades & Marks Page</div>;
const TeacherClasses = () => <div>My Classes Page</div>;
const TeacherCommunication = () => <div>Communication Page</div>;
const TeacherMaterials = () => <div>Course Materials Page</div>;
const TeacherMessages = () => <div>Messages Page</div>;
