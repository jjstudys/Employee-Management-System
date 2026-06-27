const departmentService = require('../services/departmentService');
const catchAsync = require('../utils/catchAsync');

const crud = (service) => ({
  getAll: catchAsync(async (req, res) => {
    const result = await service.getAll(req.query);
    res.json({ success: true, ...result });
  }),
  getById: catchAsync(async (req, res) => {
    const data = await service.getById(req.params.id);
    res.json({ success: true, data });
  }),
  create: catchAsync(async (req, res) => {
    const data = await service.create(req.body, req.user._id);
    res.status(201).json({ success: true, data });
  }),
  update: catchAsync(async (req, res) => {
    const data = await service.update(req.params.id, req.body, req.user._id);
    res.json({ success: true, data });
  }),
  remove: catchAsync(async (req, res) => {
    await service.delete(req.params.id, req.user._id);
    res.json({ success: true, message: 'Deleted successfully' });
  }),
});

module.exports = {
  department: crud(departmentService),
};
