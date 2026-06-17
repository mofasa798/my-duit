const cron = require('node-cron');
const reportService = require('../services/reportService');
const db = require('../config/database');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');
const audit = require('../services/auditService');
const os = require('os');

const formatDate = (d) => d.toISOString().slice(0, 10);

const computePeriodForLastWeek = () => {
  // If running on Sunday, we want previous week Sunday..Saturday
  const now = new Date();
  // set to yesterday (Saturday) as period end when called on Sunday
  const saturday = new Date(now);
  saturday.setDate(now.getDate() - 1);
  saturday.setHours(0, 0, 0, 0);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() - 6);
  return { periodStart: formatDate(sunday), periodEnd: formatDate(saturday) };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const runWeeklyReport = async (periodStartArg, periodEndArg) => {
  const { periodStart, periodEnd } =
    periodStartArg && periodEndArg
      ? { periodStart: periodStartArg, periodEnd: periodEndArg }
      : computePeriodForLastWeek();

  const maxRetries = parseInt(process.env.REPORT_RETRY_MAX || '3', 10);
  const baseMs = parseInt(process.env.REPORT_RETRY_BASE_MS || '500', 10);

  const startTime = Date.now();

  // Idempotency: check if report already exists for this period
  try {
    const existing = await db.allAsync(
      `SELECT id FROM reports WHERE report_type = ? AND period_start = ? AND period_end = ? LIMIT 1`,
      ['weekly', periodStart, periodEnd]
    );
    if (existing && existing.length > 0) {
      logger.info(
        { periodStart, periodEnd, reportId: existing[0].id },
        'Weekly report already exists; skipping save'
      );
      metrics.emitSkipped('weekly', { periodStart, periodEnd });
      await audit.recordEvent({
        reportId: existing[0].id,
        action: 'skipped',
        periodStart,
        periodEnd,
        details: { reason: 'already_exists' },
      });
      const report = await reportService.computeWeeklyReport(
        periodStart,
        periodEnd
      );
      return report;
    }
  } catch (err) {
    logger.error(
      { err, periodStart, periodEnd },
      'Failed to check existing reports'
    );
    // continue to attempt report generation
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      // record start attempt
      await audit.recordEvent({
        action: 'started',
        periodStart,
        periodEnd,
        details: { attempt: attempt + 1 },
      });
      attempt += 1;
      logger.info({ attempt, periodStart, periodEnd }, 'Running weekly report');

      const report = await reportService.computeWeeklyReport(
        periodStart,
        periodEnd
      );
      await reportService.saveReport(
        'weekly',
        periodStart,
        periodEnd,
        report.totalIncome,
        report.totalExpense,
        report.netSavings
      );

      const durationMs = Date.now() - startTime;
      const durationSec = durationMs / 1000;
      logger.info(
        { periodStart, periodEnd, durationMs, durationSec, attempt },
        'Weekly report generated successfully'
      );
      metrics.emitGenerated('weekly', { periodStart, periodEnd });
      metrics.observeDuration(
        'weekly',
        { periodStart, periodEnd },
        durationSec
      );
      metrics.recordLastReportTimestamp('weekly', new Date());
      await audit.recordEvent({
        reportId: null,
        action: 'generated',
        periodStart,
        periodEnd,
        details: { durationMs, attempt },
      });
      return report;
    } catch (err) {
      logger.error(
        { err, attempt, periodStart, periodEnd },
        'Weekly report attempt failed'
      );
      if (attempt > maxRetries) {
        logger.error(
          { periodStart, periodEnd, attempts: attempt },
          'Weekly report failed after max retries'
        );
        metrics.emitFailed('weekly', { periodStart, periodEnd }, attempt);
        await audit.recordEvent({
          action: 'failed',
          periodStart,
          periodEnd,
          details: { attempts: attempt, error: err.message },
        });
        throw err;
      }
      const backoff = baseMs * Math.pow(2, attempt - 1);
      logger.info({ backoff, attempt }, 'Retrying after backoff');
      await sleep(backoff);
    }
  }
};

const scheduleWeekly = () => {
  // Every Sunday at 00:05
  cron.schedule('5 0 * * 0', async () => {
    const lockService = require('../services/lockService');
    const lockName = 'weekly_report_scheduler';
    const owner = `${os.hostname()}_${process.pid}`;
    const ttlMs = parseInt(process.env.SCHEDULER_LOCK_TTL_MS || '600000', 10); // default 10 minutes

    try {
      const acquired = await lockService.acquireLock(lockName, owner, ttlMs);
      if (!acquired) {
        logger.info(
          { owner },
          'Scheduler lock not acquired; skipping scheduled run'
        );
        metrics.emitLockFailed('weekly');
        return;
      }

      logger.info(
        { owner },
        'Scheduler lock acquired; executing scheduled job'
      );
      metrics.emitLockAcquired('weekly');
      await runWeeklyReport();

      // Release lock
      await lockService.releaseLock(lockName, owner);
    } catch (err) {
      logger.error({ err }, 'Scheduled weekly report job failed');
      metrics.emitLockFailed('weekly');
    }
  });
};

module.exports = {
  runWeeklyReport,
  scheduleWeekly,
};
