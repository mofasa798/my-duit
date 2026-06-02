/**
 * server.js
 * 
 * Entry point untuk aplikasi Express
 * Handles:
 * - Load environment variables
 * - Start Express server
 * - Error handling untuk startup
 */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  📊 Personal Finance Dashboard        ║
║  Server running on port ${PORT}        ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;
