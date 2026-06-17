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

describe('POST /api/reports/weekly/run (integration)', () => {
  test('runs weekly report without body (uses default period)', async () => {
    const res = await request(app).post('/api/reports/weekly/run').send();
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('periodStart', '2026-05-25');
  });

  test('runs weekly report with valid custom period', async () => {
    const body = { periodStart: '2026-05-01', periodEnd: '2026-05-07' };
    const res = await request(app).post('/api/reports/weekly/run').send(body);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('periodStart', '2026-05-01');
  });

  test('returns 400 when only one date is provided', async () => {
    const res = await request(app)
      .post('/api/reports/weekly/run')
      .send({ periodStart: '2026-05-01' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
