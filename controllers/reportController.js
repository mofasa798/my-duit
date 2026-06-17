const reportService = require('../services/reportService');
const weeklyJob = require('../jobs/weeklyReport');
const monthlyJob = require('../jobs/monthlyReport');

const listReports = async (req, res, next) => {
  try {
    const reports = await require('../config/database').allAsync(
      'SELECT * FROM reports ORDER BY generated_at DESC'
    );
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

const runWeekly = async (req, res, next) => {
  try {
    const { periodStart, periodEnd } = req.body || {};
    const report = await weeklyJob.runWeeklyReport(periodStart, periodEnd);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

const runMonthly = async (req, res, next) => {
  try {
    const { periodStart, periodEnd } = req.body || {};
    const report = await monthlyJob.runMonthlyReport(periodStart, periodEnd);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

module.exports = { listReports, runWeekly, runMonthly };
