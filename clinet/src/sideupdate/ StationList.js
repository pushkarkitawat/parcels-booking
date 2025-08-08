import React, { useState, useEffect } from 'react';
import './StationList.css';
import { BackButton } from './component/back';
import axios from 'axios';

const StationList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [station, setStation] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/all`);
        setStation(res.data); // assuming backend sends array of branches
      } catch (err) {
        console.error('Failed to fetch stations:', err);
      }
    };

    fetchStations();
  }, []);

  const filteredStations = station.filter(station =>
    station.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="station-container">
      <div className="station-header">
        <BackButton />
      </div>
      <h2 className="stationheading">Station List</h2>

      <input
        type="text"
        placeholder="Search by branch name"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="station-search-input"
      />

      {filteredStations.length === 0 ? (
        <p>No stations found.</p>
      ) : (
        <table className="station-table">
          <thead>
            <tr>
              <th className="station-th">Branch Name</th>
              <th className="station-th">Owner Name</th>
              <th className="station-th">Address</th>
              <th className="station-th">Mobile No</th>
              <th className="station-th">Type</th>
              <th className="station-th">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStations.map((station, index) => (
              <tr key={index}>
                <td className="station-td">{station.branchName}</td>
                <td className="station-td">{station.ownerName}</td>
                <td className="station-td">{station.address}</td>
                <td className="station-td">
  {station.mobile?.split(',').map((num, i) => (
    <span key={i} className="mobile-badge">{num.trim()}</span>
  ))}
</td>
                <td className="station-td">{station.type}</td>
                <td className="station-td">
                  <span className={station.status === 'active' ? 'status-badge active' : 'status-badge inactive'}>
                    {station.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StationList;
