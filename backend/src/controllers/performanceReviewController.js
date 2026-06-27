const performanceReviewService = require('../services/performanceReviewService');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await performanceReviewService.getAll(req.query, req.user);
  res.json({ success: true, ...result });
});

const getById = catchAsync(async (req, res) => {
  const data = await performanceReviewService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await performanceReviewService.create(req.body, req.user._id);
  res.status(201).json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await performanceReviewService.update(req.params.id, req.body, req.user._id);
  res.json({ success: true, data });
});

const submit = catchAsync(async (req, res) => {
  const data = await performanceReviewService.submit(req.params.id, req.user._id);
  res.json({ success: true, data });
});

const acknowledge = catchAsync(async (req, res) => {
  const data = await performanceReviewService.acknowledge(req.params.id, req.user._id);
  res.json({ success: true, data });
});

module.exports = { getAll, getById, create, update, submit, acknowledge };
