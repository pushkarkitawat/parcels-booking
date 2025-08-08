const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyAgent = require('./verifyAgent');


router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
      const [rows] = await pool.query('SELECT * FROM agents WHERE  name = ?', [name]);
      if (rows.length === 0) return res.status(401).json({ message: 'User not found' });
  
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: 'Incorrect password' });
  
      const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '15min' });
      res.json({ token, user });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  router.post('/verify', verifyAgent, async (req, res) => {
    try {
      const agentId = req.agent.id; // set by verifyAgent middleware
  
      await pool.query('UPDATE agents SET token = NULL, status = ? WHERE id = ?', ['inactive', agentId]);
  
      res.status(200).send('Agent logged out and token invalidated');
    } catch (err) {
      console.error(err);
      res.status(403).send('Invalid or expired token');
    }
  });
  
   module.exports = router;