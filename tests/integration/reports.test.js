const request = require('supertest');

// Mock the weeklyReport job before requiring the app so controllers use the mock
jest.mock('../../jobs/weeklyReport', () => ({
  runWeeklyReport: jest.fn(async (s, e) => ({
    periodStart: s || '2026-05-25',
    periodEnd: e || '2026-05-31',
    totalIncome: 1000,
    totalExpense: 200,
    netSavings: 800,
    topSpendingCategory: { name: 'Food', total: 200 },
  })),
  scheduleWeekly: jest.fn(),
}));

const app = require('../../app');
const db = require('../../config/database');

describe('API Reports (/api/reports)', () => {
  describe('GET /api/reports', () => {
    it('Skenario 1: lists reports descending by generated_at', async () => {
      await db.runAsync("INSERT INTO reports (user_id, report_type, period_start, period_end, generated_at) VALUES (1, 'weekly', '2026-06-01', '2026-06-07', '2026-06-08 10:00:00')");
      await db.runAsync("INSERT INTO reports (user_id, report_type, period_start, period_end, generated_at) VALUES (1, 'weekly', '2026-06-08', '2026-06-14', '2026-06-15 10:00:00')");

      const res = await request(app).get('/api/reports');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      // Ensure descending order
      expect(new Date(res.body.data[0].generated_at).getTime()).toBeGreaterThan(new Date(res.body.data[1].generated_at).getTime());
    });
  });

  describe('POST /api/reports/weekly/run', () => {
    it('Skenario 2: runs weekly report without custom period body', async () => {
      const res = await request(app).post('/api/reports/weekly/run');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.periodStart).toBeDefined();
    });

    it('Skenario 3: runs weekly report with custom valid period', async () => {
      const res = await request(app)
        .post('/api/reports/weekly/run')
        .send({ periodStart: '2026-06-01', periodEnd: '2026-06-07' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.periodStart).toBe('2026-06-01');
      expect(res.body.data.periodEnd).toBe('2026-06-07');
    });

    it('Skenario 4: returns 400 when missing one date in custom period', async () => {
      const res = await request(app)
        .post('/api/reports/weekly/run')
        .send({ periodStart: '2026-06-01' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Both periodStart and periodEnd are required');
    });

    it('Skenario 5: returns 400 for invalid date format', async () => {
      const res = await request(app)
        .post('/api/reports/weekly/run')
        .send({ periodStart: '06/01/2026', periodEnd: '06/07/2026' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('YYYY-MM-DD');
    });

    it('Skenario 6: returns 400 when periodStart > periodEnd', async () => {
      const res = await request(app)
        .post('/api/reports/weekly/run')
        .send({ periodStart: '2026-06-07', periodEnd: '2026-06-01' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('must be before or equal to');
    });
  });

  test('returns 400 when only one date is provided', async () => {
    const res = await request(app)
      .post('/api/reports/weekly/run')
      .send({ periodStart: '2026-05-01' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
