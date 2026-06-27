const documentService = require('../services/documentService');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await documentService.getAll(req.query, req.user);
  res.json({ success: true, ...result });
});

const getById = catchAsync(async (req, res) => {
  const data = await documentService.getById(req.params.id);
  res.json({ success: true, data });
});

const upload = catchAsync(async (req, res) => {
  const data = await documentService.upload(req.params.employeeId, req.file, req.body, req.user._id);
  res.status(201).json({ success: true, data });
});

const verify = catchAsync(async (req, res) => {
  const data = await documentService.verify(req.params.id, req.user._id);
  res.json({ success: true, data });
});

const remove = catchAsync(async (req, res) => {
  await documentService.delete(req.params.id, req.user._id);
  res.json({ success: true, message: 'Document deleted' });
});

module.exports = { getAll, getById, upload, verify, remove };
