const dashboardService = require('../services/dashboardService');
const catchAsync = require('../utils/catchAsync');

const getAnalytics = catchAsync(async (req, res) => {
  const data = await dashboardService.getAnalytics();
  res.json({ success: true, data });
});

const getEmployeeDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getEmployeeDashboard(req.user._id);
  res.json({ success: true, data });
});

module.exports = { getAnalytics, getEmployeeDashboard };
