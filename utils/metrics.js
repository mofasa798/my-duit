const logger = require('./logger');

// Simple metric emission stub.
// Replace implementation to send metrics to Prometheus, Datadog, etc.
const emitMetric = (name, value = 1, labels = {}) => {
  // Log the metric as a structured event for now
  logger.info({ metric: name, value, labels }, 'metric_emitted');
};

module.exports = { emitMetric };
