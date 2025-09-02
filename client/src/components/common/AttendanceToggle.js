import React from 'react';
import { Check, X } from 'lucide-react';

const AttendanceToggle = ({ 
  status, 
  onChange, 
  disabled = false, 
  size = 'md',
  showLabels = true 
}) => {
  const isPresent = status === 'present';
  
  const sizeClasses = {
    sm: 'h-6 w-12',
    md: 'h-8 w-16',
    lg: 'h-10 w-20'
  };

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(isPresent ? 'absent' : 'present');
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {showLabels && (
        <span className={`text-sm font-medium ${
          isPresent ? 'text-success-700' : 'text-gray-500'
        }`}>
          Present
        </span>
      )}
      
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          attendance-toggle ${sizeClasses[size]}
          ${isPresent ? 'present' : 'absent'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          transition-all duration-300 ease-in-out
        `}
        aria-label={`Mark as ${isPresent ? 'absent' : 'present'}`}
      >
        <span className="attendance-toggle-handle flex items-center justify-center">
          {isPresent ? (
            <Check className="w-3 h-3 text-success-600" />
          ) : (
            <X className="w-3 h-3 text-danger-600" />
          )}
        </span>
      </button>
      
      {showLabels && (
        <span className={`text-sm font-medium ${
          !isPresent ? 'text-danger-700' : 'text-gray-500'
        }`}>
          Absent
        </span>
      )}
    </div>
  );
};

export default AttendanceToggle;