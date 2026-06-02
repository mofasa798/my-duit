/**
 * migrations/init.js
 * 
 * Initialize database schema
 * 
 * Membuat tabel-tabel:
 * 1. categories - kategori transaksi
 * 2. transactions - data transaksi
 * 3. reports - laporan yang di-generate
 * 
 * Jalankan dengan: npm run init:db
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './finance.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  } else {
    console.log('Connected to database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// ==================== CREATE TABLES ====================

const createTables = () => {
  return new Promise((resolve, reject) => {
    
    // Table 1: Categories
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) return reject(err);
      console.log('✓ Created table: categories');
    });

    // Table 2: Transactions
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL CHECK(amount > 0),
        description TEXT,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) 
          ON DELETE RESTRICT
      )
    `, (err) => {
      if (err) return reject(err);
      console.log('✓ Created table: transactions');
    });

    // Table 3: Reports
    db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_type TEXT NOT NULL CHECK(report_type IN ('weekly', 'monthly')),
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        total_income DECIMAL(10, 2),
        total_expense DECIMAL(10, 2),
        net_savings DECIMAL(10, 2),
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) return reject(err);
      console.log('✓ Created table: reports');
      resolve();
    });
  });
};

// ==================== SEED DATA ====================

const seedData = () => {
  return new Promise((resolve, reject) => {
    
    // Insert default categories
    const categories = [
      { name: 'Food', type: 'expense' },
      { name: 'Transport', type: 'expense' },
      { name: 'Shopping', type: 'expense' },
      { name: 'Salary', type: 'income' },
      { name: 'Investment', type: 'income' },
      { name: 'Others', type: 'expense' }
    ];

    let inserted = 0;

    categories.forEach((cat) => {
      db.run(
        `INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)`,
        [cat.name, cat.type],
        (err) => {
          if (err) return reject(err);
          inserted++;
          if (inserted === categories.length) {
            console.log('✓ Seeded default categories');
            resolve();
          }
        }
      );
    });
  });
};

// ==================== MAIN EXECUTION ====================

const init = async () => {
  try {
    console.log('\n🔧 Initializing database...\n');
    
    await createTables();
    await seedData();
    
    console.log('\n✅ Database initialization complete!\n');
    
    // Show created tables
    db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, tables) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Tables in database:');
        tables.forEach(t => console.log(`  - ${t.name}`));
      }
      
      db.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error during initialization:', err);
    db.close();
    process.exit(1);
  }
};

// Run initialization
init();
