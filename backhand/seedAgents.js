const bcrypt = require('bcryptjs');
const pool = require('./db');

const insertAgents = async () => {
  try {
    const agents = [
      { name: 'Agent One', email: 'agent1@example.com', branch: 'Mumbai', password: 'password123', phone: '9999911111' },
      { name: 'Agent Two', email: 'agent2@example.com', branch: 'Pune', password: 'password123', phone: '9999922222' },
      { name: 'Agent Three', email: 'agent3@example.com', branch: 'Jaipur', password: 'password123', phone: '9999933333' },
      { name: 'Agent Four', email: 'agent4@example.com', branch: 'Indore', password: 'password123', phone: '9999944444' },
      { name: 'Agent Five', email: 'agent5@example.com', branch: 'Nashik', password: 'password123', phone: '9999955555' },
    ];

    for (const agent of agents) {
      const hashedPassword = await bcrypt.hash(agent.password, 10);

      await pool.query(
        'INSERT INTO agents (name, branch, phone, password, status) VALUES (?, ?, ?, ?, ?)',
        [agent.name, agent.branch, agent.phone, hashedPassword, 'active']
      );

      console.log(`✅ Inserted: ${agent.name}`);
    }

    console.log('✅ All agents inserted successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error inserting agents:', err);
    process.exit(1);
  }
};

insertAgents();
