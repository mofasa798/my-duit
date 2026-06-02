const { allAsync, runAsync } = require('../config/database');

const formatDate = (d) => d.toISOString().slice(0, 10);

const computeWeeklyReport = async (periodStart, periodEnd) => {
  // periodStart, periodEnd in YYYY-MM-DD
  const incomeRow = await allAsync(
    `SELECT COALESCE(SUM(t.amount), 0) AS total
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE c.type = 'income' AND t.transaction_date BETWEEN ? AND ?`,
    [periodStart, periodEnd]
  );

  const expenseRow = await allAsync(
    `SELECT COALESCE(SUM(t.amount), 0) AS total
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE c.type = 'expense' AND t.transaction_date BETWEEN ? AND ?`,
    [periodStart, periodEnd]
  );

  const topCategory = await allAsync(
    `SELECT c.name, COALESCE(SUM(t.amount),0) AS total
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE c.type = 'expense' AND t.transaction_date BETWEEN ? AND ?
     GROUP BY c.id, c.name
     ORDER BY total DESC
     LIMIT 1`,
    [periodStart, periodEnd]
  );

  const totalIncome = incomeRow[0] ? incomeRow[0].total : 0;
  const totalExpense = expenseRow[0] ? expenseRow[0].total : 0;
  const netSavings = totalIncome - totalExpense;
  const topSpendingCategory = topCategory[0] ? { name: topCategory[0].name, total: topCategory[0].total } : null;

  return { periodStart, periodEnd, totalIncome, totalExpense, netSavings, topSpendingCategory };
};

const saveReport = async (reportType, periodStart, periodEnd, totalIncome, totalExpense, netSavings) => {
  const res = await runAsync(
    `INSERT INTO reports (report_type, period_start, period_end, total_income, total_expense, net_savings) VALUES (?, ?, ?, ?, ?, ?)`,
    [reportType, periodStart, periodEnd, totalIncome, totalExpense, netSavings]
  );
  return res;
};

module.exports = {
  computeWeeklyReport,
  saveReport,
};
