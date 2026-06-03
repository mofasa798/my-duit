const express = require('express');
const { exportTransactions, exportReports } = require('../controllers/exportController');

const router = express.Router();

router.get('/transactions/csv', exportTransactions);
router.get('/reports/csv', exportReports);

module.exports = router;
