# Learning Context - Personal Finance Dashboard

## Current Goal
Membangun Personal Finance Dashboard sebagai learning project untuk:
- Fundamental programming
- Backend engineering dengan Node.js & Express.js
- Software architecture
- REST API development
- Database design dengan SQLite
- Automation dengan node-cron

## Current Stack
- Frontend: HTML, TailwindCSS, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: SQLite
- Automation: node-cron
- Version Control: Git

## Current Phase
**Phase 1: Project Planning** - Sedang dimulai

## Current Project Status
- ✅ Workspace created (kosong)
- ✅ AI_CONTEXT.md created
- ⏳ Project planning phase

## Application Features (To Build)
1. Dashboard (Total income, expense, balance, weekly/monthly summary)
2. Transaction Management (CRUD)
3. Categories (Food, Transport, Shopping, Salary, Investment, Others)
4. Excel-like Table Interface (sortable, searchable, filterable)
5. Weekly Report (every Sunday)
6. Monthly Report (every 1st of month)
7. Export Features (CSV, Excel)

## Learning Priorities
1. Pattern recognition - Mengenali pola dalam masalah
2. Abstraction - Abstraksi kompleksitas
3. Problem decomposition - Memecah masalah besar menjadi kecil

## Progress Log
- `2026-06-02`: Project initiated, AI_CONTEXT.md created
- `2026-06-02`: Database schema designed (3 tabel)
- `2026-06-02`: Folder structure planned
- `2026-06-02`: Mini challenge completed - learned about ON DELETE RESTRICT & Event Time

## Key Learnings
1. **Normalization & 1-to-Many Relationships**
   - Categories ← (1-to-Many) → Transactions
   - FK dengan ON DELETE RESTRICT untuk data integrity

2. **Event Time vs Processing Time** ⭐ CRITICAL
   - `transaction_date` = kapan transaksi BENAR-BENAR terjadi (gunakan untuk reporting!)
   - `created_at` = kapan record diinput ke sistem (gunakan untuk audit)
   - Kesalahan umum: menggunakan created_at untuk business logic

3. **Referential Integrity**
   - ON DELETE RESTRICT mencegah data history hilang
   - Best practice di production systems

4. **Schema Design Philosophy**
   - Satu tabel = satu tanggung jawab
   - Denormalisasi hanya jika diperlukan
   - Selalu tambah audit timestamps

## Current Problems / To Learn
- [ ] Understanding async/await in Node.js
- [ ] Error handling best practices
- [ ] Validation patterns for REST API
- [ ] Query optimization

## Next Steps
1. ✅ Phase 1 DONE: Database & Folder Structure planned
2. → Phase 2: Initialize project & git setup
3. → Phase 3: Install dependencies (Express, SQLite3, etc)
4. → Phase 4: Create database schema
5. → Phase 5: Build REST API (Routes & Controllers)

## Notes
- Learning project first, portfolio second
- Build incrementally, not all at once
- Database design erat kaitannya dengan business logic
- Selalu berpikir dari user perspective
