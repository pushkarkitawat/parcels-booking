import React, { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import './reset.css';
import LogoutButton from '../component/logout';
import OptionNavbar from '../component/option';

const ResetPassword = () => {
 
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const token = localStorage.getItem('agentToken');
   
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/password/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password reset successfully.');
        setTimeout(() => navigate('/'), 2000); // redirect after success
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('ERROR.');
    }
  };

  return (
    <div className="reset-password-container">
         <div className='logout'>
      <LogoutButton /></div>
      <h2 className="booking-heading" >
  Welcome To Shree Sathguru Tours And Travels<span className="arrow-icon">➤</span>
</h2>
<div className='option' >
      <OptionNavbar /> </div>
<div className='reset-section'>
      <h2>Reset Password</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label className='labpass'>New Password:</label>
          <input
          className='pass'
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className='labpass'>Confirm Password:</label>
          <input
          className='pass'
            type="password"
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button type="submit" className='reset'>RESET</button>
      </form>
      </div>
    </div>
  );
};

export default ResetPassword;
