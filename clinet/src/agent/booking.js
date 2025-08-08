import React, { useState, useEffect } from 'react';
import './booking.css';
import OptionNavbar from '../component/option';
import LogoutButton from '../component/logout';

const Booking = () => {
  const [form, setForm] = useState({
    type:'',
    fromStation: 'MUMBAI',
    toStation: '',
    senderName: '',
    senderPhone: '',
    senderGST: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverGST: '',
    receiverAddress: '',
    articleType: '',
    noOfParcels: '',
    parcelType: '',
    content: '',
    amtPerBox: '',
    totalWeight: '',
    Goodvalue: '2000',
  });
  const [status, setStatus] = useState(''); // default value
 
  
  // Define background color based on status
  const getBgColor = (value) => {
    switch (value?.toLowerCase()) {
      case 'paid':
        return 'rgb(9, 134, 55)'; // green-ish
      case 'topay':
        return 'rgb(237, 61, 41)'; // red-ish
      case 'foc':
        return '#3b82f6'; // blue-ish
      default :
        return '#f2f2f2'; // default gray
    }
  };
  // From Station dropdown states
  const [fromInput, setFromInput] = useState('');
  // const [filteredFromStations, setFilteredFromStations] = useState([]);
  // const [showFromDropdown, setShowFromDropdown] = useState(false);
  // const handleFromInputChange = (e) => {
  //   const value = e.target.value;
  //   setFromInput(value);
  //   setForm(prev => ({ ...prev, fromStation: value}));

  //   if (value.trim() === '') {
  //     // setFilteredFromStations([]);
  //     // setShowFromDropdown(false);
  //     return;
  //   }

    // const filtered = stationList.filter(st =>
    //   st.branchName.toLowerCase().includes(value.toLowerCase())
    // );
    // setFilteredFromStations(filtered);
    // setShowFromDropdown(true);
  // };

  // const handleSelectFromStation = (station) => {
  //   setFromInput(station.branchName);
  //   setForm(prev => ({ ...prev, fromStation: station.branchName }));
  //   setShowFromDropdown(false);
  // };

  // To Station dropdown states
  const [toInput, setToInput] = useState('');
  const [filteredToStations, setFilteredToStations] = useState([]);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const handleToInputChange = (e) => {
    const value = e.target.value;
    setToInput(value);
    setForm(prev => ({ ...prev, toStation: value }));

    if (value.trim() === '') {
      setFilteredToStations([]);
      setShowToDropdown(false);
      return;
    }

    const filtered = stationList.filter(st =>
      st.branchName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredToStations(filtered);
    setShowToDropdown(true);
  };

  const handleSelectToStation = (station) => {
    setToInput(station.branchName);
    setForm(prev => ({ ...prev, toStation: station.branchName }));
    setShowToDropdown(false);
  };

  const [parcels, setParcels] = useState([]);
  const [totalAmt, setTotalAmt] = useState(0);
  const [stationList, setStationList] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/all`);
        const data = await res.json();
        setStationList(data);
      } catch (err) {
        console.error('Failed to fetch stations:', err);
      }
    };
    fetchStations();
  }, []);
  useEffect(() => {
    const total = parcels.reduce((sum, p) => sum + p.total, 0);
    setTotalAmt(total);
  }, [parcels]);

  const handleDeleteParcel = (indexToDelete) => {
    setParcels(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
   
    setForm(prev => ({ ...prev, [name]: value }));
   
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status ){
      alert('Please select booking type');
    }
  
    const bookingData = {
      ...form,
      parcels,
      totalAmt,
    };
    const token = localStorage.getItem('agentToken');
   
  
    try {
      const res = await fetch( `${process.env.REACT_APP_API_URL}/api/bookings/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // ← Send token
        },
        body: JSON.stringify(bookingData)
      });
  
      if (!res.ok) {
        const errorText = await res.text(); // fallback for error text
        throw new Error(errorText || 'Booking failed');
      }
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'booking-receipt.pdf';
      a.click();
  
      alert(`Booking submitted!\nTotal Amount: ₹${totalAmt}`);
  
      // Reset form
      setForm({
        fromStation: 'MUMBAI',
        toStation: '',
        senderName: '',
        senderPhone: '',
        senderGST: '',
        senderAddress: '',
        receiverName: '',
        receiverPhone: '',
        receiverGST: '',
        receiverAddress: '',
        articleType: '',
        noOfParcels: '',
        parcelType: '',
        content: '',
        amtPerBox: '',
        totalWeight: '',
        Goodvalue: '2000',
       
      });
      setParcels([]);
      setFromInput('');
      setToInput('');
      
    } catch (err) {
      console.error('Submit Error:', err);
      alert(`Booking failed: ${err.message}`);
    }
  };
  const handleStatusSelect = (status) => {
    
    setStatus(status);
    
    setForm((prevForm) => ({
      ...prevForm,
      type:status,
    }));

  };
  

  return (
    <div className="booking-container">
      <div className='logout'>
      <LogoutButton /></div>
      <h2 className="booking-heading" style={{borderLeftColor:getBgColor(form.type)}}>
  Welcome To Shree Sathguru Tours And Travels<span className="arrow-icon" style={{color:getBgColor(form.type)}}>➤</span>
</h2>

      <OptionNavbar onStatusSelect={handleStatusSelect}/> 

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-section1">
          <h3>Station Details :</h3>

          <input
            type="text"
            name="fromStation"
            value={form.fromStation}
           
            readOnly
            onFocus={() => {
              // setShowFromDropdown(true)
              if (fromInput) {
              setShowToDropdown(false)};
            }}
          />
          {/* {showFromDropdown && filteredFromStations.length > 0 && (
            <ul className="dropdown-list">
              {filteredFromStations.map((station, idx) => (
                <li key={idx} onClick={() => handleSelectFromStation(station)}>
                  {station.branchName}
                </li>
              ))}
            </ul>
          )} */}
            <p>TO</p>
          <input
            type="text"
            name="toStation"
            placeholder="To"
            value={toInput}
            onChange={handleToInputChange}
            autoComplete="off"
            onFocus={() => {
              if (toInput) {setShowToDropdown(true);
              // setShowFromDropdown(false)
            };
            }}
          />
          {showToDropdown && filteredToStations.length > 0 && (
            <ul className="dropdown-list2">
              {filteredToStations.map((station, idx) => (
                <li key={idx} onClick={() => handleSelectToStation(station)}>
                  {station.branchName}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-section1" style={{width:'150px',border:'none',borderRadius:'5px',backgroundColor:'transparent',boxShadow:'none',textAlign:'center',fontSize:'16px',fontWeight:'bold',color:'#333',outline:'none',left:'640px',top:'210px',position:'absolute'}}>
          <h3>Type :</h3>
          <input type="text" name="TYPE"  value={status} readOnly required style={{width:'100px',height:'10px',border:'none',borderRadius:'5px', backgroundColor: getBgColor(form.type),textAlign:'center',fontSize:'14px',fontWeight:'bold',color:'#fff',outline:'none'}}/>

        </div>

        <div className='details'>
          <div className="form-section2">
            <h3>Sender Details :</h3>
            <input type="text" name="senderName" placeholder="Name"  onKeyPress={(e) => {
    if (!/[a-zA-Z\s]/.test(e.key)) {
      e.preventDefault();
    }
  }} value={form.senderName} onChange={handleChange} required />
            <input type="text" name="senderPhone" placeholder="Phone" value={form.senderPhone} maxLength={10} onKeyPress={(e) => {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
}} onChange={handleChange} required />
            <input type="text" name="senderGST" maxLength={15} onKeyPress={(e) => {
  if (!/[0-9A-Z]/.test(e.key)) {
    e.preventDefault();
  }
}}placeholder="GST" value={form.senderGST} onChange={handleChange} /><br />
            <textarea name="senderAddress" placeholder="Address" value={form.senderAddress} onChange={handleChange} required />
          </div>

          <div className="form-section2">
            <h3>Receiver Details :</h3>
            <input type="text" name="receiverName"  onKeyPress={(e) => {
    if (!/[a-zA-Z\s]/.test(e.key)) {
      e.preventDefault();
    }
  }} placeholder="Name" value={form.receiverName} onChange={handleChange} required />
            <input type="text" name="receiverPhone" placeholder="Phone" maxLength={10} onKeyPress={(e) => {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
}} value={form.receiverPhone} onChange={handleChange} required />
            <input type="text" name="receiverGST"  maxLength={15} onKeyPress={(e) => {
  if (!/[0-9A-Z]/.test(e.key)) {
    e.preventDefault();
  }
}} placeholder="GST" value={form.receiverGST} onChange={handleChange} /><br />
            <textarea name="receiverAddress" placeholder="Address" value={form.receiverAddress} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-section3">
          <h3>Parcel Details :</h3>
          <select name="articleType" value={form.articleType} onChange={handleChange} >
            <option value="">Type</option>
            <option value="Article">Article</option>
            <option value="Weight">Weight</option>
          </select>
          <input type="number" name="noOfParcels" placeholder="No. of Parcels" value={form.noOfParcels} onChange={handleChange} />
          <select name="parcelType" value={form.parcelType} onChange={handleChange} >
            <option value="">Type</option>
            <option value="box">Box</option>
            <option value="catta">Catta</option>
            <option value="open">Open</option>
            <option value="two-wheeler">Two-Wheeler</option>
          </select>
          <input type="text" name="content" placeholder="Content" value={form.content} onChange={handleChange}  />
          <input type="number" name="amtPerBox" placeholder="AMT" value={form.amtPerBox} onChange={handleChange}  />
          <button
            type="button"
            onClick={() => {
              const { articleType, noOfParcels, parcelType, content, amtPerBox } = form;
              if (!articleType || ( !noOfParcels && noOfParcels === 0) || !parcelType || !content || !amtPerBox) {
                alert("Please fill all parcel fields before adding.");
                return;
              }

              const newParcel = {
                articleType,
                noOfParcels,
                parcelType,
                content,
                amtPerBox: parseFloat(amtPerBox),
                total: parseFloat(amtPerBox) * parseInt(noOfParcels)
              };
              setParcels(prev => [...prev, newParcel]);
              setForm(prev => ({
                ...prev,
                articleType: '',
                noOfParcels: '',
                parcelType: '',
                content: '',
                amtPerBox: ''
              }));
            }}
            disabled={parcels.length >= 5}
          >
            ADD
          </button>
        </div>

        <div className="form-section5">
          {parcels.length > 0 && (
            <div className="parcel-list">
              <table className="parcel-table">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>No. of Parcels</th>
                    <th>Parcel Type</th>
                    <th>Content</th>
                    <th>Amount/Box</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.map((p, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{p.noOfParcels}</td>
                      <td>{p.parcelType}</td>
                      <td>{p.content}</td>
                      <td>₹{p.amtPerBox}</td>
                      <td>₹{p.total}</td>
                      <td>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDeleteParcel(index)}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className='form-section4'>
          <h3>Total :</h3>
          
          <input type="number" name="Goodvalue" placeholder="Good value" value={form.Goodvalue}  readOnly />
          <input type="number" name="totalWeight" placeholder="Total Weight (kg)" value={form.totalWeight} onChange={handleChange} required />
          <input type="number" name="totalAmt" placeholder="Total Amount" value={totalAmt} readOnly />
        </div>

        <div className="form-footer">
          <button type="submit">SUBMIT</button>
        </div>
      </form>
    </div>
  );
};

export default Booking;
