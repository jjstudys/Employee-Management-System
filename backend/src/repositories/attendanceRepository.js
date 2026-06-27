const BaseRepository = require('./BaseRepository');
const Attendance = require('../models/Attendance');

const populateFields = [
  { path: 'employee', select: 'firstName lastName employeeId' },
  { path: 'shift', select: 'name startTime endTime' },
];

class AttendanceRepository extends BaseRepository {
  constructor() {
    super(Attendance);
  }

  findAll(filter, options) {
    return this.find(filter, { ...options, populate: populateFields });
  }

  findByEmployeeAndDate(employeeId, date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return Attendance.findOne({ employee: employeeId, date: { $gte: start, $lte: end } });
  }

  getMonthlyStats(employeeId, month, year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return Attendance.aggregate([
      { $match: { employee: employeeId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }
}

module.exports = new AttendanceRepository();
