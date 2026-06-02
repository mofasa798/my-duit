const express = require('express');
const { listReports, runWeekly } = require('../controllers/reportController');
const { validateWeeklyRun } = require('../middleware/validation');

const router = express.Router();

router.get('/', listReports);
router.post('/weekly/run', validateWeeklyRun, runWeekly);

module.exports = router;
