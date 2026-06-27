const payrollService = require('../services/payrollService');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await payrollService.getAll(req.query, req.user);
  res.json({ success: true, ...result });
});

const getById = catchAsync(async (req, res) => {
  const data = await payrollService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await payrollService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data });
});

const process = catchAsync(async (req, res) => {
  const data = await payrollService.process(req.params.id, req.user._id);
  res.json({ success: true, data });
});

const markPaid = catchAsync(async (req, res) => {
  const data = await payrollService.markPaid(req.params.id, req.user._id);
  res.json({ success: true, data });
});

const generateBulk = catchAsync(async (req, res) => {
  const { month, year } = req.body;
  const data = await payrollService.generateBulk(month, year, req.user._id);
  res.status(201).json({ success: true, data });
});

module.exports = { getAll, getById, create, process, markPaid, generateBulk };
