const cron = require('node-cron');
const reportService = require('../services/reportService');

const formatDate = (d) => d.toISOString().slice(0, 10);

const computePeriodForLastWeek = () => {
  // If running on Sunday, we want previous week Sunday..Saturday
  const now = new Date();
  // set to yesterday (Saturday) as period end when called on Sunday
  const saturday = new Date(now);
  saturday.setDate(now.getDate() - 1);
  saturday.setHours(0,0,0,0);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() - 6);
  return { periodStart: formatDate(sunday), periodEnd: formatDate(saturday) };
};

const runWeeklyReport = async (periodStartArg, periodEndArg) => {
  const { periodStart, periodEnd } = periodStartArg && periodEndArg ? { periodStart: periodStartArg, periodEnd: periodEndArg } : computePeriodForLastWeek();
  const report = await reportService.computeWeeklyReport(periodStart, periodEnd);
  await reportService.saveReport('weekly', periodStart, periodEnd, report.totalIncome, report.totalExpense, report.netSavings);
  console.log('Weekly report generated for', periodStart, 'to', periodEnd);
  return report;
};

const scheduleWeekly = () => {
  // Every Sunday at 00:05
  cron.schedule('5 0 * * 0', async () => {
    try {
      await runWeeklyReport();
    } catch (err) {
      console.error('Weekly report job failed:', err);
    }
  });
};

module.exports = {
  runWeeklyReport,
  scheduleWeekly,
};
