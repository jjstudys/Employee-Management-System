const auditService = require('../services/auditService');
const catchAsync = require('../utils/catchAsync');

const getAuditLogs = catchAsync(async (req, res) => {
  const result = await auditService.getAuditLogs(req.query);
  res.json({ success: true, ...result });
});

const getActivities = catchAsync(async (req, res) => {
  const result = await auditService.getActivities(req.query);
  res.json({ success: true, ...result });
});

module.exports = { getAuditLogs, getActivities };
