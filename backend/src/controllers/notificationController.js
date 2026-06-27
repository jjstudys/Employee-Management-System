const notificationService = require('../services/notificationService');
const notificationRepository = require('../repositories/notificationRepository');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await notificationService.getNotifications(req.user._id, req.query);
  res.json({ success: true, ...result });
});

const markAsRead = catchAsync(async (req, res) => {
  const data = await notificationRepository.markAsRead(req.params.id, req.user._id);
  res.json({ success: true, data });
});

const markAllAsRead = catchAsync(async (req, res) => {
  await notificationRepository.markAllAsRead(req.user._id);
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getAll, markAsRead, markAllAsRead };
