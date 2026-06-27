const employeeRepository = require('../repositories/employeeRepository');
const leaveRepository = require('../repositories/leaveRepository');
const attendanceRepository = require('../repositories/attendanceRepository');
const payrollRepository = require('../repositories/payrollRepository');
const departmentRepository = require('../repositories/departmentRepository');
const auditLogRepository = require('../repositories/auditLogRepository');

class DashboardService {
  async getAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalEmployees,
      activeEmployees,
      employeesByStatus,
      employeesByDepartment,
      leaveByStatus,
      todayAttendance,
      monthlyPayroll,
      departmentCount,
      recentAuditLogs,
    ] = await Promise.all([
      employeeRepository.count({}),
      employeeRepository.count({ status: 'active' }),
      employeeRepository.countByStatus(),
      employeeRepository.countByDepartment(),
      leaveRepository.countByStatus(),
      attendanceRepository.count({
        date: { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: new Date(now.setHours(23, 59, 59, 999)) },
      }),
      payrollRepository.getPayrollSummary(now.getFullYear()),
      departmentRepository.count({ isActive: true }),
      auditLogRepository.find({}, { limit: 10, sort: { createdAt: -1 }, populate: [{ path: 'user', select: 'email role' }] }),
    ]);

    const attendanceThisMonth = await attendanceRepository.count({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const pendingLeaves = await leaveRepository.count({ status: 'pending' });

    return {
      overview: {
        totalEmployees,
        activeEmployees,
        departmentCount,
        pendingLeaves,
        todayAttendance,
        attendanceThisMonth,
      },
      employeesByStatus: employeesByStatus.map((s) => ({ status: s._id, count: s.count })),
      employeesByDepartment,
      leaveByStatus: leaveByStatus.map((s) => ({ status: s._id, count: s.count })),
      monthlyPayroll: monthlyPayroll.map((p) => ({ month: p._id, totalNet: p.totalNet, count: p.count })),
      recentActivity: recentAuditLogs,
    };
  }

  async getEmployeeDashboard(userId) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) return null;

    const now = new Date();
    const [attendanceStats, pendingLeaves, recentPayroll] = await Promise.all([
      attendanceRepository.getMonthlyStats(employee._id, now.getMonth() + 1, now.getFullYear()),
      leaveRepository.count({ employee: employee._id, status: 'pending' }),
      payrollRepository.find({ employee: employee._id }, { limit: 3, sort: { createdAt: -1 } }),
    ]);

    return {
      employee: {
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        leaveBalance: employee.leaveBalance,
      },
      attendanceStats: attendanceStats.map((s) => ({ status: s._id, count: s.count })),
      pendingLeaves,
      recentPayroll,
    };
  }
}

module.exports = new DashboardService();
