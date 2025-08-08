// routes/busRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Add new bus
router.post('/', async (req, res) => {
  const {
    busName,
    busNumber,
    driverName,
    driverNumber,
    ownerName,
    ownerNumber,
    route,
    status,
  } = req.body;

  try {
    const sql = `
      INSERT INTO buses 
      (bus_name, bus_number, driver_name, driver_number, owner_name, owner_number, route, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      busName,
      busNumber,
      driverName,
      driverNumber,
      ownerName,
      ownerNumber,
      route,
      status,
    ];

    await pool.query(sql, values);
    res.status(201).json({ message: 'Bus details added successfully' });
  } catch (err) {
    console.error('Insert failed:', err);
    res.status(500).json({ message: 'Error saving bus details' });
  }
});
// GET /api/buses - Fetch all bus details
router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM buses ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching buses:', err);
      res.status(500).json({ message: 'Failed to fetch bus data' });
    }
  });
  // Update bus status
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      await pool.query('UPDATE buses SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
      console.error('Error updating bus status:', error);
      res.status(500).json({ message: 'Failed to update status' });
    }
  });
  
module.exports = router;
