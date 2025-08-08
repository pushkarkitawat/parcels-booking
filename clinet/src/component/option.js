import React, {  useEffect, useState } from 'react';
import './OptionNavbar.css';
import { createSearchParams, Link, useNavigate } from 'react-router-dom';

const OptionNavbar = ({ onStatusSelect, setBooking, setError }) => {
  const [lrNoInput, setLrNoInput] = useState('');
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(false);

  
  
  const handleStatusClick = (status) => {
    if (onStatusSelect) {
      onStatusSelect(status);

    } 
    
    navigate('/booking');
  };
  useEffect(() => {
    onStatusSelect?.('PAID');
  },[]);
  const stored = localStorage.getItem('agentInfo');
  const agentObj = stored ? JSON.parse(stored) : null;
  
  

useEffect(()=>{
  if (agentObj?.id === 1){
    setAdmin(true);
  }
  return () => {
    setAdmin(false);
  };  
},[])
  const searchBooking = async () => {
    if (!lrNoInput) return;
  
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/lr/${encodeURIComponent(lrNoInput)}`);
      
      if (!res.ok) {
        if (setError) setError('No booking found with that LR No.');
        if (setBooking) setBooking(null);
        return;
      }
  
      const data = await res.json();
  
      if (data && data.lrNo && data.lrNo.toLowerCase() === lrNoInput.toLowerCase()) {
        if (setBooking) setBooking(data);
        navigate({
          pathname: '/search',
          search: createSearchParams({ lrNo: data.lrNo }).toString(),
        });
        
        if (setError) setError('');
      } else {
        if (setBooking) setBooking(null);
        if (setError) setError('No booking found with that LR No.');
      }
    } catch (err) {
      console.error(err);
      if (setError) setError('Server error while fetching booking.');
    }
  };
  
  return (
    <nav className="option-navbar">
      <div className='nav'>
        <ul className="nav-list">
          <li><Link to="/booking" className="nav-link">Home</Link></li>

          <li className="nav-item dropdown">
            <Link  className="nav-link">Operation ▾</Link>
            <ul className="dropdown-menu">
              <li><Link to="/loading" className="dropdown-link">Loading</Link></li>
             {admin ? (<li><Link to="/addstations" className="dropdown-link">+ station</Link></li>) :""} 
              {admin ? (<li><Link to="/addbuses" className="dropdown-link">+ buses</Link></li>):""}
              <li><Link to="/search" className="dropdown-link">Search</Link></li>
            </ul>
          </li>

          <li><Link to="/bookinglist" className="nav-link">Report</Link></li>
          <li><Link to="/reset" className="nav-link">Forgot Password</Link></li>
        </ul>
      </div>

      <div className='nav2'>
        <ul className="nav-list1">
          <li><button className="status-btn paid" onClick={() => handleStatusClick('PAID')}>Paid</button></li>
          <li><button className="status-btn topay" onClick={() => handleStatusClick('TOPAY')}>ToPay</button></li>
          <li><button className="status-btn foc" onClick={() => handleStatusClick('FOC')}>FOC</button></li>

        </ul>
      </div>

      <div >
  <form
    onSubmit={(e) => {
      e.preventDefault(); // Prevent page reload
      searchBooking();    // Call your function
    }}
  >
    <input
      type="text"
      placeholder="Enter LR No..."
      value={lrNoInput}
      onChange={(e) => setLrNoInput(e.target.value)}
      className="search-box"
    />
  </form>
</div>

    </nav>
  );
};

export default OptionNavbar;
