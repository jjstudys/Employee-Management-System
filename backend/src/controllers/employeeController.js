const employeeService = require('../services/employeeService');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await employeeService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getById = catchAsync(async (req, res) => {
  const employee = await employeeService.getById(req.params.id);
  res.json({ success: true, data: employee });
});

const create = catchAsync(async (req, res) => {
  const employee = await employeeService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data: employee });
});

const update = catchAsync(async (req, res) => {
  const employee = await employeeService.update(req.params.id, req.body, req.user._id);
  res.json({ success: true, data: employee });
});

const uploadPhoto = catchAsync(async (req, res) => {
  const result = await employeeService.uploadPhoto(req.params.id, req.file, req.user._id);
  res.json({ success: true, data: result });
});

const remove = catchAsync(async (req, res) => {
  await employeeService.delete(req.params.id, req.user._id);
  res.json({ success: true, message: 'Employee terminated successfully' });
});

module.exports = { getAll, getById, create, update, uploadPhoto, remove };
