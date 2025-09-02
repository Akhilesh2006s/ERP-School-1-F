import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  School, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Building,
  UserPlus
} from 'lucide-react';

import api from '../../utils/api';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [adminCredentials, setAdminCredentials] = useState(null);
  const [schoolForm, setSchoolForm] = useState({
    name: '', code: '', address: { street: '', city: '', state: '', zipCode: '' }, contact: { phone: '', email: '' },
    adminEmail: '', adminPassword: ''
  });
  const [adminForm, setAdminForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await api.get(`/api/schools`);
        setSchools(res.data.data.schools || []);
      } catch (err) { 
        console.error('Error fetching schools:', err);
      }
    };
    fetchSchools();
  }, [user.token]);

  // Dashboard stats
  const stats = {
    totalSchools: schools.length,
    activeSchools: schools.filter(s => s.isActive !== false).length,
    totalStudents: schools.reduce((sum, s) => sum + (s.stats?.totalStudents || 0), 0),
    totalTeachers: schools.reduce((sum, s) => sum + (s.stats?.totalTeachers || 0), 0)
  };

  // Filter schools
  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (school.contact?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (school.isActive !== false ? 'active' : 'inactive') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Create school
  const handleCreateSchool = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      // Create school
      const schoolData = {
        name: schoolForm.name,
        code: schoolForm.code,
        address: schoolForm.address,
        contact: schoolForm.contact,
        principal: schoolForm.principal,
        establishedYear: schoolForm.establishedYear,
        description: schoolForm.description
      };
      
      const res = await api.post(`/api/schools`, schoolData);
      
      if (res.data.success) {
        // Create admin for the school
        const adminData = {
          firstName: 'Admin',
          lastName: schoolForm.name,
          email: schoolForm.adminEmail,
          password: schoolForm.adminPassword,
          role: 'admin',
          schoolId: res.data.data.school._id,
          phone: schoolForm.contact.phone
        };
        
        const adminRes = await api.post(`/api/users`, adminData);
        
        // Refresh schools
        const resSchools = await api.get(`/api/schools`);
        setSchools(resSchools.data.data.schools || []);
        
        setAdminCredentials({
          email: schoolForm.adminEmail,
          password: schoolForm.adminPassword
        });
        setShowSchoolModal(false);
        setSchoolForm({
          name: '',
          code: '',
          address: { street: '', city: '', state: '', zipCode: '' },
          contact: { phone: '', email: '' },
          principal: '',
          establishedYear: '',
          description: '',
          adminEmail: '',
          adminPassword: ''
        });
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors.map(e => e.msg).join(', ')) ||
        'Unknown error'
      );
    }
    setLoading(false);
  };

  // Create admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
              const res = await api.post(`/api/superadmin/schools/${selectedSchool._id}/admins`, adminForm);
      setAdminCredentials(res.data.data.admin);
      setShowAdminModal(false);
      setAdminForm({ firstName: '', lastName: '', email: '', phone: '', address: '' });
    } catch (err) { /* handle error */ }
    setLoading(false);
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <School className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-white">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage all schools and administrators</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="btn btn-outline btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-purple rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Total Schools</p>
                <p className="text-2xl font-bold text-white">{stats.totalSchools}</p>
              </div>
            </div>
          </div>

          <div className="card-gold rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <School className="w-6 h-6 text-yellow-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-200">Active Schools</p>
                <p className="text-2xl font-bold text-white">{stats.activeSchools}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schools Management */}
        <div className="card">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Schools Management</h2>
                <p className="text-sm text-gray-500">Manage all registered schools</p>
              </div>
              <button
                onClick={() => setShowSchoolModal(true)}
                className="btn btn-primary btn-md mt-4 sm:mt-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add School
              </button>
            </div>
          </div>

          <div className="card-body">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search schools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Schools Table */}
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">School</th>
                    <th className="table-header-cell">Contact</th>
                    <th className="table-header-cell">Students</th>
                    <th className="table-header-cell">Teachers</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredSchools.map(school => (
                    <tr key={school._id}>
                      <td className="table-cell font-semibold">{school.name} <span className="text-xs text-gray-400">({school.code})</span></td>
                      <td className="table-cell">
                        <div>{school.contact?.email}</div>
                        <div className="text-xs text-gray-500">{school.contact?.phone}</div>
                      </td>
                      <td className="table-cell">{school.stats?.totalStudents || 0}</td>
                      <td className="table-cell">{school.stats?.totalTeachers || 0}</td>
                      <td className="table-cell">
                        <span className={`badge ${school.isActive !== false ? 'badge-success' : 'badge-danger'}`}>{school.isActive !== false ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="table-cell">
                        {/* Delete Button */}
                        <button
                          className="btn btn-outline btn-danger btn-sm"
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete ${school.name}? This will remove the school and all its users.`)) {
                              try {
                                await api.delete(`/api/schools/${school._id}`);
                                // Refresh schools
                                const resSchools = await api.get(`/api/schools`);
                                setSchools(resSchools.data.data.schools || []);
                                window.toast && window.toast.success('School deleted successfully!');
                              } catch (err) {
                                window.toast && window.toast.error('Failed to delete school.');
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSchools.length === 0 && (
              <div className="text-center py-12">
                <School className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No schools found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first school.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create School Modal */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
            <form onSubmit={handleCreateSchool} className="flex-1 overflow-y-auto p-8">
              <h3 className="text-xl font-bold mb-4">Add New School</h3>
              {formError && <div className="mb-3 text-red-600 font-semibold">{formError}</div>}
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">School Name</label>
                <input type="text" className="input" required value={schoolForm.name} onChange={e => setSchoolForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">School Code</label>
                <input type="text" className="input" required value={schoolForm.code} onChange={e => setSchoolForm(f => ({ ...f, code: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Street</label>
                <input type="text" className="input" required value={schoolForm.address.street} onChange={e => setSchoolForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">City</label>
                <input type="text" className="input" required value={schoolForm.address.city} onChange={e => setSchoolForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">State</label>
                <input type="text" className="input" required value={schoolForm.address.state} onChange={e => setSchoolForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Zip Code</label>
                <input type="text" className="input" required value={schoolForm.address.zipCode} onChange={e => setSchoolForm(f => ({ ...f, address: { ...f.address, zipCode: e.target.value } }))} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input type="text" className="input" required value={schoolForm.contact.phone} onChange={e => setSchoolForm(f => ({ ...f, contact: { ...f.contact, phone: e.target.value } }))} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input type="email" className="input" required value={schoolForm.contact.email} onChange={e => setSchoolForm(f => ({ ...f, contact: { ...f.contact, email: e.target.value } }))} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Admin Email</label>
                <input type="email" className="input" required value={schoolForm.adminEmail} onChange={e => setSchoolForm(f => ({ ...f, adminEmail: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Admin Password</label>
                <input type="password" className="input" required value={schoolForm.adminPassword} onChange={e => setSchoolForm(f => ({ ...f, adminPassword: e.target.value }))} />
              </div>
              <div className="flex justify-end mt-6 sticky bottom-0 bg-white pt-4 pb-2 -mx-8 px-8 rounded-b-lg border-t border-gray-100">
                <button type="button" className="btn btn-outline mr-2" onClick={() => setShowSchoolModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loader mr-2"></span> : null}
                  {loading ? 'Creating...' : 'Create School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showAdminModal && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <form onSubmit={handleCreateAdmin} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Add Admin for {selectedSchool.name}</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input type="text" className="input" required value={adminForm.firstName} onChange={e => setAdminForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" className="input" required value={adminForm.lastName} onChange={e => setAdminForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Email (Gmail)</label>
              <input type="email" className="input" required value={adminForm.email} onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" className="input" value={adminForm.phone} onChange={e => setAdminForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input type="text" className="input" value={adminForm.address} onChange={e => setAdminForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="flex justify-end mt-6">
              <button type="button" className="btn btn-outline mr-2" onClick={() => setShowAdminModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Admin'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Credentials Modal */}
      {adminCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h3 className="text-xl font-bold mb-4 text-green-700">Admin Created!</h3>
            <p className="mb-2">Share these credentials with the new admin:</p>
            <div className="mb-4">
              <div className="font-semibold">Username: <span className="text-blue-700">{adminCredentials.email}</span></div>
              <div className="font-semibold">Password: <span className="text-blue-700">{adminCredentials.password}</span></div>
            </div>
            <button className="btn btn-primary" onClick={() => setAdminCredentials(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Below the schools table, display the admin credentials if present */}
      {adminCredentials && (
        <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg text-center">
          <h3 className="text-lg font-bold text-green-700 mb-2">Admin Credentials</h3>
          <div className="mb-1">Email: <span className="font-mono">{adminCredentials.email}</span></div>
          <div>Password: <span className="font-mono">{adminCredentials.password}</span></div>
          <div className="text-xs text-gray-500 mt-2">Share these credentials with the new admin.</div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;