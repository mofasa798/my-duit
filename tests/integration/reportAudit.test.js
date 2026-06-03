const request = require('supertest');
const app = require('../../app');
const db = require('../../config/database');

describe('Report audit integration', () => {
  test('POST /api/reports/weekly/run creates audit row', async () => {
    const periodStart = '2000-01-01';
    const periodEnd = '2000-01-07';

    const res = await request(app)
      .post('/api/reports/weekly/run')
      .send({ periodStart, periodEnd })
      .expect(200);

    // ensure a report row exists
    const report = await db.getAsync(`SELECT id FROM reports WHERE period_start = ? AND period_end = ? LIMIT 1`, [periodStart, periodEnd]);
    expect(report).toBeDefined();

    // ensure audit row exists for that period
    const audit = await db.getAsync(`SELECT action, details FROM report_audit WHERE period_start = ? AND period_end = ? ORDER BY created_at DESC LIMIT 1`, [periodStart, periodEnd]);
    expect(audit).toBeDefined();
    expect(['started','generated','skipped','failed']).toContain(audit.action);
  });
});
