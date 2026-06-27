const reportService = require('../services/reportService');
const catchAsync = require('../utils/catchAsync');

const exportReport = (type) =>
  catchAsync(async (req, res) => {
    const format = req.query.format || 'excel';
    let buffer;
    let contentType;
    let filename;

    switch (type) {
      case 'employees':
        buffer = await reportService.exportEmployees(format);
        filename = `employees.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        break;
      case 'attendance':
        buffer = await reportService.exportAttendance(req.query, format);
        filename = `attendance.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        break;
      case 'leaves':
        buffer = await reportService.exportLeaves(req.query, format);
        filename = `leaves.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        break;
      case 'payroll':
        buffer = await reportService.exportPayroll(req.query, format);
        filename = `payroll.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    contentType =
      format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  });

module.exports = {
  exportEmployees: exportReport('employees'),
  exportAttendance: exportReport('attendance'),
  exportLeaves: exportReport('leaves'),
  exportPayroll: exportReport('payroll'),
};
