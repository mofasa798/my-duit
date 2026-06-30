# My Duit - Personal Finance Dashboard

Aplikasi **Personal Finance Dashboard** adalah sebuah sistem pengelolaan keuangan pribadi yang dirancang untuk mencatat transaksi keuangan (pemasukan dan pengeluaran), memvisualisasikan ringkasan arus kas, memantau data dalam bentuk laporan periodik (mingguan dan bulanan), melakukan ekspor data secara native ke format CSV, serta mencetak laporan fisik.

Aplikasi ini dibangun untuk mendemonstrasikan praktik terbaik (*best practices*) dalam backend engineering menggunakan Node.js/Express, perancangan database relasional SQLite, struktur kode modular berbasis layanan (*service-oriented*), otomasi latar belakang dengan cron job, serta integrasi pemantauan (*monitoring*) berbasis Prometheus dan Grafana.

---

## 🛠️ Tech Stack & Library yang Digunakan

Aplikasi ini dibangun menggunakan tumpukan teknologi modern, efisien, dan tangguh:

### 1. Core Stack
*   **Backend:** Node.js (v18+) & Express.js (v4.18+)
*   **Database:** SQLite 3 (menggunakan driver `sqlite3` v5.1+)
*   **Frontend:** HTML5, Vanilla JavaScript, CSS3
*   **Styling & UI:** Tailwind CSS v4 (dikompilasi melalui Tailwind CLI resmi)
*   **Containerization & Monitoring:** Docker, Docker Compose, Prometheus, Grafana, Alertmanager

### 2. Library & Dependencies
*   `bcrypt` (`^6.0.0`): Library untuk melakukan *hashing* kata sandi pengguna sebelum disimpan ke database.
*   `dotenv` (`^16.0.3`): Digunakan untuk memuat variabel lingkungan dari file `.env`.
*   `express` (`^4.18.2`): Framework web minimalis untuk routing dan middleware API HTTP.
*   `jsonwebtoken` (`^9.0.3`): Implementasi JSON Web Token (JWT) untuk otentikasi dan pertukaran informasi antar pihak secara aman.
*   `sqlite3` (`^5.1.6`): Driver database SQLite untuk penyimpanan relasional berbasis file.
*   `node-cron` (`^3.0.2`): Scheduler untuk menjalankan laporan otomatis (mingguan/bulanan) di latar belakang.
*   `pino` (`^8.14.0`) & `pino-pretty` (`^9.2.0`): Logger berkinerja tinggi untuk log terstruktur dan mudah dibaca di terminal.
*   `prom-client` (`^14.0.0`): Library instrumentasi Prometheus untuk memantau metrik performa aplikasi dan bisnis.
*   `concurrently` (`^10.0.3`): Menjalankan beberapa proses secara paralel saat development (misal: watch CSS & start server).
*   `nodemon` (`^2.0.20`): Utilitas development untuk melakukan restart server otomatis ketika terjadi perubahan file.
*   `jest` (`^29.6.1`): Framework pengujian unit dan integrasi JavaScript.
*   `supertest` (`^6.3.3`): Library untuk menguji endpoint HTTP Express secara programatis tanpa perlu menjalankan server secara manual.
*   `eslint` (`^10.5.0`) & `prettier` (`^3.8.4`): Perkakas untuk menjaga konsistensi gaya penulisan kode (*linting* dan *code formatting*).

---

## 📂 Arsitektur Folder & Penamaan File

Aplikasi ini mengadopsi pola arsitektur **modular berlapis** yang memisahkan tanggung jawab secara jelas (Separation of Concerns).

### 1. Struktur Folder

```text
my-duit/
├── config/              # Konfigurasi aplikasi dan database helper
├── controllers/         # Handler HTTP request/response & ekstraksi parameter
├── jobs/                # Pekerjaan latar belakang (cron jobs / scheduler)
├── middleware/          # Middleware Express (misal: validasi input request)
├── migrations/          # Script untuk migrasi/inisialisasi skema database
├── monitoring/          # Konfigurasi instrumen monitoring (Prometheus, Grafana, Alertmanager)
│   ├── alerting/
│   ├── alertmanager/
│   └── grafana/
├── public/              # File statis yang diakses langsung oleh client (Frontend)
│   ├── css/             # CSS hasil kompilasi Tailwind
│   ├── html/            # Halaman web HTML
│   └── js/              # Logika JavaScript client-side (koneksi API, manipulasi DOM)
├── routes/              # Definisi rute/endpoint HTTP API
├── scripts/             # Script utilitas (testing manual, seed data, run manual jobs)
├── services/            # Inti logika bisnis (business logic) dan interaksi database
├── src/                 # Source code aset mentah (file CSS Tailwind mentah)
├── tests/               # Berisi semua berkas pengujian (unit & integration tests)
│   ├── integration/     # Tes integrasi API menggunakan Supertest
│   └── unit/            # Tes unit logika internal aplikasi
└── utils/               # Utilitas pembantu (helper, logger, metrics)
```

### 2. Aturan Penamaan File (File Naming Conventions)

*   **Rute / Routes:** Menggunakan huruf kecil jamak sesuai nama entitas (misal: `categories.js`, `transactions.js`, `reports.js`).
*   **Pengendali / Controllers:** Menggunakan camelCase berakhiran kata `Controller.js` (misal: `categoryController.js`, `transactionController.js`).
*   **Layanan / Services:** Menggunakan camelCase berakhiran kata `Service.js` (misal: `categoryService.js`, `transactionService.js`).
*   **Pekerjaan Latar Belakang / Jobs:** Menggunakan camelCase sesuai nama job (misal: `weeklyReport.js`, `monthlyReport.js`).
*   **Pengujian / Tests:** Menggunakan nama modul berakhiran `.test.js` (misal: `reportService.test.js` untuk unit test, `categories.test.js` untuk integration test).
*   **Frontend HTML & JS:** Halaman HTML dan JavaScript di dalam folder `public` dinamai selaras (misal: `/public/html/transactions.html` dipasangkan dengan `/public/js/transactions.js`).

---

## 🗄️ Skema Database (SQLite)

Database menggunakan model relasional yang disimpan dalam file tunggal SQLite (`finance.db`). Relasi antar tabel dikelola dengan *foreign keys* (diaktifkan lewat perintah `PRAGMA foreign_keys = ON`).

```mermaid
erDiagram
    users ||--o{ transactions : "has many"
    users ||--o{ reports : "has many"
    categories ||--o{ transactions : "has many"
    reports ||--o{ report_audit : "audited by"
    
    users {
        INTEGER id PK
        TEXT email UNIQUE
        TEXT password
        TEXT reset_token
        TIMESTAMP reset_token_expires_at
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    categories {
        INTEGER id PK
        TEXT name UNIQUE
        TEXT type "income | expense"
        TIMESTAMP created_at
    }

    transactions {
        INTEGER id PK
        INTEGER user_id FK
        INTEGER category_id FK
        DECIMAL amount
        TEXT description
        DATE transaction_date
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    reports {
        INTEGER id PK
        INTEGER user_id FK
        TEXT report_type "weekly | monthly"
        DATE period_start
        DATE period_end
        DECIMAL total_income
        DECIMAL total_expense
        DECIMAL net_savings
        TIMESTAMP generated_at
    }

    report_audit {
        INTEGER id PK
        INTEGER report_id FK
        TEXT action
        DATE period_start
        DATE period_end
        TEXT details
        TIMESTAMP created_at
    }

    locks {
        TEXT name PK
        TEXT owner
        TIMESTAMP expires_at
    }
```

### Detail Tabel

#### 1. Tabel `users`
Menyimpan data otentikasi pengguna sistem.
*   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): ID unik pengguna.
*   `email` (TEXT, NOT NULL, UNIQUE): Email pengguna yang digunakan untuk login.
*   `password` (TEXT, NOT NULL): Kata sandi pengguna (tersimpan dalam bentuk *hash* bcrypt).
*   `reset_token` (TEXT): Token yang digunakan untuk melakukan reset password (opsional).
*   `reset_token_expires_at` (TIMESTAMP): Waktu kedaluwarsa token reset password.
*   `created_at` / `updated_at` (TIMESTAMP, DEFAULT `CURRENT_TIMESTAMP`): Waktu pembuatan dan pembaruan data.

#### 2. Tabel `categories`
Menyimpan daftar kategori transaksi keuangan.
*   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): ID unik kategori.
*   `name` (TEXT, NOT NULL, UNIQUE): Nama kategori (contoh: *Food, Salary, Shopping*).
*   `type` (TEXT, NOT NULL): Jenis kategori. Memiliki batasan cek (`CHECK`) bernilai `'income'` (pemasukan) atau `'expense'` (pengeluaran).
*   `created_at` (TIMESTAMP, DEFAULT `CURRENT_TIMESTAMP`): Waktu pembuatan data.

#### 2. Tabel `transactions`
Menyimpan detail transaksi pemasukan dan pengeluaran harian.
*   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): ID unik transaksi.
*   `user_id` (INTEGER, NOT NULL): Referensi ke tabel `users(id)` sebagai pemilik transaksi. Memastikan data isolation antar pengguna.
*   `category_id` (INTEGER, NOT NULL): Referensi ke tabel `categories(id)`. Memiliki batasan `ON DELETE RESTRICT` agar kategori yang memiliki transaksi tidak dapat dihapus.
*   `amount` (DECIMAL(10, 2), NOT NULL): Nominal transaksi. Memiliki batasan cek `CHECK(amount > 0)`.
*   `description` (TEXT): Keterangan opsional mengenai transaksi.
*   `transaction_date` (DATE, NOT NULL): Tanggal terjadinya transaksi (format: `YYYY-MM-DD`).
*   `created_at` / `updated_at` (TIMESTAMP, DEFAULT `CURRENT_TIMESTAMP`): Waktu pencatatan dan pembaruan data.

#### 3. Tabel `reports`
Menyimpan ringkasan laporan periodik yang di-generate otomatis oleh scheduler atau manual.
*   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): ID unik laporan.
*   `user_id` (INTEGER, NULLABLE): Referensi ke tabel `users(id)`. Jika terisi, laporan hanya tampil untuk pengguna tersebut. Jika NULL, laporan bersifat sistem.
*   `report_type` (TEXT, NOT NULL): Jenis laporan. Berisi `'weekly'` (mingguan) atau `'monthly'` (bulanan).
*   `period_start` (DATE, NOT NULL): Tanggal mulai periode laporan.
*   `period_end` (DATE, NOT NULL): Tanggal akhir periode laporan.
*   `total_income` (DECIMAL(10, 2)): Total pemasukan dalam rentang periode tersebut.
*   `total_expense` (DECIMAL(10, 2)): Total pengeluaran dalam rentang periode tersebut.
*   `net_savings` (DECIMAL(10, 2)): Selisih bersih (`total_income - total_expense`).
*   `generated_at` (TIMESTAMP, DEFAULT `CURRENT_TIMESTAMP`): Waktu laporan dibuat.

#### 4. Tabel `report_audit`
Mencatat riwayat aktivitas pemrosesan laporan (audit log) untuk pelacakan kendala atau tindakan operasional.
*   `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): ID unik log audit.
*   `report_id` (INTEGER, NULLABLE): Referensi ke tabel `reports(id)` dengan batasan `ON DELETE SET NULL`.
*   `action` (TEXT, NOT NULL): Jenis tindakan (contoh: `WEEKLY_JOB_START`, `WEEKLY_JOB_SUCCESS`, `WEEKLY_JOB_FAILED`).
*   `period_start` / `period_end` (DATE): Rentang periode laporan terkait.
*   `details` (TEXT): Pesan detail, stack trace kegagalan, atau info jumlah percobaan retries.
*   `created_at` (TIMESTAMP, DEFAULT `CURRENT_TIMESTAMP`): Waktu log dicatat.

#### 5. Tabel `locks`
Digunakan untuk implementasi *Distributed Locking* guna menghindari duplikasi eksekusi job jika aplikasi dijalankan pada multi-instance (skala horizontal).
*   `name` (TEXT, PRIMARY KEY): Nama kunci lock (contoh: `weekly_report_job`).
*   `owner` (TEXT): ID atau pengenal proses yang memegang lock saat ini.
*   `expires_at` (TIMESTAMP): Batas waktu masa berlaku lock (TTL) agar menghindari *deadlock* jika server crash.

---

## 📡 API Endpoint (API yang Tersedia)

Setiap endpoint mengembalikan respons berupa format JSON dengan pola seragam: `{ success: true/false, data: ... }` atau `{ success: false, message: ... }`.

*Catatan Penting:* Sebagian besar endpoint (kecuali otentikasi `/api/auth/*` dan health check) merupakan rute privat/terlindungi (*protected route*). Anda diwajibkan untuk menyertakan JSON Web Token (JWT) pada HTTP Header request Anda: `Authorization: Bearer <token>`.

Token JWT dapat diperoleh melalui halaman **Login** (`/html/login.html`) atau endpoint **`POST /api/auth/login`**.

### 1. Autentikasi / Auth API (`/api/auth`)

*   **`POST /api/auth/register`**
    *   **Deskripsi:** Mendaftarkan pengguna baru ke dalam sistem.
    *   **Body (JSON):**
        ```json
        {
          "email": "user@example.com",
          "password": "securepassword"
        }
        ```
    *   **Respons (201 Created):**
        ```json
        {
          "success": true,
          "message": "User registered successfully",
          "userId": 1
        }
        ```

*   **`POST /api/auth/login`**
    *   **Deskripsi:** Masuk menggunakan email dan kata sandi untuk mendapatkan JWT.
    *   **Body (JSON):**
        ```json
        {
          "email": "user@example.com",
          "password": "securepassword"
        }
        ```
    *   **Respons (200 OK):**
        ```json
        {
          "success": true,
          "message": "Logged in successfully",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."
        }
        ```

*   **`POST /api/auth/forgot-password`**
    *   **Deskripsi:** Meminta reset token apabila pengguna lupa kata sandi. (Sistem akan me-mock pengiriman email dengan memunculkannya di log console).
    *   **Body (JSON):**
        ```json
        {
          "email": "user@example.com"
        }
        ```

*   **`POST /api/auth/reset-password`**
    *   **Deskripsi:** Mengubah kata sandi menggunakan reset token yang didapatkan.
    *   **Body (JSON):**
        ```json
        {
          "token": "a1b2c3d4e5f6...",
          "newPassword": "newpassword123"
        }
        ```

### 2. Kategori / Categories API (`/api/categories`)

*   **`GET /api/categories`**
    *   **Deskripsi:** Mengambil semua daftar kategori yang ada.
    *   **Respons (200 OK):**
        ```json
        {
          "success": true,
          "data": [
            { "id": 1, "name": "Food", "type": "expense", "created_at": "2026-06-19 06:11:32" }
          ]
        }
        ```

*   **`POST /api/categories`**
    *   **Deskripsi:** Membuat kategori baru.
    *   **Body (JSON):**
        ```json
        {
          "name": "Salary",
          "type": "income"
        }
        ```
    *   **Respons (201 Created):**
        ```json
        {
          "success": true,
          "data": { "id": 4, "name": "Salary", "type": "income" }
        }
        ```

*   **`PUT /api/categories/:id`**
    *   **Deskripsi:** Memperbarui data kategori berdasarkan ID.
    *   **Body (JSON):**
        ```json
        {
          "name": "Food & Beverage",
          "type": "expense"
        }
        ```
    *   **Respons (200 OK):**
        ```json
        {
          "success": true,
          "data": { "id": 1, "name": "Food & Beverage", "type": "expense" }
        }
        ```

*   **`DELETE /api/categories/:id`**
    *   **Deskripsi:** Menghapus kategori berdasarkan ID. Tidak bisa dihapus jika ID kategori sedang digunakan oleh transaksi keuangan mana pun.
    *   **Respons (200 OK):**
        ```json
        {
          "success": true,
          "message": "Category deleted successfully"
        }
        ```

### 3. Transaksi / Transactions API (`/api/transactions`)

*   **`GET /api/transactions`**
    *   **Deskripsi:** Mengambil daftar transaksi keuangan. Mendukung filter pencarian melalui Query Parameters.
    *   **Query Parameters:**
        *   `category_id` (opsional): Menyaring berdasarkan ID kategori tertentu.
        *   `type` (opsional): Menyaring tipe transaksi (`income` / `expense`).
        *   `date_from` (opsional): Menyaring transaksi dari tanggal (`YYYY-MM-DD`).
        *   `date_to` (opsional): Menyaring transaksi sampai tanggal (`YYYY-MM-DD`).
        *   `search` (opsional): Melakukan pencarian teks di deskripsi transaksi.
    *   **Respons (200 OK):**
        ```json
        {
          "success": true,
          "data": [
            {
              "id": 1,
              "category_id": 1,
              "category_name": "Food",
              "amount": 25000.00,
              "description": "Lunch at canteen",
              "transaction_date": "2026-06-19",
              "created_at": "..."
            }
          ]
        }
        ```

*   **`POST /api/transactions`**
    *   **Deskripsi:** Mencatat transaksi keuangan baru.
    *   **Body (JSON):**
        ```json
        {
          "category_id": 1,
          "amount": 50000.00,
          "description": "Weekly grocery",
          "transaction_date": "2026-06-19"
        }
        ```
    *   **Respons (201 Created):**
        ```json
        {
          "success": true,
          "data": { "id": 2, "category_id": 1, "amount": 50000.00, "description": "Weekly grocery", "transaction_date": "2026-06-19" }
        }
        ```

*   **`PUT /api/transactions/:id`**
    *   **Deskripsi:** Memperbarui data transaksi berdasarkan ID.
    *   **Body (JSON):** Sama seperti request POST.
    *   **Respons (200 OK):**
        ```json
        {
          "success": true,
          "data": { "id": 2, "category_id": 1, "amount": 55000.00, "description": "Weekly grocery updated", "transaction_date": "2026-06-19" }
        }
        ```

*   **`DELETE /api/transactions/:id`**
    *   **Deskripsi:** Menghapus data transaksi berdasarkan ID.
    *   **Respons (200 OK):**
        ```json
        {
          "success": true,
          "message": "Transaction deleted successfully"
        }
        ```

### 4. Dashboard API (`/api/dashboard`)

*   **`GET /api/dashboard`**
    *   **Deskripsi:** Mengambil metrik total pemasukan, total pengeluaran, saldo bersih saat ini, serta ringkasan tren.
    *   **Respons (200 OK):**
        ```json
        {
          "success": true,
          "data": {
            "totalIncome": 5000000.00,
            "totalExpense": 1200000.00,
            "netBalance": 3800000.00
          }
        }
        ```

### 5. Laporan / Reports API (`/api/reports`)

*   **`GET /api/reports`**
    *   **Deskripsi:** Mengambil semua riwayat laporan mingguan dan bulanan yang telah dibuat.
    *   **Respons (200 OK):**
        ```json
        {
          "success": true,
          "data": [
            { "id": 1, "report_type": "weekly", "period_start": "2026-06-01", "period_end": "2026-06-07", "total_income": 1000000.00, "total_expense": 400000.00, "net_savings": 600000.00, "generated_at": "..." }
          ]
        }
        ```

*   **`POST /api/reports/weekly/run`**
    *   **Deskripsi:** Menjalankan pemrosesan laporan mingguan secara manual.
    *   **Body (JSON - Opsional):** Jika kosong, sistem menggunakan rentang seminggu yang lalu secara otomatis.
        ```json
        {
          "periodStart": "2026-06-01",
          "periodEnd": "2026-06-07"
        }
        ```
    *   **Respons (200 OK):** Mengembalikan data objek laporan yang berhasil dibuat.

*   **`POST /api/reports/monthly/run`**
    *   **Deskripsi:** Menjalankan pemrosesan laporan bulanan secara manual.
    *   **Body (JSON - Opsional):** Jika kosong, sistem menggunakan rentang sebulan yang lalu secara otomatis.
        ```json
        {
          "periodStart": "2026-05-01",
          "periodEnd": "2026-05-31"
        }
        ```
    *   **Respons (200 OK):** Mengembalikan data objek laporan bulanan yang berhasil dibuat.

### 6. Ekspor Data / Export API (`/api/export`)

*   **`GET /api/export/transactions/csv`**
    *   **Deskripsi:** Mengunduh semua riwayat transaksi dalam format CSV secara langsung.
    *   **Header Respons:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename=transactions.csv`.

*   **`GET /api/export/reports/csv`**
    *   **Deskripsi:** Mengunduh semua riwayat laporan ringkasan dalam format CSV.
    *   **Header Respons:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename=reports.csv`.

### 7. Health & Metrik API

*   **`GET /api/health`**
    *   **Deskripsi:** Memeriksa status kesehatan server aplikasi.
    *   **Respons (200 OK):** `{ "status": "OK", "timestamp": "...", "environment": "development" }`

*   **`GET /api/health/job`**
    *   **Deskripsi:** Memeriksa status keberhasilan eksekusi job scheduler (audit terakhir & laporan terakhir).

*   **`GET /metrics`**
    *   **Deskripsi:** Menyediakan data metrik berformat Prometheus untuk proses scraping data metrik (seperti: `reports_weekly_generated_total`).

---

## 🚀 Panduan Setup Project

Ikuti langkah-langkah berikut untuk menyiapkan aplikasi di lingkungan lokal Anda:

### 1. Prasyarat (Prerequisites)
Pastikan sistem komputer Anda sudah menginstal:
*   [Node.js](https://nodejs.org/) (Sangat disarankan versi LTS 18 atau lebih baru)
*   NPM (biasanya otomatis terinstal bersama Node.js)
*   *Opsional:* [Docker](https://www.docker.com/) jika ingin menjalankan monitoring stack (Prometheus & Grafana) secara instan.

### 2. Instalasi Dependency
Buka terminal pada direktori root proyek `my-duit`, kemudian jalankan perintah:
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin contoh konfigurasi dari berkas `.env.example` ke file baru bernama `.env`:
*   Di sistem Windows (PowerShell):
    ```powershell
    Copy-Item .env.example .env
    ```
*   Di sistem Windows (CMD):
    ```cmd
    copy .env.example .env
    ```

Isi variabel di `.env` sesuai kebutuhan. Contoh bawaan:
```ini
PORT=3000
DATABASE_PATH=./finance.db
NODE_ENV=development
SCHEDULER_LOCK_TTL_MS=600000
```

### 4. Build Aset CSS (Tailwind)
Lakukan kompilasi Tailwind CSS mentah menjadi file style CSS siap saji:
```bash
npm run build:css
```

### 5. Inisialisasi Skema Database
Untuk menyiapkan database SQLite pertama kali dan menyisipkan data kategori default (*seeding*):
```bash
npm run init:db
```
*Catatan: Sistem juga memiliki fitur auto-initialization pada startup, jika mendeteksi file `finance.db` belum tersedia saat aplikasi mulai berjalan, sistem akan membuatnya secara otomatis.*

### 6. Migrasi Database (Jika Upgrade dari Versi Lama)
Jika Anda sudah memiliki database lama dan perlu menambahkan kolom `user_id` untuk data isolation:
```bash
npm run db:migrate
```

---

## 🏃 Cara Menjalankan Aplikasi

Aplikasi mendukung mode pengembangan dan mode produksi, serta pengoperasian infrastruktur metrik.

### 1. Mode Pengembangan (Development Mode)
Menjalankan server menggunakan `nodemon` untuk restart otomatis ketika kode JavaScript berubah, serta menyalakan Tailwind CSS CLI mode `--watch` untuk mengompilasi ulang CSS secara *realtime*:
```bash
npm run dev
```
Buka browser Anda dan akses aplikasi melalui tautan:
*   Login: `http://localhost:3000/html/login.html`
*   Register: `http://localhost:3000/html/register.html`
*   Dashboard utama (setelah login): `http://localhost:3000`
*   Pengelolaan Kategori: `http://localhost:3000/html/categories.html`
*   Pencatatan Transaksi: `http://localhost:3000/html/transactions.html`
*   Laporan Ringkasan: `http://localhost:3000/html/reports.html`

### 2. Mode Produksi (Production Mode)
Untuk menjalankan aplikasi dengan performa maksimal tanpa pemantau file lokal (nodemon/watch):
```bash
npm start
```

### 3. Menjalankan Monitoring Stack (Docker Compose)
Jika Anda ingin melihat pemantauan visual metrik (Grafana Dashboard & Prometheus):
1.  Pastikan Docker service sudah aktif.
2.  Jalankan stack monitoring dengan perintah:
    ```bash
    docker-compose up -d
    ```
3.  Akses layanan:
    *   **Prometheus UI:** `http://localhost:9090` (melihat data metrik mentah dan status alert)
    *   **Grafana Dashboard:** `http://localhost:3001` (login default `admin` / `admin`). Halaman dashboard *Weekly Reports Overview* sudah terkonfigurasi secara otomatis via mekanisme auto-provisioning.
    *   **Alertmanager:** `http://localhost:9093` (meninjau notifikasi sistem/kegagalan job).

---

## 🧪 Cara Mengetes Aplikasi

Sistem memiliki rangkaian pengujian yang komprehensif untuk memastikan reliabilitas logika bisnis dan kestabilan API.

### 1. Uji Coba Unit & Integrasi Otomatis (Jest & Supertest)
Pengujian ini memverifikasi kebenaran internal logika servis (misal: *Distributed Lock TTL* dan *Report Service*) serta integrasi API HTTP. Pengujian ini menggunakan database khusus pengujian agar tidak merusak data utama Anda.

Untuk menjalankan seluruh test suite:
```bash
npm test
```
*Atau:*
```bash
npm run test
```

### 2. Uji Coba Integrasi API Langsung (Custom API Script)
Tersedia skrip pengujian kustom yang secara mandiri akan menghidupkan server sementara pada port khusus, mengirimkan serangkaian request HTTP nyata (Health, CRUD Categories, CRUD Transactions, Dashboard), memeriksa responsnya, lalu mematikan server kembali secara otomatis.

Untuk menjalankan uji coba ini:
```bash
npm run test:api
```

### 3. Linting & Formatting Kode
Guna memastikan konsistensi penulisan kode sesuai standar industri sebelum melakukan commit kode:
*   Mengecek kesalahan gaya penulisan kode:
    ```bash
    npm run lint
    ```
*   Memperbaiki format kode secara otomatis:
    ```bash
    npm run format
    ```
