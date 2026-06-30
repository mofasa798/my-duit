const dashboardService = require('../services/dashboardService');

const getDashboard = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary(req.user.id);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};
