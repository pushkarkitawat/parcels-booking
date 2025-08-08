// server.js
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const adminRoutes = require('./routes/admindashbord');
const agentsRouter = require('./routes/agents'); //
const stationsRouter = require('./routes/stations'); 
const bookingsRouter = require('./routes/bookings');
const busRoutes = require('./routes/busroute');
const loginroute = require('./routes/login');
const resetroute = require('./routes/reset');
// Middleware
app.use(cors());
app.use(express.json());
const morgan = require('morgan');
app.use(morgan('tiny'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
const helmet = require('helmet');
app.use(helmet());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/agents', agentsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/buses', busRoutes);
app.use('/api', stationsRouter);
app.use('/api/password',resetroute);
app.use('/',loginroute); // 👈
// Root route
app.get('/', (req, res) => {
  res.send('Transport Admin Backend Running 🚚');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
