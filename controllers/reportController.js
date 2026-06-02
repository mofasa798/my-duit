const reportService = require('../services/reportService');
const weeklyJob = require('../jobs/weeklyReport');

const listReports = async (req, res, next) => {
  try {
    const reports = await require('../config/database').allAsync('SELECT * FROM reports ORDER BY generated_at DESC');
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

const runWeekly = async (req, res, next) => {
  try {
    const report = await weeklyJob.runWeeklyReport();
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

module.exports = { listReports, runWeekly };
