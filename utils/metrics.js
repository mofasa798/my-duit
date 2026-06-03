const client = require('prom-client');
const logger = require('./logger');

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const generatedCounter = new client.Counter({
  name: 'reports_weekly_generated_total',
  help: 'Total number of weekly reports generated',
  labelNames: ['periodStart', 'periodEnd']
});

const failedCounter = new client.Counter({
  name: 'reports_weekly_failed_total',
  help: 'Total number of weekly reports failed after retries',
  labelNames: ['periodStart', 'periodEnd', 'attempts']
});

const skippedCounter = new client.Counter({
  name: 'reports_weekly_skipped_total',
  help: 'Total number of weekly reports skipped due to idempotency',
  labelNames: ['periodStart', 'periodEnd']
});

const durationHistogram = new client.Histogram({
  name: 'reports_weekly_duration_seconds',
  help: 'Duration in seconds to generate weekly report',
  labelNames: ['periodStart', 'periodEnd'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

register.registerMetric(generatedCounter);
register.registerMetric(failedCounter);
register.registerMetric(skippedCounter);
register.registerMetric(durationHistogram);

const emitGenerated = (labels) => {
  generatedCounter.inc(labels, 1);
  logger.info({ metric: 'reports_weekly_generated_total', labels }, 'metric_emitted');
};

const emitFailed = (labels, attempts) => {
  failedCounter.inc({ ...labels, attempts: String(attempts) }, 1);
  logger.info({ metric: 'reports_weekly_failed_total', labels, attempts }, 'metric_emitted');
};

const emitSkipped = (labels) => {
  skippedCounter.inc(labels, 1);
  logger.info({ metric: 'reports_weekly_skipped_total', labels }, 'metric_emitted');
};

const observeDuration = (labels, seconds) => {
  durationHistogram.observe(labels, seconds);
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

module.exports = { emitGenerated, emitFailed, emitSkipped, observeDuration, metricsMiddleware };
