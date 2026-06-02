const dashboardService = require('../services/dashboardService');

const getDashboard = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};
