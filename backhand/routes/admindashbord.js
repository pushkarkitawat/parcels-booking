// routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET summary for dashboard
router.get('/summary', async (req, res) => {
  try {
    const [
      [todayShipments],
      [activeAgents],
      [totalShipments],
      [pendingDeliveries],
      [inTransit],
      [deliveredToday]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM shipments WHERE DATE(date) = CURDATE()'),
      pool.query('SELECT COUNT(*) AS count FROM agents WHERE status = "active"'),
      pool.query('SELECT COUNT(*) AS count FROM shipments'),
      pool.query('SELECT COUNT(*) AS count FROM shipments WHERE status = "pending"'),
      pool.query('SELECT COUNT(*) AS count FROM shipments WHERE status = "in_transit"'),
      pool.query('SELECT COUNT(*) AS count FROM shipments WHERE status = "delivered" AND DATE(date) = CURDATE()')
    ]);

    res.json({
      todayShipments: todayShipments[0].count,
      activeAgents: activeAgents[0].count,
      totalShipments: totalShipments[0].count,
      pendingDeliveries: pendingDeliveries[0].count,
      inTransit: inTransit[0].count,
      deliveredToday: deliveredToday[0].count
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
