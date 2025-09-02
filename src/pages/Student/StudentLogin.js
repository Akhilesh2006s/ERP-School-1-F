import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, GraduationCap, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentLogin = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }
    const result = await login(form.email, form.password);
    if (result.success && result.user && result.user.role === 'student') {
      navigate('/student/dashboard');
    } else if (result.success) {
      setError('You are not a student.');
    } else {
      setError(result.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{backgroundImage: 'url(/BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <GraduationCap className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900">Student Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input w-full"
              placeholder="student@school.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input w-full pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin; 