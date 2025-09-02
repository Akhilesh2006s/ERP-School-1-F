import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
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
  Folder,
  User,
  DollarSign,
  Home,
  ShoppingCart,
  Shield,
  BarChart2,
  MessageCircle,
  Bus,
  Trophy,
  Youtube,
  Building,
  School,
  Settings,
  BarChart3,
  Code
} from 'lucide-react';

const navItemsByRole = {
  superadmin: [
    { name: 'Home', path: '/dashboard', icon: <Building className="w-12 h-12" />, color: 'purple' },
    { name: 'Schools', path: '/superadmin', icon: <School className="w-12 h-12" />, color: 'gold' },
    { name: 'Admins', path: '/superadmin/admins', icon: <Shield className="w-12 h-12" />, color: 'purple' },
  ],
  admin: [
    // Core Modules
    { name: 'Dashboard', path: '/dashboard', icon: <ClipboardList className="w-12 h-12" />, color: 'purple' },
    { name: 'Student Management', path: '/admin/students', icon: <Users className="w-12 h-12" />, color: 'purple' },
    { name: 'Class Management', path: '/admin/classes', icon: <BookOpen className="w-12 h-12" />, color: 'gold' },
    { name: 'Subject Management', path: '/admin/subjects', icon: <ClipboardList className="w-12 h-12" />, color: 'purple' },
    { name: 'Exam Management', path: '/admin/exams', icon: <FileText className="w-12 h-12" />, color: 'gold' },
    { name: 'Teachers', path: '/admin/teachers', icon: <User className="w-12 h-12" />, color: 'purple' },
    { name: 'Teacher Dashboard', path: '/teacher/dashboard', icon: <ClipboardList className="w-12 h-12" />, color: 'gold' },
    // Management
    { name: 'Fee Management', path: '/admin/fee', icon: <DollarSign className="w-12 h-12" />, color: 'gold' },
    { name: 'Finance Management', path: '/admin/finance', icon: <DollarSign className="w-12 h-12" />, color: 'gold' },
    { name: 'Inventory & Assets', path: '/admin/inventory', icon: <Folder className="w-12 h-12" />, color: 'gold' },
    { name: 'Library Management', path: '/admin/library', icon: <BookOpen className="w-12 h-12" />, color: 'purple' },
    { name: 'Hostel Management', path: '/admin/hostel', icon: <Home className="w-12 h-12" />, color: 'purple' },
    { name: 'Transport Management', path: '/admin/transport', icon: <Bus className="w-12 h-12" />, color: 'gold' },
    // Communication
    { name: 'Communication', path: '/admin/communication', icon: <Bell className="w-12 h-12" />, color: 'purple' },
    // Additional Features
    { name: 'Role Management', path: '/admin/role-management', icon: <Shield className="w-12 h-12" />, color: 'purple' },
    { name: 'Achievements & Awards', path: '/admin/achievements', icon: <CheckCircle className="w-12 h-12" />, color: 'gold' },
    { name: 'Online Store', path: '/admin/store', icon: <ShoppingCart className="w-12 h-12" />, color: 'purple' },
    { name: 'Polls & Surveys', path: '/admin/polls', icon: <Calendar className="w-12 h-12" />, color: 'gold' },
  ],
  student: [
    { name: 'Dashboard', path: '/student', icon: <ClipboardList className="w-12 h-12" />, color: 'purple' },
    { name: 'Attendance', path: '/student/attendance', icon: <Calendar className="w-12 h-12" />, color: 'purple' },
    { name: 'Marks', path: '/student/marks', icon: <FileText className="w-12 h-12" />, color: 'gold' },
    { name: 'Performance', path: '/student/performance', icon: <BarChart2 className="w-12 h-12" />, color: 'purple' },
    { name: 'Fee Management', path: '/student/fee', icon: <DollarSign className="w-12 h-12" />, color: 'gold' },
    { name: 'Communication', path: '/student/communication', icon: <MessageCircle className="w-12 h-12" />, color: 'purple' },
    { name: 'Class To-Dos', path: '/student/class-todos', icon: <FileText className="w-12 h-12" />, color: 'gold' },
    { name: 'Course Materials', path: '/student/materials', icon: <BookOpen className="w-12 h-12" />, color: 'purple' },
    { name: 'YouTube Videos', path: '/student/youtube-videos', icon: <Youtube className="w-12 h-12" />, color: 'gold' },
    { name: 'Achievements & Awards', path: '/student/achievements', icon: <Trophy className="w-12 h-12" />, color: 'gold' },
    { name: 'Online Store', path: '/student/store', icon: <ShoppingCart className="w-12 h-12" />, color: 'purple' },
    { name: 'Polls & Surveys', path: '/student/polls', icon: <ClipboardList className="w-12 h-12" />, color: 'gold' },
    { name: 'Transport Info', path: '/student/transport', icon: <Bus className="w-12 h-12" />, color: 'gold' },
    { name: 'Class/Section Info', path: '/student/class-section', icon: <Users className="w-12 h-12" />, color: 'purple' },
    { name: 'Library', path: '/student/library', icon: <BookOpen className="w-12 h-12" />, color: 'purple' },
    { name: 'Hostel', path: '/student/hostel', icon: <Home className="w-12 h-12" />, color: 'purple' },
  ],
  teacher: [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: <ClipboardList className="w-12 h-12" />, color: 'purple' },
    { name: 'My Students', path: '/teacher/students', icon: <Users className="w-12 h-12" />, color: 'purple' },
    { name: 'My Classes', path: '/teacher/classes', icon: <BookOpen className="w-12 h-12" />, color: 'gold' },
    { name: 'Exams', path: '/teacher/exams', icon: <FileText className="w-12 h-12" />, color: 'gold' },
    { name: 'Marks', path: '/teacher/marks', icon: <GraduationCap className="w-12 h-12" />, color: 'purple' },
    { name: 'Student Performance', path: '/teacher/student-performance', icon: <BarChart3 className="w-12 h-12" />, color: 'purple' },
    { name: 'Class To-Dos', path: '/teacher/class-todos', icon: <FileText className="w-12 h-12" />, color: 'gold' },
    { name: 'Communication', path: '/teacher/communication', icon: <Bell className="w-12 h-12" />, color: 'purple' },
    { name: 'Course Materials', path: '/teacher/materials', icon: <Folder className="w-12 h-12" />, color: 'purple' },
    { name: 'YouTube Videos', path: '/teacher/youtube-videos', icon: <Youtube className="w-12 h-12" />, color: 'gold' },
  ],
};

// Filter and clean up nav items
navItemsByRole.admin = navItemsByRole.admin.filter(item =>
  item.name !== 'Learning Management' &&
  item.name !== 'Security & Roles' &&
  item.name !== 'Branch Management'
);

navItemsByRole.admin = navItemsByRole.admin.map(item =>
  item.name === 'Exams & Marks'
    ? { ...item, name: 'Exam Management' }
    : item
);

// Remove Teacher Dashboard from admin sidebar
navItemsByRole.admin = navItemsByRole.admin.filter(item => item.name !== 'Teacher Dashboard');

// Remove Communication from admin
navItemsByRole.admin = navItemsByRole.admin.filter(item => item.name !== 'Communication');

// Remove Achievements & Awards from student
navItemsByRole.student = navItemsByRole.student.filter(item => item.name !== 'Achievements & Awards');

const Sidebar = ({ isOpen, onClose, collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role;
  
  // Dashboard data state
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  

  
  // Check if we're on the dashboard route
  const isOnDashboard = location.pathname === '/dashboard' || location.pathname === '/admin/dashboard' || location.pathname === '/teacher/dashboard';
  
  // Filter out Dashboard from nav items when on dashboard route
  const navItems = (navItemsByRole[role] || []).filter(item => 
    !isOnDashboard || item.name !== 'Dashboard'
  );
  
  // Debug logging
  console.log('User role:', role);
  console.log('Available roles:', Object.keys(navItemsByRole));
  console.log('Nav items for role:', navItems);
  console.log('Is on dashboard:', isOnDashboard);
  
  // Fetch dashboard data when on dashboard route
  useEffect(() => {
    if (isOnDashboard && (user?.role === 'admin' || user?.role === 'teacher')) {
      const fetchDashboardData = async () => {
        setLoading(true);
        try {
          const schoolId = user?.school?._id;
          if (!schoolId) {
            console.error('No school ID found');
            return;
          }

          const headers = { Authorization: `Bearer ${user.token}` };
          
          if (user?.role === 'admin') {
            // Admin dashboard data
            const [studentsRes, teachersRes, classesRes] = await Promise.all([
              api.get(`/api/users?role=student&schoolId=${schoolId}`),
              api.get(`/api/users?role=teacher&schoolId=${schoolId}`),
              api.get(`/api/class?schoolId=${schoolId}`)
            ]);
            
            setStudents(studentsRes.data.data.users || []);
            setTeachers(teachersRes.data.data.users || []);
            setClasses(classesRes.data.data.classes || []);
          } else if (user?.role === 'teacher') {
            // Teacher dashboard data
            const [assignmentsRes, studentsRes] = await Promise.all([
              api.get('/api/auth/me'),
              api.get(`/api/users?role=student&schoolId=${schoolId}`)
            ]);
            
            const assignments = assignmentsRes.data?.data?.user?.assignments || [];
            const allStudents = assignments.flatMap(a => a.students || []);
            
            setStudents(allStudents);
            setTeachers([user]); // Current teacher
            setClasses(assignments.map(a => ({
              _id: a.class?._id,
              name: a.class?.name || a.class?.number,
              section: a.section?.name,
              subject: a.subject?.name,
              students: a.students || []
            })));
          }
        } catch (err) { 
          console.error('Error fetching dashboard data:', err);
          // Set mock data if API fails
          if (user?.role === 'admin') {
            setStudents([
              { _id: '1', firstName: 'John', lastName: 'Doe', studentId: 'ST001', class: { name: 'Class 10', section: 'A' }, feeStatus: 'paid', status: 'active', feeAmount: 5000 },
              { _id: '2', firstName: 'Jane', lastName: 'Smith', studentId: 'ST002', class: { name: 'Class 9', section: 'B' }, feeStatus: 'pending', status: 'active', feeAmount: 4500 },
            ]);
            setTeachers([
              { _id: '1', firstName: 'Mr.', lastName: 'Johnson', subjects: ['Math', 'Physics'] },
              { _id: '2', firstName: 'Ms.', lastName: 'Williams', subjects: ['English', 'Literature'] },
            ]);
            setClasses([
              { _id: '1', name: 'Class 10', section: 'A', activeNotices: 2 },
              { _id: '2', name: 'Class 9', section: 'B', activeNotices: 1 },
            ]);
          } else if (user?.role === 'teacher') {
            // Mock teacher data
            setStudents([
              { _id: '1', firstName: 'John', lastName: 'Doe', studentId: 'ST001' },
              { _id: '2', firstName: 'Jane', lastName: 'Smith', studentId: 'ST002' },
              { _id: '3', firstName: 'Mike', lastName: 'Johnson', studentId: 'ST003' },
            ]);
            setTeachers([user]);
            setClasses([
              { _id: '1', name: 'Class 10', section: 'A', subject: 'Mathematics', students: 35 },
              { _id: '2', name: 'Class 9', section: 'B', subject: 'Mathematics', students: 30 },
            ]);
          }
        } finally {
          setLoading(false);
        }
      };
      
      fetchDashboardData();
    }
  }, [isOnDashboard, user]);



  const handleCardClick = (path) => {
    try {
      navigate(path);
      if (onClose) onClose();
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleLogout = () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">OhYes!</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.firstName} {user?.lastName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">

              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {isOnDashboard ? (
          // Dashboard Content
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Teacher Dashboard'}
              </h2>
              <p className="text-gray-600">
                {user?.role === 'admin' 
                  ? 'Welcome to your school management overview' 
                  : 'Welcome to your teaching dashboard'
                }
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-800 text-lg">Loading dashboard data...</div>
              </div>
            ) : (
              <>
                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {user?.role === 'admin' ? (
                    // Admin Dashboard Stats
                    <>
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center shadow-lg border border-white/50">
                        <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="ml-6">
                          <p className="text-base font-medium text-gray-600">Total Students</p>
                          <p className="text-3xl font-bold text-gray-800">{students.length}</p>
                          <p className="text-sm text-gray-600">Enrolled Students</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center shadow-lg border border-white/50">
                        <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <User className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div className="ml-6">
                          <p className="text-base font-medium text-gray-600">Total Teachers</p>
                          <p className="text-3xl font-bold text-gray-800">{teachers.length}</p>
                          <p className="text-sm text-gray-600">Active Teachers</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center shadow-lg border border-white/50">
                        <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="ml-6">
                          <p className="text-base font-medium text-gray-600">Total Classes</p>
                          <p className="text-3xl font-bold text-gray-800">{classes.length}</p>
                          <p className="text-sm text-gray-600">Active Classes</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 flex items-center shadow-lg border border-white/50">
                        <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="ml-6">
                          <p className="text-base font-medium text-gray-600">Pending Fees</p>
                          <p className="text-3xl font-bold text-gray-800">
                            ₹{students.filter(s => s.feeStatus === 'pending').reduce((sum, s) => sum + (s.feeAmount || 0), 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Requires attention</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Teacher Dashboard Stats
                    <>
                      <div className="card-purple rounded-xl p-6 flex items-center">
                        <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Users className="w-8 h-8 text-purple-300" />
                        </div>
                        <div className="ml-6">
                          <p className="text-base font-medium text-purple-200">My Students</p>
                          <p className="text-3xl font-bold text-white">{students.length}</p>
                          <p className="text-sm text-purple-200">Total Students</p>
                        </div>
                      </div>
                      
                      <div className="card-gold rounded-xl p-6 flex items-center">
                        <div className="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-yellow-300" />
                        </div>
                        <div className="ml-6">
                          <p className="text-base font-medium text-yellow-200">My Classes</p>
                          <p className="text-3xl font-bold text-white">{classes.length}</p>
                          <p className="text-sm text-yellow-300">Active Classes</p>
                        </div>
                      </div>
                      
                      <div className="card-purple rounded-xl p-6 flex items-center">
                        <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-purple-300" />
                        </div>
                        <div className="ml-6">
                          <p className="text-base font-medium text-purple-200">Today's Classes</p>
                          <p className="text-3xl font-bold text-white">{classes.length}</p>
                          <p className="text-sm text-purple-200">Scheduled</p>
                        </div>
                      </div>
                      
                      <div className="card-gold rounded-xl p-6 flex items-center">
                        <div className="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-yellow-300" />
                        </div>
                        <div className="ml-6">
                          <p className="text-base font-medium text-yellow-200">Assignments</p>
                          <p className="text-3xl font-bold text-white">{classes.length}</p>
                          <p className="text-sm text-yellow-300">Active</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Module Navigation Grid */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Quick Access</h3>
                  <p className="text-gray-300 mb-6">
                    {user?.role === 'admin' 
                      ? 'Access your school management modules' 
                      : 'Access your teaching tools and resources'
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          // Module Navigation
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Module Navigation</h2>
              <p className="text-gray-300">Click on any module below to access its features</p>
            </div>
          </div>
        )}

        {/* Module Grid - Always show when not on dashboard, or show after dashboard content */}
        <div className="grid dashboard-grid gap-6">
          {navItems.map((item, idx) => (
            <div
              key={item.name + idx}
              onClick={() => handleCardClick(item.path)}
              className={`
                group relative cursor-pointer rounded-2xl p-6 dashboard-card
                ${item.color === 'purple' ? 'card-purple' : 'card-gold'}
                hover:neon-glow-${item.color}
              `}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`
                  p-4 rounded-xl transition-all duration-300 group-hover:scale-110
                  ${item.color === 'purple' 
                    ? 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30' 
                    : 'bg-yellow-500/20 text-yellow-300 group-hover:bg-yellow-500/30'
                  }
                `}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-white">
                    {item.name}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    item.color === 'purple' ? 'text-purple-200' : 'text-yellow-200'
                  }`}>
                    Click to access
                  </p>
                </div>
              </div>
              
              {/* Hover overlay effect */}
              <div className={`
                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${item.color === 'purple' 
                  ? 'bg-gradient-to-br from-purple-500/10 to-transparent' 
                  : 'bg-gradient-to-br from-yellow-500/10 to-transparent'
                }
              `} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 