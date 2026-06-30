const request = require('supertest');
const app = require('../../app');
const db = require('../../config/database');

describe('API Transactions (/api/transactions)', () => {
  let catFoodId, catSalaryId;

  beforeEach(async () => {
    const r1 = await db.runAsync("INSERT INTO categories (name, type) VALUES ('Food', 'expense')");
    catFoodId = r1.lastID;
    const r2 = await db.runAsync("INSERT INTO categories (name, type) VALUES ('Salary', 'income')");
    catSalaryId = r2.lastID;
  });

  describe('GET /api/transactions', () => {
    it('Skenario 1: returns all transactions without filters', async () => {
      await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 100, '2026-06-01')", [catFoodId]);
      await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 500, '2026-06-02')", [catSalaryId]);

      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('Skenario 2: filters by category_id', async () => {
      await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 100, '2026-06-01')", [catFoodId]);
      await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 500, '2026-06-02')", [catSalaryId]);

      const res = await request(app).get(`/api/transactions?category_id=${catFoodId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].category_id).toBe(catFoodId);
    });

    it('Skenario 3: filters by type (income/expense)', async () => {
      await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 100, '2026-06-01')", [catFoodId]);
      await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 500, '2026-06-02')", [catSalaryId]);

      const res = await request(app).get('/api/transactions?type=income');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].type).toBe('income');
    });

    it('Skenario 4: filters by date range (date_from, date_to)', async () => {
      await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 100, '2026-06-01')", [catFoodId]);
      await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 500, '2026-06-10')", [catSalaryId]);

      const res = await request(app).get('/api/transactions?date_from=2026-06-05&date_to=2026-06-15');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].date).toBe('2026-06-10');
    });

    it('Skenario 5: filters by search keyword in description', async () => {
      await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date, description) VALUES (1, ?, 100, '2026-06-01', 'Lunch at KFC')", [catFoodId]);
      await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date, description) VALUES (1, ?, 500, '2026-06-02', 'Monthly Salary')", [catSalaryId]);

      const res = await request(app).get('/api/transactions?search=KFC');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].description).toBe('Lunch at KFC');
    });
  });

  describe('POST /api/transactions', () => {
    it('Skenario 6: creates a new transaction with valid input', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({ category_id: catFoodId, amount: 50, transaction_date: '2026-06-01', description: 'Snacks' });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(50);
    });

    it('Skenario 7: returns 400 when missing required fields', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({ category_id: catFoodId, amount: 50 }); // missing date
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('Skenario 8: returns 400 when category_id is invalid (FK fails)', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({ category_id: 999, amount: 50, transaction_date: '2026-06-01' });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid category_id');
    });

    it('Skenario 9: returns error when amount is <= 0 (CHECK constraint)', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({ category_id: catFoodId, amount: -10, transaction_date: '2026-06-01' });
      
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('Skenario 10: updates an existing transaction', async () => {
      const { lastID } = await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 100, '2026-06-01')", [catFoodId]);

      const res = await request(app)
        .put(`/api/transactions/${lastID}`)
        .send({ category_id: catSalaryId, amount: 200, transaction_date: '2026-06-02' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(200);
      expect(res.body.data.category_id).toBe(catSalaryId);
    });

    it('Skenario 11: returns 404 for non-existent id', async () => {
      const res = await request(app)
        .put('/api/transactions/999')
        .send({ category_id: catFoodId, amount: 100, transaction_date: '2026-06-01' });
      
      expect(res.status).toBe(404);
    });

    it('Skenario 12: returns 400 when missing required fields in update', async () => {
      const { lastID } = await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 100, '2026-06-01')", [catFoodId]);

      const res = await request(app).put(`/api/transactions/${lastID}`).send({ amount: 200 }); // missing category_id and date
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('Skenario 13: deletes an existing transaction', async () => {
      const { lastID } = await db.runAsync("INSERT INTO transactions (user_id, category_id, amount, transaction_date) VALUES (1, ?, 100, '2026-06-01')", [catFoodId]);

      const res = await request(app).delete(`/api/transactions/${lastID}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const dbCheck = await db.getAsync(`SELECT * FROM transactions WHERE id = ${lastID}`);
      expect(dbCheck).toBeUndefined();
    });

    it('Skenario 14: returns 404 for non-existent id', async () => {
      const res = await request(app).delete('/api/transactions/999');
      expect(res.status).toBe(404);
    });
  });
});
