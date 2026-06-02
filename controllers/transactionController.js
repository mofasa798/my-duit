const transactionService = require('../services/transactionService');

const getTransactions = async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      type: req.query.type,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      search: req.query.search,
    };

    const transactions = await transactionService.getAllTransactions(filters);
    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { category_id, amount, description, transaction_date } = req.body;

    if (!category_id || !amount || !transaction_date) {
      return res.status(400).json({
        success: false,
        message: 'category_id, amount, and transaction_date are required',
      });
    }

    const result = await transactionService.createTransaction({
      category_id,
      amount,
      description,
      transaction_date,
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.lastID,
        category_id,
        amount,
        description: description || '',
        transaction_date,
      },
    });
  } catch (error) {
    if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
      return res.status(400).json({ success: false, message: 'Invalid category_id' });
    }
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_id, amount, description, transaction_date } = req.body;

    if (!category_id || !amount || !transaction_date) {
      return res.status(400).json({
        success: false,
        message: 'category_id, amount, and transaction_date are required',
      });
    }

    const existing = await transactionService.getTransactionById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const result = await transactionService.updateTransaction(id, {
      category_id,
      amount,
      description,
      transaction_date,
    });

    if (result.changes === 0) {
      return res.status(400).json({ success: false, message: 'No transaction was updated' });
    }

    res.json({ success: true, data: { id: Number(id), category_id, amount, description: description || '', transaction_date } });
  } catch (error) {
    if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
      return res.status(400).json({ success: false, message: 'Invalid category_id' });
    }
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await transactionService.getTransactionById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await transactionService.deleteTransaction(id);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
