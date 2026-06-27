const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await userService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getById = catchAsync(async (req, res) => {
  const data = await userService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await userService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await userService.update(req.params.id, req.body, req.user._id);
  res.json({ success: true, data });
});

const remove = catchAsync(async (req, res) => {
  await userService.delete(req.params.id, req.user._id);
  res.json({ success: true, message: 'User deactivated' });
});

module.exports = { getAll, getById, create, update, remove };
