const employeeRepository = require('../repositories/employeeRepository');
const attendanceRepository = require('../repositories/attendanceRepository');
const leaveRepository = require('../repositories/leaveRepository');
const payrollRepository = require('../repositories/payrollRepository');
const { exportToExcel, exportToPDF } = require('../utils/export');

class ReportService {
  async exportEmployees(format = 'excel') {
    const employees = await employeeRepository.findAll({}, { limit: 10000 });
    const columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    const rows = employees.map((e) => ({
      employeeId: e.employeeId,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      department: e.department?.name || '',
      status: e.status,
    }));

    if (format === 'pdf') {
      return exportToPDF('Employee Report', columns, rows);
    }
    return exportToExcel(columns, rows, 'Employees');
  }

  async exportAttendance(query, format = 'excel') {
    const filter = {};
    if (query.startDate) filter.date = { $gte: new Date(query.startDate) };
    if (query.endDate) {
      filter.date = { ...filter.date, $lte: new Date(query.endDate) };
    }
    if (query.employee) filter.employee = query.employee;

    const records = await attendanceRepository.findAll(filter, { limit: 10000 });
    const columns = [
      { header: 'Employee', key: 'employee', width: 25 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Check In', key: 'checkIn', width: 20 },
      { header: 'Check Out', key: 'checkOut', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Work Hours', key: 'workHours', width: 12 },
    ];

    const rows = records.map((r) => ({
      employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '',
      date: r.date?.toISOString().split('T')[0],
      checkIn: r.checkIn?.toISOString() || '',
      checkOut: r.checkOut?.toISOString() || '',
      status: r.status,
      workHours: r.workHours?.toFixed(2) || '0',
    }));

    if (format === 'pdf') return exportToPDF('Attendance Report', columns, rows);
    return exportToExcel(columns, rows, 'Attendance');
  }

  async exportLeaves(query, format = 'excel') {
    const filter = {};
    if (query.status) filter.status = query.status;
    const records = await leaveRepository.findAll(filter, { limit: 10000 });

    const columns = [
      { header: 'Employee', key: 'employee', width: 25 },
      { header: 'Type', key: 'leaveType', width: 15 },
      { header: 'Start', key: 'startDate', width: 15 },
      { header: 'End', key: 'endDate', width: 15 },
      { header: 'Days', key: 'totalDays', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    const rows = records.map((r) => ({
      employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '',
      leaveType: r.leaveType,
      startDate: r.startDate?.toISOString().split('T')[0],
      endDate: r.endDate?.toISOString().split('T')[0],
      totalDays: r.totalDays,
      status: r.status,
    }));

    if (format === 'pdf') return exportToPDF('Leave Report', columns, rows);
    return exportToExcel(columns, rows, 'Leaves');
  }

  async exportPayroll(query, format = 'excel') {
    const filter = {};
    if (query.month) filter.month = parseInt(query.month, 10);
    if (query.year) filter.year = parseInt(query.year, 10);

    const records = await payrollRepository.findAll(filter, { limit: 10000 });
    const columns = [
      { header: 'Employee', key: 'employee', width: 25 },
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Basic', key: 'basicSalary', width: 12 },
      { header: 'Net Salary', key: 'netSalary', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    const rows = records.map((r) => ({
      employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '',
      month: r.month,
      year: r.year,
      basicSalary: r.basicSalary,
      netSalary: r.netSalary,
      status: r.status,
    }));

    if (format === 'pdf') return exportToPDF('Payroll Report', columns, rows);
    return exportToExcel(columns, rows, 'Payroll');
  }
}

module.exports = new ReportService();
