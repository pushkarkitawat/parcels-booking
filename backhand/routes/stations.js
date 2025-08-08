const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/stations', async (req, res) => {
    try {
      const {
        branchName,
        branchCode,
        ownerName,
        address,
        mobiles, // array or single string
        type
      } = req.body;
      console.log('Incoming body:', req.body);

  
      const mobileString = Array.isArray(mobiles) ? mobiles.join(',') : mobiles;
  
      await pool.query(
        `INSERT INTO branches (name, code, ownerName, address, mobile, type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [branchName, branchCode, ownerName, address, mobileString, type]
      );
  
      res.status(200).json({ message: 'Station saved successfully' });
    } catch (err) {
      console.error('Error inserting station:', err);
      res.status(500).json({ message: 'Failed to save station' });
    }
  });
  
router.get('/all', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT name AS branchName, code AS branchCode, ownerName, address, mobile, type, status FROM branches');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching stations:', err);
      res.status(500).json({ message: 'Failed to fetch stations' });
    }
  });
  

module.exports = router;
