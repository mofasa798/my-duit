const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

const validateWeeklyRun = (req, res, next) => {
  const { periodStart, periodEnd } = req.body || {};
  if (!periodStart && !periodEnd) return next();
  if (!periodStart || !periodEnd) return res.status(400).json({ success: false, error: 'Both periodStart and periodEnd are required when providing a custom period.' });
  if (!isValidDate(periodStart) || !isValidDate(periodEnd)) return res.status(400).json({ success: false, error: 'Dates must be in YYYY-MM-DD format.' });
  if (new Date(periodStart) > new Date(periodEnd)) return res.status(400).json({ success: false, error: 'periodStart must be before or equal to periodEnd.' });
  next();
};

const validateMonthlyRun = (req, res, next) => {
  const { periodStart, periodEnd } = req.body || {};
  if (!periodStart && !periodEnd) return next();
  if (!periodStart || !periodEnd) return res.status(400).json({ success: false, error: 'Both periodStart and periodEnd are required when providing a custom period for monthly report.' });
  if (!isValidDate(periodStart) || !isValidDate(periodEnd)) return res.status(400).json({ success: false, error: 'Dates must be in YYYY-MM-DD format.' });
  if (new Date(periodStart) > new Date(periodEnd)) return res.status(400).json({ success: false, error: 'periodStart must be before or equal to periodEnd.' });
  next();
};

module.exports = { validateWeeklyRun, validateMonthlyRun };
