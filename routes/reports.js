const express = require('express');
const { listReports, runWeekly } = require('../controllers/reportController');

const router = express.Router();

router.get('/', listReports);
router.post('/weekly/run', runWeekly);

module.exports = router;
