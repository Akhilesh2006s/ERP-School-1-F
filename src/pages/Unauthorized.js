import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h2>Unauthorized</h2>
      <p>You do not have permission to access this page.</p>
      <button
        onClick={handleBackToLogin}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 2rem',
          fontSize: '1.1rem',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Back to Login
      </button>
    </div>
  );
};

export default Unauthorized; 