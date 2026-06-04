/**
 * middleware/validation.js
 *
 * Reusable validation middleware untuk request body.
 */

const isValidDate = (s) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

/**
 * Shared validator untuk periodStart / periodEnd.
 * Dipakai oleh weekly dan monthly report routes.
 */
const validatePeriodInput = (req, res, next) => {
  const { periodStart, periodEnd } = req.body || {};

  // Keduanya tidak diisi → pakai periode default, lanjut
  if (!periodStart && !periodEnd) return next();

  // Salah satu diisi → wajib keduanya
  if (!periodStart || !periodEnd) {
    return res.status(400).json({
      success: false,
      error: 'Both periodStart and periodEnd are required when providing a custom period.',
    });
  }

  // Format harus YYYY-MM-DD
  if (!isValidDate(periodStart) || !isValidDate(periodEnd)) {
    return res.status(400).json({
      success: false,
      error: 'Dates must be in YYYY-MM-DD format.',
    });
  }

  // periodStart tidak boleh lebih besar dari periodEnd
  if (new Date(periodStart) > new Date(periodEnd)) {
    return res.status(400).json({
      success: false,
      error: 'periodStart must be before or equal to periodEnd.',
    });
  }

  next();
};

// Alias agar route yang sudah ada tidak perlu diubah
const validateWeeklyRun = validatePeriodInput;
const validateMonthlyRun = validatePeriodInput;

module.exports = { validatePeriodInput, validateWeeklyRun, validateMonthlyRun };
