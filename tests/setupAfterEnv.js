const db = require('../config/database');

beforeEach(async () => {
  // Matikan sementara checking foreign keys agar mempermudah penghapusan seluruh tabel
  await db.runAsync('PRAGMA foreign_keys = OFF');
  
  // Hapus semua data dari tabel-tabel utama (kecuali data seed jika diperlukan)
  // Untuk testing, biasanya kita hapus lalu kita seed sesuai kebutuhan di tiap test,
  // tapi dalam hal ini kita akan clear table transaksi, report dsb. 
  // Jika categories butuh default, tests yang akan menambahkannya, atau kita tidak perlu mendelete default categories.
  // Wait, di issue.md dibilang "bersihkan seluruh tabel". 
  
  await db.runAsync('DELETE FROM report_audit');
  await db.runAsync('DELETE FROM transactions');
  await db.runAsync('DELETE FROM categories');
  await db.runAsync('DELETE FROM reports');
  await db.runAsync('DELETE FROM locks');

  // Reset sqlite_sequence to restart auto-increment IDs
  await db.runAsync('DELETE FROM sqlite_sequence');

  await db.runAsync('PRAGMA foreign_keys = ON');
});

afterAll(async () => {
  // Tutup koneksi DB setelah test suite selesai
  db.db.close();
});
