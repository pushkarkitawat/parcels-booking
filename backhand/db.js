// db.js
const mysql = require('mysql2/promise');

// Create MySQL pool
const pool = mysql.createPool({
  host: 'localhost',     // your MySQL host
  user: 'root',          // your MySQL user
  password: 'pushkar1242', // your MySQL password
  database: 'TRANS', // your DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
