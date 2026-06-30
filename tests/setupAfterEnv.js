const db = require('../config/database');

beforeEach(async () => {
  // Matikan sementara checking foreign keys agar mempermudah penghapusan seluruh tabel
  await db.runAsync('PRAGMA foreign_keys = OFF');
  
  // Hapus semua data dari tabel-tabel utama
  await db.runAsync('DELETE FROM report_audit');
  await db.runAsync('DELETE FROM transactions');
  await db.runAsync('DELETE FROM categories');
  await db.runAsync('DELETE FROM reports');
  await db.runAsync('DELETE FROM locks');
  await db.runAsync('DELETE FROM users');

  // Reset sqlite_sequence to restart auto-increment IDs
  await db.runAsync('DELETE FROM sqlite_sequence');

  await db.runAsync('PRAGMA foreign_keys = ON');

  // Seed user default untuk testing (id=1)
  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash('password123', 10);
  await db.runAsync(
    "INSERT INTO users (id, email, password) VALUES (1, 'test@example.com', ?)",
    [hash]
  );
});

afterAll(async () => {
  // Tutup koneksi DB setelah test suite selesai
  db.db.close();
});
