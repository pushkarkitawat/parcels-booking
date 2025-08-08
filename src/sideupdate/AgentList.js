// pages/AgentList.js
import React, { useEffect, useState } from 'react';
import './AgentList.css';
import 'tailwindcss';
import {BackButton} from './component/back';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchBranch, setSearchBranch] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data);
      setFilteredAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  const handleSearch = () => {
    const filtered = agents.filter((agent) =>
      agent.name.toLowerCase().includes(searchName.toLowerCase()) &&
      agent.branch.toLowerCase().includes(searchBranch.toLowerCase())
    );
    setFilteredAgents(filtered);
  };

  const toggleStatus = async (agentId, currentStatus) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus === 'active' ? 'inactive' : 'active' }),
      });

      if (res.ok) {
        fetchAgents(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="agent-list-container">
       <BackButton/>
      <h2>Agent List</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by agent name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by branch name"
          value={searchBranch}
          onChange={(e) => setSearchBranch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <table className="agent-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Agent Name</th>
            <th>Branch</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent, index) => (
              <tr key={agent.id}>
                <td>{index + 1}</td>
                <td>{agent.name}</td>
                <td>{agent.branch}</td>
                <td>{agent.phone}</td>
                <td>
                  <span
                    style={{
                      color: agent.status === 'active' ? 'green' : 'gray',
                      fontWeight: 'bold',
                    }}
                  >
                    {agent.status}
                  </span>
                </td>
                <td>
                  <button
                    className="status-btn"
                    onClick={() => toggleStatus(agent.id, agent.status)}
                  >
                    {agent.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No agents found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AgentList;
