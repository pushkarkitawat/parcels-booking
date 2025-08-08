const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db'); // your MySQL or Postgres DB connection
const verifyAgent = require('./verifyAgent');

// POST /api/auth/reset-password/:token
router.post('/reset-password',verifyAgent ,async (req, res) => {
  
  const { password } = req.body;
  const name = req.agent.name;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
   
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update in DB
    const [result] = await pool.query(
      'UPDATE agents SET password = ? WHERE name = ?',
      [hashedPassword, name]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or token invalid.' });
    }

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset error:', err.message);
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
});

module.exports = router;
