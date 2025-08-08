import React, { useEffect, useState } from 'react';
import './loading.css';

import OptionNavbar from './component/option';

const DispatchBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [buses, setBuses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedBus, setSelectedBus] = useState('');
  const [dispatchedbox, setDispatchedbox] = useState(false);
  const [station, setStation] = useState([]);
  const [stationsinput, setStationsinput] = useState('');
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchBuses();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/all`);
      const data = await res.json();
  
      const notDispatched = data.filter(b => b.status === 'Booked');
  
      setBookings(notDispatched);
  
      // Extract unique stations (e.g., from 'toStation' field)
      const stationSet = new Set(notDispatched.map(b => b.toStation));
      const stationArray = Array.from(stationSet);
  
      setStation(stationArray); // optional debug log
  
      // You can store this in a state if needed
      // setStations(stationArray);
  
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };
  
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredBuses = buses.filter((bus) =>
    `${bus.bus_number} ${bus.route}`.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (busNumber) => {
    setSelectedBus(busNumber);
    setQuery(busNumber); // display selected in input
    setShowDropdown(false);
  };
  const fetchBuses = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/buses`);
      const data = await res.json();
      setBuses(data);
      
    } catch (err) {
      console.error('Error fetching buses:', err);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDispatch = async () => {
    if (selected.length === 0) return alert('No bookings selected');
  
    const confirmDispatch = window.confirm(
      `Dispatch ${selected.length} bookings with Bus: ${selectedBus}?`
    );
    if (!confirmDispatch) return;
    const stored = localStorage.getItem('agentInfo');
    const agentname = stored ? JSON.parse(stored) : null;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingIds: selected,              // ✅ Pass array of booking IDs
          status: 'Dispatched',
          busNo: selectedBus,
          dispatchedBy: agentname.name,
          
        }),
      });
  
      if (!response.ok) throw new Error('Dispatch failed');
  
      const data = await response.json();
  
      alert('Bookings dispatched successfully!');
      fetchBookings();         // Refresh list
      setSelected([]);         // Reset selection
      setDispatchedbox(false); // Hide box
  
      // ✅ Automatically open new dispatch bill
      if (data.dispatchLogId) {
        window.open(
          `${process.env.REACT_APP_API_URL}/api/bookings/dispatch-bill/${data.dispatchLogId}/pdf`,
          '_blank'
        );
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      alert('Error dispatching bookings');
    }
  };
 
  
  const filteredBookings =
  stationsinput === ''
    ? bookings
    : bookings.filter(b => b.toStation === stationsinput);

    const isAllSelected = filteredBookings.length > 0 && selected.length === filteredBookings.length;
    const toggleSelectAll = () => {
      setSelected(isAllSelected ? [] : filteredBookings.map(b => b.id));
    };
 
  const handleSearch = () => {
    setShowTable(true);
  };
  const adddispatch = () => {
    if (selected.length === 0) return alert('No bookings selected');
    setDispatchedbox(true);
  };
  const closeDispatch = () => {
    setShowTable(false);
    setSelected([]);
  };
  
  return (
    <div className="dispatch-container">
      <div className={`dispatch-container ${dispatchedbox ? 'blurred' : ''}`}>
      <h2 className="booking-heading" >
  Welcome To Shree Sathguru Tours And Travels<span className="arrow-icon" >➤</span>
</h2>

      <div className='option-bar' style={{left:'-50px'}}><OptionNavbar/></div>
      
      <div className="dispatch-box">
  <h2 style={{fontSize:'20px'}}>Dispatch <span className="arrow-icon" >➤</span></h2>

  <select
  className="custom-select"
  value={stationsinput}
  onChange={(e) => setStationsinput(e.target.value)}
>
  <option value="">All Stations</option>
  {station.map((s, idx) => (
    <option key={idx} value={s}>
      {s}
    </option>
  ))}
</select>


  <button onClick={handleSearch}>Search</button>
</div>

      
{showTable && (
  <div className="dispatching-box" style={{maxHeight:'450px',overflowY:'auto'}}>
  <table className="dispatch-table" >
    <thead>
      <tr >
     <th><input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
            /></th>
        <th>DATE</th>
        <th>LR-NO</th>
        <th>From</th>
        <th>To</th>
        <th>Customer</th>
        
        
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {filteredBookings.length > 0 ? (
        filteredBookings.map((b) => (
          <tr key={b.id}>
            <td>
              <input
                type="checkbox"
                checked={selected.includes(b.id)}
                onChange={() => toggleSelect(b.id)}
              />
            </td>
            <td>{b.createdAt}</td>
            <td>{b.lrNo}</td>
            <td>{b.fromStation}</td>
            <td>{b.toStation}</td>
            <td>{b.customerName || b.senderName}</td>
            
            
            <td>{b.status}</td>
          </tr>
          
        ))
      ) : (
        <tr>
          <td colSpan="7">No bookings to dispatch</td>
        </tr>
      )}
    </tbody>
  </table>
  <button className='closedispatch' onClick={closeDispatch} >Close</button>
  <button className='ADDdispatch' onClick={adddispatch} >Dispatch</button>
  </div>)}</div>
  {dispatchedbox && (
  <div className="dispatchedbox">
    <button id="close-btn" onClick={() => setDispatchedbox(false)}>×</button>
    <h2 >Dispatch Bookings <span className="arrow-icon" >➤</span></h2>

    {/* Display selected Bus No */}
    <div style={{ position: 'relative', width: '300px' }}>
      <label>Bus No: </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Search or select a bus"
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
      />
      {showDropdown && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 10,
            position: 'absolute',
            width: '100%',
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            zIndex: 10,
          }}
        >
          {filteredBuses.length > 0 ? (
            filteredBuses.map((bus, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(bus.bus_number)}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  maxHeight:'150px',
                  overflowY:'auto',
                }}
              >
                {bus.bus_number} ({bus.route})
              </li>
            ))
          ) : (
            <li style={{ padding: '8px' }}>No buses found</li>
          )}
        </ul>
      )}
    </div>

    {/* Optional: Show all destination stations of selected bookings */}
    <div style={{maxHeight:'220px',overflowY:'auto'}}>
  <label>Destinations:</label>
  <table className="dispatch-table" style={{boxShadow:'none'}}>
    <thead>
      <tr>
        <th>LR No</th>
        <th>Destination</th>
      </tr>
    </thead>
    <tbody>
      {bookings
        .filter((b) => selected.includes(b.id))
        .map((b) => (
          <tr key={b.id} >
            <td style={{color:'#fff'}}>{b.lrNo}</td>
            <td style={{color:'#fff'}}>{b.toStation}</td>
          </tr>
        ))}
    </tbody>
  </table>
</div>


    {/* Submit/Dispatch Button */}
    <button onClick={handleDispatch} disabled={!selectedBus}>
      Submit Dispatch
    </button>
  </div>
)}

    </div>
  );
};

export default DispatchBookings;
