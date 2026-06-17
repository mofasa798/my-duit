const express = require('express');
const {
  listReports,
  runWeekly,
  runMonthly,
} = require('../controllers/reportController');
const {
  validateWeeklyRun,
  validateMonthlyRun,
} = require('../middleware/validation');

const router = express.Router();

router.get('/', listReports);
router.post('/weekly/run', validateWeeklyRun, runWeekly);
router.post('/monthly/run', validateMonthlyRun, runMonthly);

module.exports = router;
