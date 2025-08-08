import React, { useState } from 'react';
import './Addbus.css';
import { BackButton } from './component/back';

const AddBusDetail = () => {
  const initialData = {
    busName: '',
    busNumber: '',
    driverName: '',
    driverNumber: '',
    ownerName: '',
    ownerNumber: '',
    route: '',
    status: 'Active',
  };

  const [busData, setBusData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const patterns = {
      busName: /^[A-Za-z\s]+$/,
      driverName: /^[A-Za-z\s]+$/,
      ownerName: /^[A-Za-z\s]+$/,
      busNumber: /^[A-Z]{2}\d{2}\s?[A-Z]{1,2}\s?\d{1,4}$/,
      driverNumber: /^[6-9]\d{9}$/,
      ownerNumber: /^[6-9]\d{9}$/,
      route: /^[A-Z]{3,}-[A-Z]{3,}$/

    };

    if (!value.trim() && value !== '' ){ return `${name} is required`} else if (value === ''){
      return ''
   
    };

    if (patterns[name] && !patterns[name].test(value)) {
      return `Invalid ${name} format`;
    }else if(value === ''){
      return ''
    }

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusData({ ...busData, [name]: value });

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    for (let key in busData) {
      const error = validateField(key, busData[key]);
      if (error) newErrors[key] = error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fix the errors before submitting.');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/buses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busData),
      });

      if (res.ok) {
        setBusData(initialData);
        setErrors({});
        alert('Bus details submitted successfully!');
      } else {
        alert('Submission failed.');
      }
    } catch (error) {
      console.error('Error submitting bus details:', error);
      alert('Error submitting details.');
    }
  };

  return (
    <div className="add-bus-container">
      <div className="back">
        <BackButton />
      </div>

      <h2>Add Bus Details</h2>
      <form onSubmit={handleSubmit} className="bus-form">
        {[
          { name: 'busName', placeholder: 'Bus Name' },
          { name: 'busNumber', placeholder: 'Bus Number' },
          { name: 'driverName', placeholder: 'Driver Name' },
          { name: 'driverNumber', placeholder: 'Driver Number', type: 'tel', },
          { name: 'ownerName', placeholder: 'Owner Name' },
          { name: 'ownerNumber', placeholder: 'Owner Number', type: 'tel' },
          { name: 'route',  placeholder:'ROUTE (e.g. MUMBAI-JAIPUR)' },
        ].map(({ name, placeholder, type = 'text' }) => (
          <div key={name}>
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              value={busData[name]}
              onChange={handleChange}
              maxLength={name === 'driverNumber' || name === 'ownerNumber' ? 10 : undefined}
              required
            />
            {errors[name] && <p className="error">{errors[name]}</p>}
          </div>
        ))}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddBusDetail;
