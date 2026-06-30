const request = require('supertest');
const app = require('../../app');

describe('API System Endpoints', () => {
  describe('GET /api/health', () => {
    it('Skenario 1: returns system health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/health/job', () => {
    it('Skenario 2: returns job health/audit status', async () => {
      const db = require('../../config/database');
      await db.runAsync("INSERT INTO reports (user_id, report_type, period_start, period_end) VALUES (1, 'weekly', '2026-06-01', '2026-06-07')");
      await db.runAsync("INSERT INTO report_audit (action, details) VALUES ('generated', 'Test details')");

      const res = await request(app).get('/api/health/job');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('lastAudit');
      expect(res.body).toHaveProperty('lastReport');
    });
  });

  describe('GET /metrics', () => {
    it('Skenario 3: returns prometheus metrics in plain text', async () => {
      const res = await request(app).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/plain');
      expect(res.text).toContain('nodejs_version_info');
    });
  });
});
