const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const movieRoutes = require('./routes/movieRoutes');
const cinemaRoutes = require('./routes/cinemaRoutes');
const showRoutes = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  // CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Global rate limiter for booking endpoint
  const bookingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: { success: false, message: 'Too many requests. Please try again shortly.' }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'CineBook API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  });

  // API Routes
  app.use('/api/movies', movieRoutes);
  app.use('/api/cinemas', cinemaRoutes);
  app.use('/api/shows', showRoutes);
  app.use('/api/bookings', bookingLimiter, bookingRoutes);
  app.use('/api/auth', authRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
