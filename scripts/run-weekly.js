const weeklyJob = require('../jobs/weeklyReport');

(async () => {
  try {
    console.log('Running weekly report now...');
    const report = await weeklyJob.runWeeklyReport();
    console.log('Report result:', report);
    process.exit(0);
  } catch (err) {
    console.error('Error running weekly report:', err);
    process.exit(1);
  }
})();
