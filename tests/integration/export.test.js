const request = require('supertest');
const app = require('../../app');
const db = require('../../config/database');

describe('API Export (/api/export)', () => {
  describe('GET /api/export/transactions/csv', () => {
    it('Skenario 1: returns CSV file for transactions', async () => {
      const { lastID } = await db.runAsync("INSERT INTO categories (name, type) VALUES ('Food', 'expense')");
      await db.runAsync("INSERT INTO transactions (category_id, amount, transaction_date) VALUES (?, 100, '2026-06-01')", [lastID]);

      const res = await request(app).get('/api/export/transactions/csv');
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('attachment; filename=transactions.csv');
      expect(res.text).toContain('"ID","Date","Category","Type","Amount","Description","Created At"');
      expect(res.text).toContain('100');
    });
  });

  describe('GET /api/export/reports/csv', () => {
    it('Skenario 2: returns CSV file for reports', async () => {
      await db.runAsync("INSERT INTO reports (report_type, period_start, period_end, total_income, total_expense, net_savings) VALUES ('weekly', '2026-06-01', '2026-06-07', 1000, 200, 800)");

      const res = await request(app).get('/api/export/reports/csv');
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('attachment; filename=reports.csv');
      expect(res.text).toContain('"ID","Type","Period Start","Period End","Total Income","Total Expense","Net Savings","Generated At"');
      expect(res.text).toContain('1000');
    });
  });
});
