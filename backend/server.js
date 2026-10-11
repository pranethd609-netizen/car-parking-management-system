const express = require('express');
const cors = require('cors');
const path = require('path');

const slotsRoutes = require('./routes/slots');
const ticketsRoutes = require('./routes/tickets');
const tariffsRoutes = require('./routes/tariffs');
const statsRoutes = require('./routes/stats');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/slots', slotsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/tariffs', tariffsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Car Parking Management System API',
    version: '1.1.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// Fallback to frontend index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚗 ParkFlow Pro - Car Parking Management System v1.1.0`);
    console.log(`📡 Backend API Server running at http://localhost:${PORT}`);
    console.log(`🖥️ Frontend Web App accessible at http://localhost:${PORT}`);
    console.log('====================================================');
  });
}

module.exports = app;
