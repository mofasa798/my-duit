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
 - Frontend UI untuk Laporan Mingguan & Bulanan (page: `/html/reports.html`) dengan dukungan periode kustom

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
│   │   ├── index.html
│   │   ├── categories.html
│   │   ├── transactions.html
│   │   └── reports.html
│   ├── js/
│   │   ├── api-client.js
│   │   ├── categories.js
│   │   ├── dashboard.js
│   │   ├── transactions.js
│   │   └── reports.js
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
 - Menjalankan unit tests (Jest) dan integration tests (Supertest) untuk endpoint kritis

Catatan: Automated API tests telah dijalankan dan lulus selama pengembangan.

## Weekly & Monthly Reports (Phase 6)

Server menyediakan job mingguan dan bulanan yang akan menghasilkan laporan mingguan (setiap Minggu) dan laporan bulanan (setiap tanggal 1).




Untuk men-trigger laporan secara manual (testing), jalankan:

```bash
npm run run:weekly
```

Endpoint untuk laporan:

- `GET /api/reports`  -> daftar laporan
- `POST /api/reports/weekly/run` -> trigger manual pembuatan laporan mingguan

Penjadwalan:

- Cron expression: `5 0 * * 0` (Setiap Minggu pukul 00:05) menggunakan `node-cron`.

Untuk laporan bulanan, penjadwalan menggunakan cron:
- Cron expression: `10 0 1 * *` (Setiap tanggal 1 pukul 00:10)

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
 - `2026-06-02`: Integration tests untuk `POST /api/reports/weekly/run` ditambahkan (supertest) dan lulus.

- `2026-06-03`: Weekly job hardened: structured logging (`pino`), idempotency checks, and retry/backoff (env: `REPORT_RETRY_MAX`, `REPORT_RETRY_BASE_MS`).

Metrics (stub)

 - The weekly job now emits simple metrics as structured log events. These are currently logged via the `utils/metrics.js` stub.
 - Emitted metric names:
	 - `reports.weekly.generated` : emitted on successful generation (labels: `periodStart`, `periodEnd`, `duration`)
	 - `reports.weekly.failed` : emitted when the job fails after retries (labels: `periodStart`, `periodEnd`, `attempts`)
	 - `reports.weekly.skipped` : emitted when a report already exists for the period (labels: `periodStart`, `periodEnd`)
 - Integration: replace `utils/metrics.js` with real exporter (Prometheus, Datadog, etc.) or forward logs to a log-based metric pipeline.

	Prometheus + Grafana (local)

	1. Start services:

	```bash
	docker-compose up -d
	```

	2. Ensure your app is running on port `3000` (default). Prometheus scrapes `http://host.docker.internal:3000/metrics` by default.

	3. Open Prometheus: http://localhost:9090 and Grafana: http://localhost:3001 (user: `admin`, password: `admin`).

	4. In Grafana, add a Prometheus data source pointing to `http://prometheus:9090` (when using Docker compose) or `http://localhost:9090` when accessing locally.

	Notes:

	- If Docker cannot resolve `host.docker.internal`, adjust `monitoring/prometheus.yml` to point directly at your host or container address.
	- You can import dashboards in Grafana to visualize `reports_weekly_generated_total`, `reports_weekly_failed_total`, and `reports_weekly_skipped_total`.

	Grafana provisioning

	- The repository includes a sample Grafana dashboard and provisioning config under `monitoring/grafana`.
	- When using `docker-compose up -d`, Grafana will auto-provision Prometheus datasource and the dashboard `Weekly Reports Overview`.

	Alerting (Prometheus + Alertmanager)

	- A set of alerting rules is included at `monitoring/alerting/alert.rules.yml` (failures, missing reports, high failure rate).
	- Alertmanager is included in `docker-compose.yml` with config at `monitoring/alertmanager/alertmanager.yml`.
	- You must configure real receivers (email, Slack, webhook) in `monitoring/alertmanager/alertmanager.yml` before expecting notifications.

	Example: to run the monitoring stack including Alertmanager:

	```bash
	docker-compose up -d
	```

	Prometheus will send alerts to Alertmanager at `http://localhost:9093`.

	Testing alerts:

	- Use Prometheus UI (`/alerts`) to view firing alerts.
	- For manual trigger during testing you can increase the failed counter via a temporary script or use Prometheus `amtool`.

Contoh `curl`

- Memanggil daftar laporan:

```bash
curl -s http://localhost:3000/api/reports | jq
```

- Men-trigger laporan mingguan (manual) tanpa body (server akan gunakan periode default):

```bash
curl -X POST http://localhost:3000/api/reports/weekly/run -H "Content-Type: application/json"
```

- Men-trigger laporan dengan periode custom:

```bash
curl -X POST http://localhost:3000/api/reports/weekly/run \
	-H "Content-Type: application/json" \
	-d '{"periodStart":"2026-05-25","periodEnd":"2026-05-31"}' | jq
```

Catatan: `jq` berguna untuk memformat output JSON di terminal, tapi opsional.

## Catatan

- Frontend saat ini hanya template dasar.
- Export CSV/Excel akan dibangun di fase berikutnya.

## Kontribusi

Ini adalah proyek belajar. Jika ingin mengembangkan, fokuskan pada perbaikan:
- Validasi input lebih kuat
- UI CRUD transaksi
- Fitur laporan mingguan/bulanan
- Export CSV
- Penanganan error dan user feedback
