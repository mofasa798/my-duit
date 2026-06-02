# Database configuration
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './finance.db';

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
  }
});

// Enable foreign keys (important untuk FOREIGN KEY constraints)
db.run('PRAGMA foreign_keys = ON');

module.exports = db;
