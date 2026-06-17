jest.mock('../config/database', () => {
  return {
    allAsync: jest.fn((sql, params) => {
      if (sql.includes("c.type = 'income'")) {
        return Promise.resolve([{ total: 1000 }]);
      }
      if (sql.includes("c.type = 'expense'") && sql.includes('GROUP BY')) {
        return Promise.resolve([{ name: 'Food', total: 200 }]);
      }
      if (sql.includes("c.type = 'expense'")) {
        return Promise.resolve([{ total: 200 }]);
      }
      return Promise.resolve([]);
    }),
    runAsync: jest.fn(() => Promise.resolve({ lastID: 1 })),
  };
});
const reportService = require('../services/reportService');

describe('reportService.computeWeeklyReport', () => {
  test('computes totals and top category correctly', async () => {
    const res = await reportService.computeWeeklyReport(
      '2026-05-25',
      '2026-05-31'
    );
    expect(res.totalIncome).toBe(1000);
    expect(res.totalExpense).toBe(200);
    expect(res.netSavings).toBe(800);
    expect(res.topSpendingCategory).toEqual({ name: 'Food', total: 200 });
  });

  test('handles empty results', async () => {
    // Override mock to return zeros
    const db = require('../config/database');
    db.allAsync.mockImplementation((sql) => {
      if (sql.includes('GROUP BY')) return Promise.resolve([]);
      return Promise.resolve([{ total: 0 }]);
    });
    const res = await reportService.computeWeeklyReport(
      '2026-05-01',
      '2026-05-07'
    );
    expect(res.totalIncome).toBe(0);
    expect(res.totalExpense).toBe(0);
    expect(res.netSavings).toBe(0);
    expect(res.topSpendingCategory).toBeNull();
  });
});
