import React, { useEffect, useState } from 'react';
import LogoutButton from '../component/logout';
import OptionNavbar from '../component/option';
import './SingleBookingSearch.css';
import { useSearchParams } from 'react-router-dom';

const SingleBookingSearch = () => {
  const [booking, setBooking] = useState(null);
  const [params] = useSearchParams();
  
  const lrNo = params.get('lrNo');
  const getBgColor = (value) => {
    switch (value.toLowerCase()) {
      case 'paid':
      case 'booked':
      case 'delivered':
        return 'rgb(9, 134, 55)'; // green-ish
  
      case 'topay':
        return 'rgb(237, 61, 41)'; // red
  
      case 'cancelled':
        return 'rgba(237, 61, 13, 0.5)'; // red-ish with transparency
  
      case 'foc':
      case 'dispatched':
        return '#3b82f6'; // blue-ish
  
      default:
        return '#f2f2f2'; // default gray
    }
  };
  

  const updateStatus = async (id, newStatus) => {
    
    try {
      const agentname = localStorage.getItem('agentInfo');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({changedBy:agentname ,status: newStatus }),
      });
      const data = await res.json();
      alert(data.message);
      setBooking(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/lr/${encodeURIComponent(lrNo)}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        } else {
          alert('No booking found.');
        }
      } catch (e) {
        alert('Server error');
      }
    };

    if (lrNo) fetchBooking();
  });
  const printLrCopy = () => {
    if (!booking?.lrNo) {
      return;
    }
    const url = `${process.env.REACT_APP_API_URL}/api/bookings/lr/${encodeURIComponent(booking.lrNo)}/pdf`;
    window.open(url, '_blank');
  };
  const date = booking?.createdAt?.split('T')[0] || '';

  return (
    <div className="booking-search-container">
      <div className='logout'>
        <LogoutButton />
      </div>
      <h2 className="booking-heading">
        Welcome To Shree Sathguru Tours And Travels<span className="arrow-icon">➤</span>
      </h2>

      <div className='option'>
        <OptionNavbar setBooking={setBooking} />
      </div>

      {booking && (
        <>
          <div className='form-section1' style={{ left: '50px', top: '60px' }}>
            <h3>From-To</h3>
            <input value={booking.fromStation} readOnly />
            <p>TO</p>
            <input value={booking.toStation} readOnly />
          </div>
          <div className="form-section1" style={{width:'150px',border:'none',borderRadius:'5px',backgroundColor:'transparent',boxShadow:'none',textAlign:'center',fontSize:'16px',fontWeight:'bold',color:'#333',outline:'none',left:'640px',top:'240px',position:'absolute'}}>
          <h3>Type :</h3>
          <input type="text" name="TYPE" placeholder="Name" value={booking.type} required style={{width:'100px',height:'10px',border:'none',borderRadius:'5px', backgroundColor: getBgColor(booking.type),textAlign:'center',fontSize:'14px',fontWeight:'bold',color:'#fff',outline:'none'}} readOnly/>

        </div>
        <div className="form-section1" style={{width:'150px',border:'none',borderRadius:'5px',backgroundColor:'transparent',boxShadow:'none',textAlign:'center',fontSize:'16px',fontWeight:'bold',color:'#333',outline:'none',left:'780px',top:'229px',position:'absolute'}}>
          <input type="text" name="TYPE" placeholder="Name" value={booking.status} required style={{width:'100px',height:'10px',border:'none',borderRadius:'5px', backgroundColor: getBgColor(booking.status),textAlign:'center',fontSize:'14px',fontWeight:'bold',color:'#fff',outline:'none'}} readOnly/>
            <p style={{left:'-20px',marginRight:'-60px'}}>By</p> :
            <input type="text" name="TYPE" placeholder="Name" value={booking.dispatch_logs[0]?.busNo || date} required style={{width:'100px',height:'10px',border:'none',borderRadius:'5px', backgroundColor: getBgColor(booking.status),textAlign:'center',fontSize:'14px',fontWeight:'bold',color:'#fff',outline:'none',left:'-40px'}} readOnly/>

        </div>

          <div className="details" style={{ gap: '100px', position: 'relative', top: '30px' }}>
            <div className='form-section2' style={{ left: '50px', rowGap: '10px' }}>
              <h3>Sender detail :</h3>
              <input value={booking.senderName} readOnly />
              <input value={booking.senderPhone} readOnly />
              <input value={booking.senderGST} readOnly /><br />
              <textarea value={booking.senderAddress} readOnly />
            </div>

            <div className='form-section2'>
              <h3>Receiver detail :</h3>
              <input value={booking.receiverName} readOnly />
              <input value={booking.receiverPhone} readOnly />
              <input value={booking.receiverGST} readOnly /><br />
              <textarea value={booking.receiverAddress} readOnly />
            </div>
          </div>

          {booking.parcels && booking.parcels.map((parcel, idx) => (<div className='form-section3' key={idx} style={{ left: '50px', top: '30px', position: 'relative' }}>
            <h3 style={{ position: 'relative', left: '-5px', top: '-10px' }}>Parcel detail :</h3>
           
              
                <input value={parcel.articleType} readOnly />
                <input value={parcel.noOfParcels} readOnly />
                <input value={parcel.parcelType} readOnly />
                <input value={parcel.content} readOnly />
                <input value={`₹${parcel.amtPerBox}`} readOnly />
                </div>
            ))}
          

          <div className='form-section4'>
            <h3>Total :</h3>
            <input value={booking.goodvalue + ' (value)'} readOnly  />
            <input value={booking.totalWeight + ' kg'} readOnly />
            <input value={`₹${booking.parcels[0].total}`} readOnly />
          </div>

          <div className="action-buttons">
  <button className="print-btn" onClick={printLrCopy}>Print LR</button>

  {booking?.status === 'Booked' && (
    <button className="cancel-btn" onClick={() => updateStatus(booking.id, 'Cancelled')}>Cancel</button>
  )}

  {booking?.status === 'Dispatched' && (
    <button className="delivered-btn" onClick={() => updateStatus(booking.id, 'Delivered')}>Delivered</button>
  )}
</div>

        </>
      )}
    </div>
  );
};

export default SingleBookingSearch;
