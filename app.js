/**
 * app.js
 * 
 * Express application setup
 * Handles:
 * - Middleware configuration
 * - Routes setup
 * - Error handling
 */

const express = require('express');
const path = require('path');

const categoriesRouter = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const dashboardRouter = require('./routes/dashboard');
const reportsRouter = require('./routes/reports');
const weeklyJob = require('./jobs/weeklyReport');
const metrics = require('./utils/metrics');

const app = express();

// ==================== MIDDLEWARE ====================

// Parse JSON request bodies
app.use(express.json());

// Serve static files dari public folder
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ROUTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API route mounting
app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);

// Prometheus metrics endpoint
app.get('/metrics', metrics.metricsMiddleware);

// Schedule weekly job (runs in-process)
weeklyJob.scheduleWeekly();

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// ==================== ERROR HANDLING ====================

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
