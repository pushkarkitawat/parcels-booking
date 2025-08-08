import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [name, setname] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  
  const navigate = useNavigate();

  const validateField = (field, value) => {
    const patterns = {
      
      name: /^[A-Za-z\s]+$/,
    };

    if (!value.trim()) {
      return `${field} is required`;
    }

    if (patterns[field] && !patterns[field].test(value)) {
      return `Invalid ${field} format`;
    }

    return '';
  };

  const generateCaptcha = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCaptcha(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

   

    if (userCaptcha !== captcha) {
      alert('Incorrect captcha');
      generateCaptcha();
      setUserCaptcha('');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('agentToken', data.token);
        localStorage.setItem('agentInfo', JSON.stringify(data.user));
        navigate('/booking');
      } else {
        alert(data.message);
        generateCaptcha();
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <img src='/sathguruimage.png' width="1100px" height="600px" style={{ borderRadius: '10px' }} alt="Logo" />
      </div>
      <div className="login-box">
        <h2 className="login-title">Agent Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setname(e.target.value);
                const err = validateField('name', e.target.value);
                
                if(err){
                  setname('');
                }
              }}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group captcha-box">
            <div className="captcha-code">{captcha}</div>
            <button type="button" onClick={generateCaptcha} className="refresh-button">🔁</button>
          </div>

          <div className="form-group1">
            <input
              type="text"
              required
              maxLength="6"
              value={userCaptcha}
              onChange={(e) => setUserCaptcha(e.target.value)}
              className="form-input1"
              placeholder="Enter Captcha"
            />
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
