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

const db = require('./config/database');
const categoriesRouter = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const dashboardRouter = require('./routes/dashboard');
const reportsRouter = require('./routes/reports');
const exportRouter = require('./routes/export');
const weeklyJob = require('./jobs/weeklyReport');
const monthlyJob = require('./jobs/monthlyReport');
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

// Job health endpoint - reports last run info
app.get('/api/health/job', async (req, res, next) => {
  try {
    const lastAudit = await db.getAsync(`SELECT action, details, created_at FROM report_audit ORDER BY created_at DESC LIMIT 1`);
    const lastReport = await db.getAsync(`SELECT id, report_type, period_start, period_end, generated_at FROM reports ORDER BY generated_at DESC LIMIT 1`);
    res.json({ success: true, lastAudit, lastReport });
  } catch (err) {
    next(err);
  }
});

// API route mounting
app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/export', exportRouter);

// Prometheus metrics endpoint
app.get('/metrics', metrics.metricsMiddleware);

// Schedule jobs (runs in-process)
if (process.env.NODE_ENV !== 'test') {
  weeklyJob.scheduleWeekly();
  monthlyJob.scheduleMonthly();
}

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
