const { allAsync, getAsync, runAsync } = require('../config/database');

const buildFilterQuery = (filters) => {
  const conditions = [];
  const values = [];

  if (filters.category_id) {
    conditions.push('t.category_id = ?');
    values.push(filters.category_id);
  }

  if (filters.type) {
    conditions.push('c.type = ?');
    values.push(filters.type);
  }

  if (filters.date_from) {
    conditions.push('t.transaction_date >= ?');
    values.push(filters.date_from);
  }

  if (filters.date_to) {
    conditions.push('t.transaction_date <= ?');
    values.push(filters.date_to);
  }

  if (filters.search) {
    conditions.push('(t.description LIKE ? OR c.name LIKE ?)');
    values.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, values };
};

const getAllTransactions = async (filters = {}) => {
  const { whereClause, values } = buildFilterQuery(filters);
  const sql = `
    SELECT
      t.id,
      t.description,
      t.amount,
      t.transaction_date AS date,
      t.category_id,
      c.name AS category,
      c.type
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    ${whereClause}
    ORDER BY t.transaction_date DESC, t.created_at DESC
  `;

  return allAsync(sql, values);
};

const getTransactionById = async (id) => {
  return getAsync(
    `SELECT t.id, t.description, t.amount, t.transaction_date AS date, t.category_id, c.name AS category, c.type
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE t.id = ?`,
    [id]
  );
};

const createTransaction = async ({ category_id, amount, description, transaction_date }) => {
  return runAsync(
    `INSERT INTO transactions (category_id, amount, description, transaction_date)
     VALUES (?, ?, ?, ?)`,
    [category_id, amount, description || '', transaction_date]
  );
};

const updateTransaction = async (id, { category_id, amount, description, transaction_date }) => {
  return runAsync(
    `UPDATE transactions
     SET category_id = ?, amount = ?, description = ?, transaction_date = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [category_id, amount, description || '', transaction_date, id]
  );
};

const deleteTransaction = async (id) => {
  return runAsync('DELETE FROM transactions WHERE id = ?', [id]);
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
