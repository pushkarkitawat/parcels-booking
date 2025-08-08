// components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';
import { HomeButton } from './back';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3>Admin Panel</h3>
      <ul>
        <li><Link to="/admin/showagent">Agent List</Link></li>
        <li><Link to="/admin/users">Create Agent</Link></li>
        <li><Link to="/admin/createstation">Create station</Link></li>
        <li><Link to="/admin/stations">Stations list</Link></li>
        <li><Link to="/admin/addbus">Add Bus</Link></li>
        <li><Link to="/admin/buslist">Buses list</Link></li>
        <li><Link to="/admin/bookinglist">Bookings</Link></li>

      </ul>
      <HomeButton/>
    </div>
  );
};

export default Sidebar;
