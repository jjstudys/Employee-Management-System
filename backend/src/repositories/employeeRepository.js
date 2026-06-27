const BaseRepository = require('./BaseRepository');
const Employee = require('../models/Employee');

const populateFields = [
  { path: 'user', select: 'email role isActive' },
  { path: 'department', select: 'name code' },
  { path: 'designation', select: 'title code level' },
  { path: 'manager', select: 'firstName lastName employeeId' },
  { path: 'shift', select: 'name code startTime endTime' },
];

class EmployeeRepository extends BaseRepository {
  constructor() {
    super(Employee);
  }

  findByUserId(userId) {
    return Employee.findOne({ user: userId }).populate(populateFields);
  }

  findByEmployeeId(employeeId) {
    return Employee.findOne({ employeeId }).populate(populateFields);
  }

  findAll(filter, options) {
    return this.find(filter, { ...options, populate: populateFields });
  }

  findByIdPopulated(id) {
    return this.findById(id, populateFields);
  }

  countByStatus() {
    return Employee.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }

  countByDepartment() {
    return Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $project: { department: '$dept.name', count: 1 } },
    ]);
  }
}

module.exports = new EmployeeRepository();
