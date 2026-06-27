const leaveService = require('../services/leaveService');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await leaveService.getAll(req.query, req.user);
  res.json({ success: true, ...result });
});

const getById = catchAsync(async (req, res) => {
  const data = await leaveService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await leaveService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data });
});

const approve = catchAsync(async (req, res) => {
  const data = await leaveService.approve(req.params.id, req.user._id, req.user.role, req.body);
  res.json({ success: true, data });
});

const cancel = catchAsync(async (req, res) => {
  const data = await leaveService.cancel(req.params.id, req.user._id);
  res.json({ success: true, data });
});

module.exports = { getAll, getById, create, approve, cancel };
