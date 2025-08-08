import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('agentToken');
    const username = JSON.parse(localStorage.getItem('agentInfo'));
   
    if (!token) {
      alert('You are not logged in!');
      return;
    }

    try {
      // Optional: Verify token with backend
      const res = await fetch(`${process.env.REACT_APP_API_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: username.name }),
      });
      

      if (res.ok) {
        localStorage.removeItem('agentToken'); // 🔐 Clear token
        alert('Logged out successfully.');
        navigate('/'); // 🔄 Redirect
      } else {
        const message = await res.text();
        alert(`Verification failed: ${message}`);
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Logout failed due to a network or server error.');
    }
  };
// useEffect(()=>{
//     setTimeout(()=>
//     {
//         handleLogout()
//     },10000)
// })
  return (
    <button
  className="logout-btn"
  style={{
    padding: '8px 16px',
    background: '#e74c3c',
    border: 'none',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '6px',
    cursor: 'pointer',
  }}
  onClick={handleLogout}
>
  Logout
</button>

  );
};

export default LogoutButton;
