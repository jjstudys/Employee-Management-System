const BaseRepository = require('./BaseRepository');
const Leave = require('../models/Leave');

const populateFields = [
  { path: 'employee', select: 'firstName lastName employeeId department' },
  { path: 'approvals.approver', select: 'email role' },
];

class LeaveRepository extends BaseRepository {
  constructor() {
    super(Leave);
  }

  findAll(filter, options) {
    return this.find(filter, { ...options, populate: populateFields });
  }

  findByIdPopulated(id) {
    return this.findById(id, populateFields);
  }

  countByStatus() {
    return Leave.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }
}

module.exports = new LeaveRepository();
