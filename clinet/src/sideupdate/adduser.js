import React, { useState } from 'react';
import './adduser.css';
import Sidebar from './component/sidebar';

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    repassword: '',
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.repassword) {
      setStatus({ success: false, message: "Passwords do not match" });
      return;
    }

    const { repassword, ...userData } = formData;

    try {
      const res = await fetch('/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ success: true, message: 'User added successfully' });
        setFormData({
          name: '',
          username: '',
          email: '',
          phone: '',
          role: '',
          password: '',
          repassword: '',
        });
      } else {
        setStatus({ success: false, message: data.message });
      }
    } catch (err) {
      setStatus({ success: false, message: 'Server error' });
    }
  };

  return (
    <div className="add-user-container">
      <Sidebar />
      <h2>Add New User</h2>
      <form className="add-user-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="repassword"
          placeholder="Re-enter Password"
          value={formData.repassword}
          onChange={handleChange}
          required
        />

        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
        </select>

        <button type="submit">Add User</button>

        {status && (
          <p style={{ color: status.success ? 'green' : 'red' }}>{status.message}</p>
        )}
      </form>
    </div>
  );
};

export default AddUser;
