const attendanceRepository = require('../repositories/attendanceRepository');
const employeeRepository = require('../repositories/employeeRepository');
const { paginate, buildSort, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { trackActivity } = require('./activityService');

class AttendanceService {
  async getAll(query, user) {
    const { page, limit, skip } = paginate(query);
    const filter = {};

    if (user.role === 'employee') {
      const employee = await employeeRepository.findByUserId(user._id);
      if (!employee) throw new AppError('Employee profile not found', 404);
      filter.employee = employee._id;
    } else if (query.employee) {
      filter.employee = query.employee;
    }

    if (query.status) filter.status = query.status;
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = new Date(query.startDate);
      if (query.endDate) filter.date.$lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      attendanceRepository.findAll(filter, { skip, limit, sort: buildSort(query.sortBy || 'date', query.order) }),
      attendanceRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async checkIn(userId, location) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) throw new AppError('Employee profile not found', 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await attendanceRepository.findByEmployeeAndDate(employee._id, today);
    if (attendance?.checkIn) throw new AppError('Already checked in today', 400);

    const now = new Date();
    let status = 'present';

    if (employee.shift) {
      const shift = employee.shift;
      const [startH, startM] = (shift.startTime || '09:00').split(':').map(Number);
      const shiftStart = new Date(today);
      shiftStart.setHours(startH, startM + (shift.gracePeriodMinutes || 15), 0, 0);
      if (now > shiftStart) status = 'late';
    }

    if (attendance) {
      attendance.checkIn = now;
      attendance.status = status;
      attendance.location = attendance.location || {};
      if (location) attendance.location.checkIn = location;
      await attendance.save();
    } else {
      const newAttendance = {
        employee: employee._id,
        date: today,
        shift: employee.shift?._id || employee.shift,
        checkIn: now,
        status,
      };
      if (location) newAttendance.location = { checkIn: location };
      attendance = await attendanceRepository.create(newAttendance);
    }

    await trackActivity(userId, 'CHECK_IN', 'Attendance', attendance._id, 'Checked in');
    return attendance;
  }

  async checkOut(userId, location) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) throw new AppError('Employee profile not found', 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await attendanceRepository.findByEmployeeAndDate(employee._id, today);
    if (!attendance?.checkIn) throw new AppError('Must check in first', 400);
    if (attendance.checkOut) throw new AppError('Already checked out today', 400);

    const now = new Date();
    attendance.checkOut = now;
    attendance.location = attendance.location || {};
    if (location) attendance.location.checkOut = location;
    attendance.workHours = (now - attendance.checkIn) / (1000 * 60 * 60);

    await attendance.save();
    await trackActivity(userId, 'CHECK_OUT', 'Attendance', attendance._id, 'Checked out');
    return attendance;
  }

  async markAttendance(data, markedBy) {
    const attendance = await attendanceRepository.create(data);
    await trackActivity(markedBy, 'MARK_ATTENDANCE', 'Attendance', attendance._id, 'Manual attendance marked');
    return attendance;
  }

  async getEmployeeStats(employeeId, month, year) {
    return attendanceRepository.getMonthlyStats(employeeId, month, year);
  }
}

module.exports = new AttendanceService();
