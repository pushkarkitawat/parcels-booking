import React from 'react';
import { useNavigate } from 'react-router-dom';

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '20px'
      }}
    >
      ← Back
    </button>
  );
};

export const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/home')}
      style={{
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '20px',
        justifySelf:'end',
        alignSelf:'end',
        marginRight:'20px'

      }}
    >
      🏠 Home
    </button>
  );
};
