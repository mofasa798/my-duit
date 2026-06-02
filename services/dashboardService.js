const { allAsync, getAsync } = require('../config/database');

const getDashboardSummary = async () => {
  const incomeResult = await getAsync(
    `SELECT COALESCE(SUM(t.amount), 0) AS totalIncome
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE c.type = 'income'`
  );

  const expenseResult = await getAsync(
    `SELECT COALESCE(SUM(t.amount), 0) AS totalExpense
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE c.type = 'expense'`
  );

  const transactions = await allAsync(
    `SELECT
       t.id,
       t.description,
       t.amount,
       t.transaction_date AS date,
       c.name AS category,
       c.type
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     ORDER BY t.transaction_date DESC, t.created_at DESC
     LIMIT 10`
  );

  const totalIncome = incomeResult.totalIncome || 0;
  const totalExpense = expenseResult.totalExpense || 0;
  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
    transactions,
  };
};

module.exports = {
  getDashboardSummary,
};
