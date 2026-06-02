# My Duit - Personal Finance Dashboard

Aplikasi Personal Finance Dashboard untuk belajar backend engineering, REST API, database design, dan frontend sederhana.

## Deskripsi
My Duit adalah aplikasi yang membantu pengguna mencatat transaksi keuangan, melihat ringkasan arus kas, dan mempersiapkan fitur laporan dan export. Aplikasi ini dibangun dengan:

- Backend: Node.js, Express.js
- Database: SQLite
- Frontend: HTML, TailwindCSS, Vanilla JavaScript
- Automation: node-cron (future enhancement)

## Fitur Saat Ini
- Dashboard sederhana dengan ringkasan total income, total expense, dan saldo
- CRUD kategori transaksi
- CRUD transaksi
- Struktur aplikasi modular dengan routes, controllers, services, dan database helper
- Database schema untuk categories, transactions, dan reports
 - Frontend CRUD UI untuk `categories` dan `transactions` (pages: `/html/categories.html`, `/html/transactions.html`)

## Struktur Proyek

```
my-duit/
├── config/
│   └── database.js
├── controllers/
│   ├── categoryController.js
│   ├── dashboardController.js
│   └── transactionController.js
├── jobs/
├── migrations/
│   └── init.js
├── middleware/
├── public/
│   ├── html/
│   │   └── index.html
│   ├── js/
│   │   ├── api-client.js
│   │   └── dashboard.js
│   └── css/
├── routes/
│   ├── categories.js
│   ├── dashboard.js
│   └── transactions.js
├── services/
│   ├── categoryService.js
│   ├── dashboardService.js
│   └── transactionService.js
├── app.js
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Setup

1. Clone repository atau salin folder ke lokal.
2. Pastikan Node.js dan npm sudah terinstall.
3. Install dependency:

```bash
npm install
```

4. Salin file `.env.example` menjadi `.env` jika diperlukan.

5. Inisialisasi database:

```bash
npm run init:db
```

6. Jalankan server:

```bash
npm start
```

7. Buka browser dan akses:

```
http://localhost:3000
```

Untuk mengakses UI CRUD yang sudah tersedia langsung:

```
http://localhost:3000/html/categories.html
http://localhost:3000/html/transactions.html
```

## Endpoint API

- `GET /api/health`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET /api/dashboard`

## Testing

Aplikasi sudah menyediakan script API test untuk memverifikasi endpoint penting secara otomatis.

Jalankan:

```bash
npm run test:api
```

Script ini akan:
- Menjalankan server secara sementara
- Memanggil `/api/health`
- Menguji CRUD kategori
- Menguji CRUD transaksi
- Menguji endpoint dashboard

Catatan: Automated API tests telah dijalankan dan lulus selama pengembangan.

## Weekly Reports (Phase 6)

Server menyediakan job mingguan yang akan menghasilkan laporan setiap hari Minggu.

Untuk men-trigger laporan secara manual (testing), jalankan:

```bash
npm run run:weekly
```

Endpoint untuk laporan:

- `GET /api/reports`  -> daftar laporan
- `POST /api/reports/weekly/run` -> trigger manual pembuatan laporan mingguan

Penjadwalan:

- Cron expression: `5 0 * * 0` (Setiap Minggu pukul 00:05) menggunakan `node-cron`.

Catatan: Job telah diuji dengan `npm run run:weekly` dan hasil laporan disimpan di tabel `reports`.

Request Body (opsional)

 - Endpoint `POST /api/reports/weekly/run` menerima body JSON opsional untuk menentukan periode khusus:
	 - `periodStart`: tanggal mulai dalam format `YYYY-MM-DD`
	 - `periodEnd`: tanggal akhir dalam format `YYYY-MM-DD`

Contoh body:

```json
{
	"periodStart": "2026-05-25",
	"periodEnd": "2026-05-31"
}
```

Validasi:

 - Jika salah satu dari `periodStart` atau `periodEnd` diberikan, maka keduanya wajib.
 - Format tanggal harus `YYYY-MM-DD`.
 - `periodStart` harus lebih kecil atau sama dengan `periodEnd`.
 - Jika validasi gagal, server merespon dengan status `400` dan pesan error yang menjelaskan.

Status pengembangan:

- `2026-06-02`: Validation middleware ditambahkan untuk endpoint laporan; unit tests untuk `reportService` dibuat dan lulus.

## Catatan

- Frontend saat ini hanya template dasar.
- Report mingguan dan bulanan akan dikembangkan selanjutnya.
- Export CSV/Excel akan dibangun di fase berikutnya.

## Kontribusi

Ini adalah proyek belajar. Jika ingin mengembangkan, fokuskan pada perbaikan:
- Validasi input lebih kuat
- UI CRUD transaksi
- Fitur laporan mingguan/bulanan
- Export CSV
- Penanganan error dan user feedback
