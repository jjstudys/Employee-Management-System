const attendanceService = require('../services/attendanceService');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await attendanceService.getAll(req.query, req.user);
  res.json({ success: true, ...result });
});

const checkIn = catchAsync(async (req, res) => {
  const data = await attendanceService.checkIn(req.user._id, req.body);
  res.json({ success: true, data });
});

const checkOut = catchAsync(async (req, res) => {
  const data = await attendanceService.checkOut(req.user._id, req.body);
  res.json({ success: true, data });
});

const markAttendance = catchAsync(async (req, res) => {
  const data = await attendanceService.markAttendance(req.body, req.user._id);
  res.status(201).json({ success: true, data });
});

const getStats = catchAsync(async (req, res) => {
  const { employeeId, month, year } = req.query;
  const data = await attendanceService.getEmployeeStats(employeeId, parseInt(month, 10), parseInt(year, 10));
  res.json({ success: true, data });
});

module.exports = { getAll, checkIn, checkOut, markAttendance, getStats };
