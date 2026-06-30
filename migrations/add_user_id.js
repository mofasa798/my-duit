/**
 * migrations/add_user_id.js
 *
 * Menambahkan kolom user_id ke tabel transactions dan reports
 * untuk data isolation antar user.
 *
 * Jalankan dengan: node migrations/add_user_id.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './finance.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

db.serialize(() => {
  // Cek apakah kolom sudah ada
  db.all("PRAGMA table_info(transactions)", (err, rows) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const hasUserId = rows.some((r) => r.name === 'user_id');

    if (!hasUserId) {
      db.run("ALTER TABLE transactions ADD COLUMN user_id INTEGER REFERENCES users(id)", (err) => {
        if (err) {
          console.error('Error adding user_id to transactions:', err);
        } else {
          console.log('✓ Added user_id to transactions table');
        }
      });
    } else {
      console.log('✓ user_id already exists in transactions table');
    }

    // Cek reports table
    db.all("PRAGMA table_info(reports)", (err, rows) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      const hasUserIdReports = rows.some((r) => r.name === 'user_id');

      if (!hasUserIdReports) {
        db.run("ALTER TABLE reports ADD COLUMN user_id INTEGER REFERENCES users(id)", (err) => {
          if (err) {
            console.error('Error adding user_id to reports:', err);
          } else {
            console.log('✓ Added user_id to reports table');
          }
        });
      } else {
        console.log('✓ user_id already exists in reports table');
      }

      console.log('\n✅ Migration complete!\n');
      db.close();
      process.exit(0);
    });
  });
});
