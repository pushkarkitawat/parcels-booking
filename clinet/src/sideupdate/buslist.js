import React, { useEffect, useState } from 'react';
import './StationList.css'; // ✅ Make sure it includes styles for `.status-select`
import { BackButton } from './component/back';

const BusList = () => {
  const [busList, setBusList] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/buses`);
        const data = await res.json();
        setBusList(data);
        setFilteredBuses(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch bus data:', error);
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  useEffect(() => {
    const filtered = busList.filter((bus) => {
      const query = searchQuery.toLowerCase();
      return (
        bus.bus_name.toLowerCase().includes(query) ||
        bus.bus_number.toLowerCase().includes(query)
      );
    });
    setFilteredBuses(filtered);
  }, []);

  const handleStatusChange = async (busId, newStatus) => {
    const selectedBus = busList.find((bus) => bus.id === busId);
  
    // Prevent change from Inactive to Active
    if (selectedBus?.status === 'Inactive' && newStatus === 'Active') {
      alert('Once deactivated, the bus cannot be reactivated.');
      return;
    }
  
    const confirmed = window.confirm(`Are you sure you want to change the status of Bus ID ${busId} to ${newStatus}?`);
    if (!confirmed) return;
  
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/buses/${busId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (res.ok) {
        setBusList((prev) =>
          prev.map((bus) => (bus.id === busId ? { ...bus, status: newStatus } : bus))
        );
        setFilteredBuses((prev) =>
          prev.map((bus) => (bus.id === busId ? { ...bus, status: newStatus } : bus))
        );
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating bus status:', error);
    }
  };
  
  
  if (loading) return <p>Loading buses...</p>;

  return (
    <div className="station-container">
      <div className="station-header">
        <BackButton />
      </div>
      <h2 className="stationheading">Bus Detail List</h2>

      <div className="station-header">
        <input
          type="text"
          placeholder="Search by Bus Name or Number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="station-search-input"
          style={{ justifySelf: 'left', position: 'relative', marginRight: '30px' }}
        />
      </div>

      {filteredBuses.length === 0 ? (
        <p>No matching buses found.</p>
      ) : (
        <table className="station-table">
          <thead>
            <tr>
              <th className="station-th">Bus Name</th>
              <th className="station-th">Bus No</th>
              <th className="station-th">Driver Name</th>
              <th className="station-th">Driver No</th>
              <th className="station-th">Owner Name</th>
              <th className="station-th">Owner No</th>
              <th className="station-th">Route</th>
              <th className="station-th">Current Status</th>
              <th className="station-th">Change Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuses.map((bus) => (
              <tr key={bus.id}>
                <td className="station-td">{bus.bus_name.toUpperCase()}</td>
                <td className="station-td">{bus.bus_number}</td>
                <td className="station-td">{bus.driver_name.toUpperCase()}</td>
                <td className="station-td">{bus.driver_number}</td>
                <td className="station-td">{bus.owner_name.toUpperCase()}</td>
                <td className="station-td">{bus.owner_number}</td>
                <td className="station-td">{bus.route.toUpperCase()}</td>
                <td className="station-td">
                  <span className={`status-badge ${bus.status.toLowerCase()}`}>
                    {bus.status}
                  </span>
                </td>
                <td className="station-td">
  <select
    value={bus.status}
    onChange={(e) => handleStatusChange(bus.id, e.target.value)}
    className={`status-select ${bus.status.toLowerCase()}`}
    disabled={bus.status === 'Inactive'} // optional: disable entire dropdown
  >
    {/* Only allow transition to Inactive if not already Inactive */}
    <option value="Active" disabled={bus.status === 'Inactive'}>
      Active
    </option>
    <option value="Inactive">Inactive</option>
  </select>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};


export default BusList;
