const shiftService = require('../services/shiftService');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await shiftService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getById = catchAsync(async (req, res) => {
  const data = await shiftService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await shiftService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await shiftService.update(req.params.id, req.body, req.user._id);
  res.json({ success: true, data });
});

const remove = catchAsync(async (req, res) => {
  await shiftService.delete(req.params.id, req.user._id);
  res.json({ success: true, message: 'Deleted successfully' });
});

module.exports = { getAll, getById, create, update, remove };
