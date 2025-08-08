const express = require('express');
const router = express.Router();
const pool = require('../db'); // your MySQL connection pool

// GET all agents
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agents ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching agents' });
  }
});

// POST new agent
router.post('/add', async (req, res) => {
  const { name, branch, phone } = req.body;

  if (!name || !branch || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await pool.query(
      'INSERT INTO agents (name, branch, phone) VALUES (?, ?, ?)',
      [name, branch, phone]
    );
    res.json({ message: 'Agent added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding agent' });
  }
});

// PUT update agent status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    await pool.query('UPDATE agents SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status' });
  }
});

module.exports = router;
