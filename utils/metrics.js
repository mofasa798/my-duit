const client = require('prom-client');
const logger = require('./logger');

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const generatedCounter = new client.Counter({
  name: 'reports_generated_total',
  help: 'Total number of reports generated',
  labelNames: ['reportType', 'periodStart', 'periodEnd'],
});

const failedCounter = new client.Counter({
  name: 'reports_failed_total',
  help: 'Total number of reports failed after retries',
  labelNames: ['reportType', 'periodStart', 'periodEnd', 'attempts'],
});

const skippedCounter = new client.Counter({
  name: 'reports_skipped_total',
  help: 'Total number of reports skipped due to idempotency',
  labelNames: ['reportType', 'periodStart', 'periodEnd'],
});

const durationHistogram = new client.Histogram({
  name: 'reports_duration_seconds',
  help: 'Duration in seconds to generate a report',
  labelNames: ['reportType', 'periodStart', 'periodEnd'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const lockAcquiredCounter = new client.Counter({
  name: 'scheduler_lock_acquired_total',
  help: 'Total number of times scheduler lock was acquired',
  labelNames: ['reportType'],
});

const lockFailedCounter = new client.Counter({
  name: 'scheduler_lock_failed_total',
  help: 'Total number of times scheduler lock acquisition failed',
  labelNames: ['reportType'],
});

const auditEventCounter = new client.Counter({
  name: 'report_audit_events_total',
  help: 'Total number of report audit events recorded',
  labelNames: ['action'],
});

const lastReportTimestamp = new client.Gauge({
  name: 'report_last_generated_timestamp_seconds',
  help: 'Timestamp of the last generated report',
  labelNames: ['reportType'],
});

register.registerMetric(generatedCounter);
register.registerMetric(failedCounter);
register.registerMetric(skippedCounter);
register.registerMetric(durationHistogram);
register.registerMetric(lockAcquiredCounter);
register.registerMetric(lockFailedCounter);
register.registerMetric(auditEventCounter);
register.registerMetric(lastReportTimestamp);

const emitGenerated = (reportType, labels) => {
  generatedCounter.inc({ reportType, ...labels }, 1);
  logger.info(
    { metric: 'reports_generated_total', reportType, labels },
    'metric_emitted'
  );
};

const emitFailed = (reportType, labels, attempts) => {
  failedCounter.inc({ reportType, ...labels, attempts: String(attempts) }, 1);
  logger.info(
    { metric: 'reports_failed_total', reportType, labels, attempts },
    'metric_emitted'
  );
};

const emitSkipped = (reportType, labels) => {
  skippedCounter.inc({ reportType, ...labels }, 1);
  logger.info(
    { metric: 'reports_skipped_total', reportType, labels },
    'metric_emitted'
  );
};

const observeDuration = (reportType, labels, seconds) => {
  durationHistogram.observe({ reportType, ...labels }, seconds);
};

const emitLockAcquired = (reportType) => {
  lockAcquiredCounter.inc({ reportType });
  logger.info(
    { metric: 'scheduler_lock_acquired_total', reportType },
    'metric_emitted'
  );
};

const emitLockFailed = (reportType) => {
  lockFailedCounter.inc({ reportType });
  logger.info(
    { metric: 'scheduler_lock_failed_total', reportType },
    'metric_emitted'
  );
};

const emitAuditEvent = (action) => {
  auditEventCounter.inc({ action });
  logger.info(
    { metric: 'report_audit_events_total', action },
    'metric_emitted'
  );
};

const recordLastReportTimestamp = (reportType, timestamp) => {
  const seconds = Math.floor(timestamp.getTime() / 1000);
  lastReportTimestamp.set({ reportType }, seconds);
  logger.info(
    { metric: 'report_last_generated_timestamp_seconds', reportType, seconds },
    'metric_emitted'
  );
};

const metricsMiddleware = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    logger.error({ err }, 'Failed to expose metrics');
    res.status(500).end(err.message);
  }
};

module.exports = {
  emitGenerated,
  emitFailed,
  emitSkipped,
  observeDuration,
  emitLockAcquired,
  emitLockFailed,
  emitAuditEvent,
  recordLastReportTimestamp,
  metricsMiddleware,
};
