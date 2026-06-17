const { runAsync } = require('../config/database');
const metrics = require('../utils/metrics');

const recordEvent = async ({
  reportId = null,
  action,
  periodStart = null,
  periodEnd = null,
  details = null,
}) => {
  const res = await runAsync(
    `INSERT INTO report_audit (report_id, action, period_start, period_end, details) VALUES (?, ?, ?, ?, ?)`,
    [
      reportId,
      action,
      periodStart,
      periodEnd,
      details ? JSON.stringify(details) : null,
    ]
  );
  // Emit metric for audit event
  metrics.emitAuditEvent(action);
  return res;
};

module.exports = { recordEvent };
