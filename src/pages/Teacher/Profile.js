import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const { user, changePassword } = useAuth();
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
    <div className="max-w-lg mx-auto mt-16 modal-dark shadow-xl rounded-2xl border border-purple-500/30 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">My Profile</h2>
      <div className="flex items-center mb-4">
        <div className="w-14 h-14 bg-purple-900/50 border border-purple-500/30 rounded-full flex items-center justify-center mr-4">
          <span className="text-2xl font-bold text-purple-200">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </span>
        </div>
        <div>
          <div className="text-lg font-semibold text-white">{user?.fullName}</div>
          <div className="text-sm text-gray-300 capitalize">{user?.role}</div>
        </div>
      </div>
      <div className="mb-4 flex items-center">
        <Mail className="w-5 h-5 text-purple-400 mr-2" />
        <span className="text-gray-200">{user?.email}</span>
      </div>
      <div className="mb-2 flex items-center">
        <Lock className="w-5 h-5 text-purple-400 mr-2" />
        <span className="text-gray-200 select-all">********</span>
      </div>
      <button
        className="mt-4 mb-2 px-4 py-2 btn-dark-primary rounded-lg font-semibold transition"
        onClick={() => setShowChange(v => !v)}
      >
        {showChange ? 'Cancel' : 'Change Password'}
      </button>
      {showChange && (
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Current Password</label>
            <div className="relative flex items-center">
              <input
                type={showCurrent ? 'text' : 'password'}
                name="current"
                value={form.current}
                onChange={handleChange}
                className="input-dark w-full pr-10 rounded-lg"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-2 text-purple-400 hover:text-purple-300 focus:outline-none"
                onClick={() => setShowCurrent(v => !v)}
                tabIndex={-1}
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">New Password</label>
            <div className="relative flex items-center">
              <input
                type={showNew ? 'text' : 'password'}
                name="new"
                value={form.new}
                onChange={handleChange}
                className="input-dark w-full pr-10 rounded-lg"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="absolute right-2 text-purple-400 hover:text-purple-300 focus:outline-none"
                onClick={() => setShowNew(v => !v)}
                tabIndex={-1}
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              className="input-dark w-full rounded-lg"
              autoComplete="new-password"
              required
            />
          </div>
          {formError && <div className="text-red-400 text-sm">{formError}</div>}
          {formSuccess && <div className="text-green-400 text-sm">{formSuccess}</div>}
          <button
            type="submit"
            className="w-full btn-dark-primary py-2 rounded-lg font-semibold transition flex items-center justify-center"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
      <div className="text-xs text-gray-400 mt-4">(For security, password is never shown. You can change it here.)</div>
    </div>
  );
};

export default Profile; 