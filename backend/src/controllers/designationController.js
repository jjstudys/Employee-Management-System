const designationService = require('../services/designationService');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await designationService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getById = catchAsync(async (req, res) => {
  const data = await designationService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await designationService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await designationService.update(req.params.id, req.body, req.user._id);
  res.json({ success: true, data });
});

const remove = catchAsync(async (req, res) => {
  await designationService.delete(req.params.id, req.user._id);
  res.json({ success: true, message: 'Deleted successfully' });
});

module.exports = { getAll, getById, create, update, remove };
