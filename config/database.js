// Database configuration
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || './finance.db';

// Check if database file exists before creating connection
const isNewDb = !fs.existsSync(DB_PATH);

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);

    // Auto-initialize if new database
    if (isNewDb) {
      console.log(
        'Database file not found. Auto-initializing tables and default categories...'
      );
      db.serialize(() => {
        const sql = `
          CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            amount DECIMAL(10, 2) NOT NULL CHECK(amount > 0),
            description TEXT,
            transaction_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
          );

          CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_type TEXT NOT NULL CHECK(report_type IN ('weekly', 'monthly')),
            period_start DATE NOT NULL,
            period_end DATE NOT NULL,
            total_income DECIMAL(10, 2),
            total_expense DECIMAL(10, 2),
            net_savings DECIMAL(10, 2),
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS report_audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id INTEGER,
            action TEXT NOT NULL,
            period_start DATE,
            period_end DATE,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL
          );

          CREATE TABLE IF NOT EXISTS locks (
            name TEXT PRIMARY KEY,
            owner TEXT,
            expires_at TIMESTAMP
          );
        `;

        db.exec(sql, (err) => {
          if (err) {
            console.error('Error creating tables:', err);
            return;
          }
          console.log(
            '✓ Created tables (categories, transactions, reports, report_audit, locks)'
          );

          const categories = [
            { name: 'Food', type: 'expense' },
            { name: 'Transport', type: 'expense' },
            { name: 'Shopping', type: 'expense' },
            { name: 'Salary', type: 'income' },
            { name: 'Investment', type: 'income' },
            { name: 'Others', type: 'expense' },
          ];

          categories.forEach((cat) => {
            db.run(
              `INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)`,
              [cat.name, cat.type]
            );
          });
          console.log('✓ Seeded default categories');
        });
      });
    }
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
