import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, School, User, Lock, Crown, Building2, BookOpen, GraduationCap } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Login = () => {
  const { user, login, loading } = useAuth();

  // All hooks must be called before any conditional logic
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolSelection, setShowSchoolSelection] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [superAdminForm, setSuperAdminForm] = useState({ email: '', password: '' });
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [schoolUserForm, setSchoolUserForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const loadSchools = async () => {
    try {
      const response = await api.get('/api/schools');
      setSchools(response.data.data.schools);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  // Redirect teachers directly to their dashboard if already logged in
  if (user && user.role === 'teacher') {
    window.location.href = '/teacher/dashboard';
    return null;
  }

  // Redirect if already logged in
  if (user) {
    if (user.role === 'superadmin') {
      return <Navigate to="/dashboard" replace />;
    } else {
    return <Navigate to="/dashboard" replace />;
    }
  }

  const loadUsersBySchool = async (schoolId, role) => {
    try {
      const response = await api.get(`/api/users/school/${schoolId}?role=${role}`);
      setUsers(response.data.data.users);
      setSelectedRole(role);
      setShowRoleSelection(true);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'superadmin') {
      setSuperAdminForm(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (formType === 'admin') {
      setAdminForm(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setSchoolUserForm(prev => ({
      ...prev,
      [name]: value
    }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (formData) => {
    const newErrors = {};

    if (!formData.email && !formData.username) {
      newErrors.email = 'Email/Username is required';
    } else if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSuperAdminSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(superAdminForm)) {
      return;
    }

    const result = await login(superAdminForm.email, superAdminForm.password);
    if (result.success && result.user && result.user.role === 'superadmin') {
      window.location.href = '/dashboard';
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(adminForm)) {
      return;
    }

    // Use the email and password as entered
    const result = await login(adminForm.email, adminForm.password);
    if (result.success) {
      // Set selectedSchool in localStorage if user has a school or schoolId
      if (result.user && (result.user.school || result.user.schoolId)) {
        const schoolObj = result.user.school || { _id: result.user.schoolId, name: result.user.schoolName };
        localStorage.setItem('selectedSchool', JSON.stringify(schoolObj));
      }
      const role = result.user.role;
      if (role === 'Teacher') {
        window.location.href = '/Teacher/dashboard';
        return;
      }
      if (role === 'admin') {
        window.location.href = '/admin/dashboard';
        return;
      }
      if (role === 'student') {
        window.location.href = '/student/dashboard';
        return;
      }
      window.location.href = '/dashboard'; // fallback
    }
  };

  const handleSchoolUserSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(schoolUserForm)) {
      return;
    }

    const result = await login(schoolUserForm.email, schoolUserForm.password);
    if (result.success) {
      const role = result.user.role;
      if (role === 'teacher') {
        window.location.href = '/teacher/dashboard';
        return;
      }
      if (role === 'student') {
        window.location.href = '/student/dashboard';
        return;
      }
      setShowSchoolSelection(true);
    }
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setShowSchoolSelection(false);
    setShowRoleSelection(true);
  };

  const handleUserSelect = async (selectedUser) => {
    try {
      // Login with the selected user's ID as username and default password
      const username = selectedUser.teacherId || selectedUser.studentId;
      const result = await login(username, 'password123'); // Use ID as username
      if (result.success) {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const renderUserSelection = () => {
    if (!showRoleSelection || !selectedRole) return null;

    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        {/* Subtle overlay for better readability */}
        <div className="absolute inset-0 bg-white/10"></div>

        <div className="max-w-4xl w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <School className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Select Your Account
            </h2>
            <p className="text-gray-600">
              Choose your {selectedRole} account in {selectedSchool?.name}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((userItem) => (
                  <div
                    key={userItem._id}
                    onClick={() => handleUserSelect(userItem)}
                    className="p-4 border border-white/50 rounded-lg hover:border-purple-300 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:scale-105"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        {selectedRole === 'teacher' ? (
                          <BookOpen className="h-5 w-5 text-purple-600" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {userItem.firstName} {userItem.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          <strong>Username:</strong> {userItem.teacherId || userItem.studentId}
                        </p>
                        <p className="text-xs text-gray-500">
                          <strong>Password:</strong> password123
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    {selectedRole === 'teacher' ? (
                      <BookOpen className="h-6 w-6 text-gray-400" />
                    ) : (
                      <GraduationCap className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No {selectedRole}s Found
                  </h3>
                  <p className="text-gray-600">
                    There are no {selectedRole} accounts in this school.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setShowRoleSelection(false);
                setSelectedSchool(null);
                setUsers([]);
                setSelectedRole('');
              }}
              className="px-6 py-2 bg-white/80 backdrop-blur-sm border border-purple-300 text-purple-600 rounded-lg hover:bg-white hover:border-purple-400 transition-colors duration-200 shadow-lg"
            >
              Back to Role Selection
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showRoleSelection && users.length > 0) {
    return renderUserSelection();
  }

  if (showRoleSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-300/60 to-indigo-400/60 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-300/60 to-pink-400/60 rounded-full blur-xl animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-indigo-300/60 to-blue-400/60 rounded-full blur-xl animate-float-slow"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-br from-pink-300/60 to-purple-400/60 rounded-full blur-xl animate-bounce-slow"></div>
          
          {/* Animated waves */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-200/40 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-purple-200/40 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-4xl w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <School className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {selectedSchool?.name}
            </h2>
            <p className="text-gray-600">Select your role to continue</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Teacher Login */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105" onClick={() => loadUsersBySchool(selectedSchool._id, 'teacher')}>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Teacher</h3>
                <p className="text-sm text-gray-600">Access teaching tools</p>
              </div>
            </div>

            {/* Student Login */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105" onClick={() => loadUsersBySchool(selectedSchool._id, 'student')}>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Student</h3>
                <p className="text-sm text-gray-600">View academic information</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setShowRoleSelection(false);
                setSelectedSchool(null);
              }}
              className="px-6 py-2 bg-white/80 backdrop-blur-sm border border-purple-300 text-purple-600 rounded-lg hover:bg-white hover:border-purple-400 transition-colors duration-200 shadow-lg"
            >
              Back to School Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSchoolSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        {/* Subtle overlay for better readability */}
        <div className="absolute inset-0 bg-white/10"></div>

        <div className="max-w-4xl w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <School className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Select Your School
            </h2>
            <p className="text-gray-600">Choose the school you want to access</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <div
                key={school._id}
                onClick={() => handleSchoolSelect(school)}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <School className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                      <p className="text-sm text-gray-500">{school.code}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Location:</strong> {school.address.city}, {school.address.state}</p>
                    <p><strong>Contact:</strong> {school.contact.phone}</p>
                    <p><strong>Email:</strong> {school.contact.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowSchoolSelection(false)}
              className="px-6 py-2 bg-white/80 backdrop-blur-sm border border-purple-300 text-purple-600 rounded-lg hover:bg-white hover:border-purple-400 transition-colors duration-200 shadow-lg"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs with more vibrant colors */}
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

      <div className="max-w-6xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <School className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            OhYes!
          </h2>
          <p className="text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SuperAdmin Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="p-6 text-center border-b border-white/30">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Super Admin</h3>
              <p className="text-sm text-gray-600">Manage all schools and administrators</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSuperAdminSubmit} className="space-y-6">
                <div>
                  <label htmlFor="superadmin-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="superadmin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={superAdminForm.email}
                      onChange={(e) => handleChange(e, 'superadmin')}
                      className={`input pl-10 bg-white/60 backdrop-blur-sm border-white/50 text-gray-900 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="superadmin@school.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="superadmin-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="superadmin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={superAdminForm.password}
                      onChange={(e) => handleChange(e, 'superadmin')}
                      className={`input pl-10 pr-10 bg-white/60 backdrop-blur-sm border-white/50 text-gray-900 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In as Super Admin'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Admin Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="p-6 text-center border-b border-white/30">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">School Admin</h3>
              <p className="text-sm text-gray-600">Direct admin login</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleAdminSubmit} className="space-y-6">
                <div>
                  <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={adminForm.email}
                      onChange={(e) => handleChange(e, 'admin')}
                      className={`input pl-10 bg-white/60 backdrop-blur-sm border-white/50 text-gray-900 placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="admin@school.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="admin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={adminForm.password}
                      onChange={(e) => handleChange(e, 'admin')}
                      className={`input pl-10 pr-10 bg-white/60 backdrop-blur-sm border-white/50 text-gray-900 placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In as Admin'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* School User Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="p-6 text-center border-b border-white/30">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Teacher/Student</h3>
              <p className="text-sm text-gray-600">Teacher or Student login</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSchoolUserSubmit} className="space-y-6">
                <div>
                  <label htmlFor="school-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="school-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={schoolUserForm.email}
                      onChange={(e) => handleChange(e, 'school')}
                      className={`input pl-10 bg-white/60 backdrop-blur-sm border-white/50 text-gray-900 placeholder-gray-500 focus:ring-green-500 focus:border-green-500 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="user@school.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="school-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="school-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={schoolUserForm.password}
                      onChange={(e) => handleChange(e, 'school')}
                      className={`input pl-10 pr-10 bg-white/60 backdrop-blur-sm border-white/50 text-gray-900 placeholder-gray-500 focus:ring-green-500 focus:border-green-500 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Continue to School Selection'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            OhYes! v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;