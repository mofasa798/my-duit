const { execSync } = require('child_process');
const fs = require('fs');

module.exports = async () => {
  // pastikan test database dihapus dulu sebelum testing dimulai (jika ada sisa)
  if (fs.existsSync('./finance_test.db')) {
    fs.unlinkSync('./finance_test.db');
  }

  // inisialisasi skema dan seed data untuk testing database
  execSync('node migrations/init.js', {
    env: { ...process.env, DATABASE_PATH: './finance_test.db' },
    stdio: 'inherit'
  });
};
