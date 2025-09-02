import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { School, User, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RoleSelection = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [schools, setSchools] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: school selection, 2: user selection
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'superadmin') {
      // SuperAdmin goes directly to dashboard
      navigate('/dashboard');
      return;
    }

    if (user?.schools?.length === 1) {
      localStorage.setItem('selectedSchool', JSON.stringify(user.schools[0]));
      window.location.href = '/dashboard';
    }

    // Load schools for non-superadmin users
    loadSchools();
  }, [user, navigate]);

  const loadSchools = async () => {
    try {
      const response = await axios.get('/api/schools');
      setSchools(response.data.data.schools);
    } catch (error) {
      console.error('Error loading schools:', error);
      toast.error('Failed to load schools');
    }
  };

  const loadUsersBySchool = async (schoolId, role) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/school/${schoolId}?role=${role}`);
      setUsers(response.data.data.users);
      setStep(2);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    loadUsersBySchool(school._id, user.role);
  };

  const handleUserSelect = (selectedUser) => {
    setSelectedUser(selectedUser);
    
    // Update the current user context with the selected user's info
    updateUser({
      ...user,
      ...selectedUser,
      selectedSchool: selectedSchool
    });

    // Redirect to intended page if present
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      navigate(redirect);
    } else {
      navigate('/dashboard');
    }
  };

  const handleBackToSchools = () => {
    setSelectedSchool(null);
    setSelectedUser(null);
    setUsers([]);
    setStep(1);
  };

  const handleSelect = (e) => {
    setSelectedSchoolId(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const school = user.schools.find(s => s._id === selectedSchoolId);
    if (!school) {
      setError('Please select a school.');
      return;
    }
    localStorage.setItem('selectedSchool', JSON.stringify(school));
    window.location.href = '/dashboard';
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Building2 className="h-6 w-6" />;
      case 'teacher':
        return <BookOpen className="h-6 w-6" />;
      case 'student':
        return <GraduationCap className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const getRoleTitle = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrators';
      case 'teacher':
        return 'Teachers';
      case 'student':
        return 'Students';
      default:
        return 'Users';
    }
  };

  if (user?.role === 'superadmin') {
    return null; // Will redirect to dashboard
  }

  if (!user?.schools || user.schools.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">No schools assigned to your account. Please contact admin.</div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <School className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? 'Select Your School' : 'Select Your Account'}
          </h2>
          <p className="text-gray-600">
            {step === 1 
              ? 'Choose the school you want to access'
              : `Select your ${user?.role} account in ${selectedSchool?.name}`
            }
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">School</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Account</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card">
          <div className="card-body">
            {step === 1 ? (
              /* School Selection */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school) => (
                  <div
                    key={school._id}
                    onClick={() => handleSchoolSelect(school)}
                    className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                        <School className="h-6 w-6 text-primary-600" />
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
                ))}
              </div>
            ) : (
              /* User Selection */
              <div>
                {/* Back Button */}
                <button
                  onClick={handleBackToSchools}
                  className="mb-6 flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Schools
                </button>

                {/* School Info */}
                <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center">
                    <School className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedSchool.name}</h3>
                      <p className="text-sm text-gray-600">{selectedSchool.code}</p>
                    </div>
                  </div>
                </div>

                {/* Users Grid */}
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner w-8 h-8"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((userItem) => (
                      <div
                        key={userItem._id}
                        onClick={() => handleUserSelect(userItem)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            {getRoleIcon(userItem.role)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {userItem.firstName} {userItem.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">{userItem.email}</p>
                            {userItem.role === 'teacher' && userItem.teacherId && (
                              <p className="text-xs text-gray-400">ID: {userItem.teacherId}</p>
                            )}
                            {userItem.role === 'student' && userItem.studentId && (
                              <p className="text-xs text-gray-400">ID: {userItem.studentId}</p>
                            )}
                            {userItem.role === 'admin' && userItem.adminId && (
                              <p className="text-xs text-gray-400">ID: {userItem.adminId}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && users.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      {getRoleIcon(user?.role)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No {getRoleTitle(user?.role)} Found
                    </h3>
                    <p className="text-gray-600">
                      There are no {user?.role} accounts in this school.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 