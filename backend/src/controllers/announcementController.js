const announcementService = require('../services/announcementService');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await announcementService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getActive = catchAsync(async (req, res) => {
  const data = await announcementService.getActive(req.user);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await announcementService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await announcementService.update(req.params.id, req.body, req.user._id);
  res.json({ success: true, data });
});

const remove = catchAsync(async (req, res) => {
  await announcementService.delete(req.params.id, req.user._id);
  res.json({ success: true, message: 'Announcement deactivated' });
});

module.exports = { getAll, getActive, create, update, remove };
