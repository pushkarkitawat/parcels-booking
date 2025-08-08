// db.js
const mysql = require('mysql2/promise');

// Create MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,     // your MySQL host
  user: process.env.DB_USER || 'root',          // your MySQL user
  password: process.env.DB_PASS || 'pushkar1242', // your MySQL password
  database: process.env.DB_NAME || 'TRANS', // your DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
