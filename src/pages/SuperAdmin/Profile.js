import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Shield } from 'lucide-react';

const SuperAdminProfile = () => {
  const { user, changePassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [form, setForm] = useState({ current: '', new: '', confirm: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
    setFormSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.current || !form.new || !form.confirm) {
      setFormError('All fields are required.');
      return;
    }
    if (form.new !== form.confirm) {
      setFormError('New passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await changePassword(form.current, form.new);
    setLoading(false);
    if (result.success) {
      setFormSuccess('Password changed successfully!');
      setForm({ current: '', new: '', confirm: '' });
      setShowChange(false);
    } else {
      setFormError(result.error || 'Failed to change password.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>

      <div className="max-w-lg mx-auto mt-16 bg-white/90 shadow-xl rounded-2xl border border-purple-100 p-8 relative z-10">
        <h2 className="text-2xl font-bold text-purple-900 mb-6">Super Admin Profile</h2>
        
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-xl font-semibold text-purple-900">{user?.firstName} {user?.lastName}</div>
            <div className="text-sm text-purple-600 font-medium">Super Administrator</div>
            <div className="text-xs text-gray-500">System-wide access</div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <User className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <div className="text-sm text-gray-500">Full Name</div>
              <div className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <Mail className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <div className="text-sm text-gray-500">Email Address</div>
              <div className="font-medium text-gray-800">{user?.email}</div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <div className="text-sm text-gray-500">Role</div>
              <div className="font-medium text-purple-600">Super Administrator</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <button
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={() => setShowChange(v => !v)}
          >
            {showChange ? 'Cancel Password Change' : 'Change Password'}
          </button>

          {formError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {formSuccess}
            </div>
          )}

          {showChange && (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    name="current"
                    value={form.current}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 focus:outline-none"
                    onClick={() => setShowCurrent(v => !v)}
                    tabIndex={-1}
                    aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    name="new"
                    value={form.new}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 focus:outline-none"
                    onClick={() => setShowNew(v => !v)}
                    tabIndex={-1}
                    aria-label={showNew ? 'Hide new password' : 'Show new password'}
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Changing Password...
                  </div>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminProfile;
