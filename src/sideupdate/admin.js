import React from 'react';
import './Admin.css'; // Optional CSS for styling
import Sidebar from './component/sidebar';

const Admin = () => {
  return (
    <div className="admin-container">
      <Sidebar/>
      <div className="admin-navbar">
        <div className="admin-links">
          <a href="/home">Home</a>
          
          <a href="/admin/stations">Stations</a>
          <a href="/support">Support</a>
          <a href="/">Logout</a>
        </div>
        
      </div>
      <div className="admin-dashboard">
  <div className="admin-card">
    <h2>Today's Total Shipments</h2>
    <p>1,000</p>
  </div>
  <div className="admin-card">
    <h2>Active Delivery Agents</h2>
    <p>500</p>
  </div>
  <div className="admin-card">
    <h2>Total Shipments to Date</h2>
    <p>5,000</p>
  </div>
  <div className="admin-card">
    <h2>Pending Deliveries</h2>
    <p>300</p>
  </div>
  <div className="admin-card">
    <h2>In-Transit Shipments</h2>
    <p>450</p>
  </div>
  <div className="admin-card">
    <h2>Delivered Today</h2>
    <p>850</p>
  </div>
</div>


      
      
     
    </div>
  );
};

export default Admin;
