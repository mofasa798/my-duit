// Database configuration
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
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

// Promisify SQLite methods
const getAsync = promisify(db.get.bind(db));
const allAsync = promisify(db.all.bind(db));

const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

module.exports = {
  db,
  getAsync,
  allAsync,
  runAsync,
};
