const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Starting server...');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/booking', require('./routes/booking'));
app.use('/api/resources', require('./routes/resources'));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'IIIT Allahabad Booking System API',
    status: 'Server is running successfully!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth (login, register)',
      resources: '/api/resources (classrooms, playgrounds)',
      booking: '/api/booking (create, view bookings)'
    }
  });
});

const PORT = process.env.PORT || 5001;

// Start server first
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err.message));
} else {
  console.log('⚠️  MongoDB URI not found in .env file');
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});