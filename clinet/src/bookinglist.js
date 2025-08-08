import React, { useEffect, useState } from 'react';
import './bookinglist.css';
import './sideupdate/StationList.css';
import { BackButton } from './component/back';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filterType, setFilterType] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const stored = localStorage.getItem('agentInfo');
  const agentName = stored ? JSON.parse(stored) : null;
  
  useEffect(() => {
    fetchBookings();
   
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings?filter=today`);
      const data = await res.json();
      setBookings(data);
      setFilteredBookings(bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };
  
  
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  

  const applyFilter = async () => {
    const now = new Date();
    let fromDate, toDate;
  
    switch (filterType) {
      case 'today':
        fromDate = formatDate(now);
        toDate = formatDate(now);
        break;
  
      case 'last7': {
        const past7 = new Date(now);
        past7.setDate(past7.getDate() - 6);
        fromDate = formatDate(past7);
        toDate = formatDate(now);
        break;
      }
  
      case 'thisMonth':
        fromDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
        toDate = formatDate(now);
        break;
  
      case 'lastMonth': {
        const firstLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        fromDate = formatDate(firstLastMonth);
        toDate = formatDate(lastLastMonth);
        break;
      }
  
      case 'custom':
        if (!customFrom || !customTo) return;
        fromDate = customFrom;
        toDate = customTo;
        break;
  
      default:
        return fetchBookings(); // fallback to default fetch
    }
  
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookings?from=${fromDate}&to=${toDate}`
      );
      const data = await response.json();
      setBookings(data);
      setFilteredBookings(data);
    } catch (err) {
      console.error('Error fetching filtered bookings:', err);
    }
  };
  

  const handleStatusChange = (id, newStatus) => {
    
    setFilteredBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };
  

  const updateStatus = async (id, newStatus) => {
    const booking = filteredBookings.find((b) => b.id === id);
  
    if (!booking) {
      alert('Booking not found.');
      return;
    }
    if (booking.status === newStatus) {
      return; // Do nothing if the status is unchanged
    }
  
    // Restrict Booked only if Dispatched
    if (newStatus === 'Booked' && booking.status !== 'Dispatched') {
      alert('Status can only be set to "Booked" if it is currently "Dispatched".');
      return;
    }

    const token = localStorage.getItem('agentToken');

    // Confirm before any status change
    const confirmChange = window.confirm(`Are you sure you want to change status to "${newStatus}"?`);
    if (!confirmChange) return;
  
    try {

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // ← Send token
        },
        body: JSON.stringify({changedBy:agentName.name, status: newStatus }),
      });
  
      if (res.ok) {
        alert('Status updated!');
        fetchBookings(); // refresh
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status.');
    }
  };
  const getDeliveredOrCancelledDate = (logs) => {
    const log = logs?.find(l => l.newStatus === 'Delivered' || l.newStatus === 'Cancelled');
    return log ? new Date(log.changedAt).toLocaleDateString() : 'N/A';
  };



  return (
    <div className="station-container ">
         <div className="station-header" style={{marginBottom:'0px',position:'absolute',justifySelf:'right',marginTop:'20px'}}>
        <BackButton />
      </div>
      <h2 className='stationheading'>Booking List</h2>

      <div className="station-search-input1">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="today">Today</option>
          <option value="last7">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="custom">Custom Range</option>
        </select>

        {filterType === 'custom' && (
          <>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              max={customTo}
            />
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              min={customFrom}
            />
          </>
        )}

        <button onClick={applyFilter}>Apply Filter</button>
      </div>

      <table className="station-table ">
        <thead>
          <tr>
            <th className='station-th'>ID</th>
            <th className='station-th'>LR No</th>
            <th className='station-th'>From</th>
            <th className='station-th'>To</th>
            <th className='station-th'>Total</th>
            <th className='station-th'>Status</th>
            <th className='station-th'>Update</th>
            <th className='station-th'>Booking Date</th>
            <th className='station-th'>Dispatch By</th>
            <th className='station-th'>Dispatch Date</th>
            <th className='station-th'>Dilevery Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td className='station-td'>{booking.id}</td>
                <td className='station-td'>{booking.lrNo}</td>
                <td className='station-td'>{booking.fromStation}</td>
                <td className='station-td'>{booking.toStation}</td>
                <td className='station-td'>₹{booking.parcels[0].total}</td>
                <td className='station-td'>
  <select
    style={{
      backgroundColor:
        booking.status === 'Booked' ? '#b3e5fc' :
        booking.status === 'Dispatched' ? '#ffe082' :
        booking.status === 'Recevied' ? '#c8e6c9' :
        booking.status === 'Delivered' ? '#dcedc8' :
        booking.status === 'Cancelled' ? '#ffcdd2' : 'white',
      color:
        booking.status === 'Booked' ? '#01579b' :
        booking.status === 'Dispatched' ? '#ff6f00' :
        booking.status === 'Recevied' ? '#2e7d32' :
        booking.status === 'Delivered' ? '#558b2f' :
        booking.status === 'Cancelled' ? '#c62828' : 'black',
      fontWeight: 'bold',
      borderRadius: '6px',
      padding: '4px 8px',
      outline:'none',
    }}
    value={booking.status}
    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
  >
    <option value="Booked">Booked</option>
    <option value="Dispatched">Dispatched</option>
    <option value="Recevied">Recevied</option>
    <option value="Delivered">Delivered</option>
    <option value="Cancelled">Cancelled</option>
  </select>
</td>
<td className='station-td'>
<button
  disabled={
    agentName?.id !== 1 ||
    
    booking.status === 'Delivered' ||
    booking.status === 'Cancelled'
  }
  style={{
    cursor: agentName?.id !== 1 ? 'not-allowed' : 'pointer'
  }}
  onClick={() => updateStatus(booking.id,booking.status)}
>
  Save
</button>
</td>

                <td className='station-td'>{new Date(booking.createdAt).toLocaleDateString()}</td>
                <td className='station-td'>{booking.dispatch[0]?.busNo || 'N/A'}</td>
                <td className='station-td'>{booking.dispatch[0]?.dispatchedAt  ? new Date(booking.dispatch[0]?.dispatchedAt).toLocaleDateString() : 'N/A'}</td>
                <td
      className='station-td'
      style={{
        color: booking.logs?.[0]?.newStatus === 'Delivered' ? 'green' : 'red'
      }}
    >
      {getDeliveredOrCancelledDate(booking.logs)}
    </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className='station-td' colSpan="12">No bookings found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;
