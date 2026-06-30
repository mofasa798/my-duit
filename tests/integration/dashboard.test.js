const request = require('supertest');
const app = require('../../app');
const db = require('../../config/database');

describe('API Dashboard (/api/dashboard)', () => {
  it('Skenario 1: returns 0 values when database is empty', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalIncome).toBe(0);
    expect(res.body.data.totalExpense).toBe(0);
    expect(res.body.data.balance).toBe(0);
  });

  it('Skenario 2: returns accurate totals when populated with transactions', async () => {
    const r1 = await db.runAsync("INSERT INTO categories (name, type) VALUES ('Food', 'expense')");
    const r2 = await db.runAsync("INSERT INTO categories (name, type) VALUES ('Salary', 'income')");

    await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 150.50, '2026-06-01')", [r1.lastID]);
    await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 1000, '2026-06-01')", [r2.lastID]);

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalIncome).toBe(1000);
    expect(res.body.data.totalExpense).toBe(150.5);
    expect(res.body.data.balance).toBe(1000 - 150.5);
  });
});
