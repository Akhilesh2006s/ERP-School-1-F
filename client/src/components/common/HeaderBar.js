import React, { useState, useRef } from 'react';
import { School, Bell, Menu, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeaderBar = ({ user, school, onProfile, onLogout, notificationCount = 0, onHamburgerClick, title }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef(null);
  const navigate = useNavigate();

  // Get initials
  const initials = user?.firstName && user?.lastName
    ? user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()
    : (user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'AA');

  // Name for header
  const displayName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  // School code
  const schoolCode = school?.code || 'SCHOOLCODE';
  // Welcome message
  const welcomeMsg = `Welcome back, ${displayName}`;

  // Dropdown handlers
  const handleAvatarClick = () => setDropdownOpen(v => !v);
  const handleProfile = () => { setDropdownOpen(false); onProfile && onProfile(); };
  const handleLogout = () => { setDropdownOpen(false); onLogout && onLogout(); };
  
  // Navigation handlers
  const handleBackToDashboard = () => {
    const role = user?.role;
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'teacher') navigate('/teacher/dashboard');
    else if (role === 'student') navigate('/student/dashboard');
    else if (role === 'superadmin') navigate('/superadmin/dashboard');
    else navigate('/dashboard');
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <header className="w-full bg-violet-600 backdrop-blur-sm border-b border-amber-300/30 shadow-lg flex items-center justify-between px-4 md:px-8 py-4 relative z-20">
      <div className="flex items-center gap-4">
        {/* Back to Dashboard Button */}
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        
        {/* Hamburger for mobile */}
        <button
          className="md:hidden mr-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
          onClick={onHamburgerClick}
          aria-label="Open sidebar menu"
        >
          <Menu className="w-7 h-7 text-white" />
        </button>
        <div className="bg-gradient-to-br from-violet-500 to-amber-500 rounded-full w-12 h-12 flex items-center justify-center">
          <School className="w-8 h-8 text-white" />
        </div>
        <div className="bg-gradient-to-r from-violet-400/40 to-amber-400/40 rounded-lg p-3 backdrop-blur-sm border border-violet-300/30">
          {title ? (
            <div className="text-2xl font-bold text-white leading-tight">{title}</div>
          ) : (
            <>
              <div className="text-2xl font-bold text-white leading-tight">{displayName}</div>
              <div className="text-sm text-amber-100 font-medium">{schoolCode} • {welcomeMsg}</div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6">
        {/* Avatar + Dropdown */}
        <div className="relative" ref={avatarRef}>
          <button
            className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-violet-300 hover:shadow-lg transition-all duration-200"
            onClick={handleAvatarClick}
            aria-label="User menu"
          >
            {initials}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-violet-500/30 rounded-lg shadow-xl py-2 z-50">
              <button
                className="block w-full text-left px-4 py-2 text-violet-300 hover:bg-violet-500/20 font-semibold transition-colors duration-200"
                onClick={handleProfile}
              >
                Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-amber-300 hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-amber-500/20 font-semibold transition-colors duration-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar; 