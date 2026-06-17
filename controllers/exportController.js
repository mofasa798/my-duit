const db = require('../config/database');
const exportService = require('../services/exportService');

const exportTransactions = async (req, res, next) => {
  try {
    const transactions = await db.allAsync(`
      SELECT t.*, c.name as category_name 
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `);

    const csvString = exportService.exportTransactionsCSV(transactions);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transactions.csv'
    );
    res.send(csvString);
  } catch (err) {
    next(err);
  }
};

const exportReports = async (req, res, next) => {
  try {
    const reports = await db.allAsync(`
      SELECT * FROM reports ORDER BY generated_at DESC
    `);

    const csvString = exportService.exportReportsCSV(reports);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');
    res.send(csvString);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  exportTransactions,
  exportReports,
};
