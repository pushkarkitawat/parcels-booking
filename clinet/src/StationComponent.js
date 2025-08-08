import React, { useState } from 'react';
import './StationComponent.css';
import { BackButton } from './component/back';
import axios from 'axios';

const StationComponent = () => {
  const [station, setStation] = useState({
    branchName: '',
    branchCode: '',
    ownerName: '',
    address: '',
    mobiles: [''],
    type: 'Both',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStation(prev => ({ ...prev, [name]: value }));
  };

  const handleMobileChange = (index, value) => {
    const newMobiles = [...station.mobiles];
    newMobiles[index] = value;
    setStation(prev => ({ ...prev, mobiles: newMobiles }));
  };

  const addMobileField = () => {
    setStation(prev => ({ ...prev, mobiles: [...prev.mobiles, ''] }));
  };

  const removeMobileField = (index) => {
    const newMobiles = station.mobiles.filter((_, i) => i !== index);
    setStation(prev => ({ ...prev, mobiles: newMobiles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/stations`, station);
      alert('Station added successfully!');
      setStation({
        branchName: '',
        branchCode: '',
        ownerName: '',
        address: '',
        mobiles: [''],
        type: 'Both',
      });
    } catch (err) {
      alert('Failed to add station');
      console.error(err);
    }
  };

  return (
    <div className="station-form-container">
      <BackButton />
      <h2>Add Station</h2>
      <form onSubmit={handleSubmit} className="station-form">
        <label>
          Branch Name:
          <input
            type="text"
            name="branchName"
            placeholder="Branch Name"
            value={station.branchName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Branch Code:
          <input
            type="text"
            name="branchCode"
            placeholder="e.g. MRD"
            value={station.branchCode}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Owner Name:
          <input
            type="text"
            name="ownerName"
            value={station.ownerName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Address:
          <textarea
            name="address"
            value={station.address}
            maxLength={100}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Mobile Numbers:
          {station.mobiles.map((mobile, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => handleMobileChange(index, e.target.value)}
                required
              />
              {station.mobiles.length > 1 && (
                <button type="button" onClick={() => removeMobileField(index)} style={{ background: 'red', color: 'white' }}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addMobileField}>Add Mobile</button>
        </label>

        <label>
          Type of Branch:
          <select name="type" value={station.type} onChange={handleChange}>
            <option value="Delivery">Delivery</option>
            <option value="Booking">Booking</option>
            <option value="Both">Both</option>
          </select>
        </label>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default StationComponent;
