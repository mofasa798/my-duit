const cron = require('node-cron');
const reportService = require('../services/reportService');
const db = require('../config/database');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');
const audit = require('../services/auditService');
const os = require('os');

const formatDate = (d) => d.toISOString().slice(0, 10);

const computePeriodForLastMonth = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Last day of previous month
  const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0);
  const periodEnd = formatDate(lastDayOfPrevMonth);
  
  // First day of previous month
  const firstDayOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
  const periodStart = formatDate(firstDayOfPrevMonth);
  
  return { periodStart, periodEnd };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const runMonthlyReport = async (periodStartArg, periodEndArg) => {
  const { periodStart, periodEnd } = periodStartArg && periodEndArg ? { periodStart: periodStartArg, periodEnd: periodEndArg } : computePeriodForLastMonth();

  const maxRetries = parseInt(process.env.REPORT_RETRY_MAX || '3', 10);
  const baseMs = parseInt(process.env.REPORT_RETRY_BASE_MS || '500', 10);

  const startTime = Date.now();

  // Idempotency: check if report already exists for this period
  try {
    const existing = await db.allAsync(
      `SELECT id FROM reports WHERE report_type = ? AND period_start = ? AND period_end = ? LIMIT 1`,
      ['monthly', periodStart, periodEnd]
    );
    if (existing && existing.length > 0) {
      logger.info({ periodStart, periodEnd, reportId: existing[0].id }, 'Monthly report already exists; skipping save');
      metrics.emitSkipped('monthly', { periodStart, periodEnd });
      await audit.recordEvent({ reportId: existing[0].id, action: 'skipped', periodStart, periodEnd, details: { reason: 'already_exists' } });
      const report = await reportService.computeWeeklyReport(periodStart, periodEnd);
      return report;
    }
  } catch (err) {
    logger.error({ err, periodStart, periodEnd }, 'Failed to check existing monthly reports');
    // continue to attempt report generation
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      // record start attempt
      await audit.recordEvent({ action: 'started', periodStart, periodEnd, details: { attempt: attempt + 1, reportType: 'monthly' } });
      attempt += 1;
      logger.info({ attempt, periodStart, periodEnd }, 'Running monthly report');

      const report = await reportService.computeMonthlyReport(periodStart, periodEnd);
      await reportService.saveReport('monthly', periodStart, periodEnd, report.totalIncome, report.totalExpense, report.netSavings);

      const durationMs = Date.now() - startTime;
      const durationSec = durationMs / 1000;
      logger.info({ periodStart, periodEnd, durationMs, durationSec, attempt }, 'Monthly report generated successfully');
      metrics.emitGenerated('monthly', { periodStart, periodEnd });
      metrics.observeDuration('monthly', { periodStart, periodEnd }, durationSec);
      metrics.recordLastReportTimestamp('monthly', new Date());
      await audit.recordEvent({ reportId: null, action: 'generated', periodStart, periodEnd, details: { durationMs, attempt, reportType: 'monthly' } });
      return report;
    } catch (err) {
      logger.error({ err, attempt, periodStart, periodEnd }, 'Monthly report attempt failed');
      if (attempt > maxRetries) {
        logger.error({ periodStart, periodEnd, attempts: attempt }, 'Monthly report failed after max retries');
        metrics.emitFailed('monthly', { periodStart, periodEnd }, attempt);
        await audit.recordEvent({ action: 'failed', periodStart, periodEnd, details: { attempts: attempt, error: err.message, reportType: 'monthly' } });
        throw err;
      }
      const backoff = baseMs * Math.pow(2, attempt - 1);
      logger.info({ backoff, attempt }, 'Retrying after backoff');
      await sleep(backoff);
    }
  }
};

const scheduleMonthly = () => {
  // Every 1st of the month at 00:10
  cron.schedule('10 0 1 * *', async () => {
    const lockService = require('../services/lockService');
    const lockName = 'monthly_report_scheduler';
    const owner = `${os.hostname()}_${process.pid}`;
    const ttlMs = parseInt(process.env.SCHEDULER_LOCK_TTL_MS || '600000', 10); // default 10 minutes

    try {
      const acquired = await lockService.acquireLock(lockName, owner, ttlMs);
      if (!acquired) {
        logger.info({ owner }, 'Scheduler lock not acquired; skipping scheduled monthly run');
        metrics.emitLockFailed('monthly');
        return;
      }

      logger.info({ owner }, 'Scheduler lock acquired; executing scheduled monthly job');
      metrics.emitLockAcquired('monthly');
      await runMonthlyReport();

      // Release lock
      await lockService.releaseLock(lockName, owner);
    } catch (err) {
      logger.error({ err }, 'Scheduled monthly report job failed');
      metrics.emitLockFailed('monthly');
    }
  });
};

module.exports = {
  runMonthlyReport,
  scheduleMonthly,
};
