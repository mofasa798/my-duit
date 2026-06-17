# TODO

## Phase 6 follow-ups (Weekly/Monthly Reporting hardening)

1. Kumpulkan & review validasi `periodStart/periodEnd` dan middleware error handling.
2. Audit & rapikan potensi bug risk:
   - monthly job memanggil `computeWeeklyReport` (nama service/struktur).
   - pastikan service compute untuk weekly vs monthly konsisten atau ubah menjadi computeReport generic.
3. Pastikan endpoint report controller pakai validasi yang sesuai (weekly/monthly), dan menolak input invalid.
4. Cek konsistensi idempotency + audit events:
   - saat report sudah ada, apakah audit harus mencatat “skipped” (sudah ada) dan apakah perlu field lain.
5. Update/rapikan test bila diperlukan.
6. Jalankan `npm test` dan pastikan semuanya pass.
7. Update tambahan: cek bahwa monthly scheduler aktif.
   - ✅ Sudah diaktifkan di `app.js`
   - ✅ `npm test` lulus

## Dokumentasi

- ✅ Update progress di `AI_CONTEXT.md`
- ✅ Update bagian laporan di `README.md`
