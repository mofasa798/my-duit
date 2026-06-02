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
**Phase 5: Frontend UI & Integration** - ✅ COMPLETE

## Current Project Status
- ✅ Workspace created
- ✅ AI_CONTEXT.md created
- ✅ Git initialized
- ✅ npm dependencies installed
- ✅ Folder structure created
- ✅ Database schema designed & initialized
- ✅ Express app setup with middleware
- ✅ Frontend template with TailwindCSS
- ✅ API client JavaScript
- ✅ First commit to Git
- ✅ REST API structure implemented (categories, transactions, dashboard)
- ✅ Health endpoint verified
- ✅ Automated API test script added
- ✅ README updated with testing documentation
- ✅ Frontend CRUD UI implemented (categories.html, transactions.html)
- ✅ Phase 5: Frontend integrated with API and tested

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
- `2026-06-02`: Phase 2 Complete - Project initialized & database created
  - Installed Express, SQLite3, node-cron
  - Created folder structure (config, routes, controllers, services, etc)
  - Database schema created with 3 tables: categories, transactions, reports
  - Express app running on port 3000
  - Frontend template created with TailwindCSS
  - First Git commit
- `2026-06-02`: Phase 3 started - REST API structure implemented for categories, transactions, and dashboard
 - `2026-06-02`: Phase 3 started - REST API structure implemented for categories, transactions, and dashboard
 - `2026-06-02`: Phase 4 started - Automated API test script added and documentation updated
 - `2026-06-02`: Phase 5 started - Frontend CRUD UI implemented and integrated with backend
 - `2026-06-02`: Phase 5 complete - Frontend pages and scripts added, API integration tested
 - `2026-06-02`: Phase 6 started - Weekly reporting job added (cron + manual trigger)

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
2. ✅ Phase 2 DONE: Project initialized & database created
3. → Phase 3: Building REST API (Routes, Controllers, Services)
   - [ ] Create category controller & routes
   - [ ] Create transaction controller & routes
   - [ ] Create dashboard controller & routes
   - [ ] Create service layer for business logic
   - [ ] Error handling middleware
4. → Phase 4: Test API endpoints
5. → Phase 5: Build Frontend UI
6. → Phase 6: Weekly & Monthly reports
7. → Phase 7: Export features
8. → Phase 8: Refactoring & optimization
9. → Phase 9: Testing & debugging
10. → Phase 10: Portfolio preparation

## Notes
- Learning project first, portfolio second
- Build incrementally, not all at once
- Database design erat kaitannya dengan business logic
- Selalu berpikir dari user perspective
