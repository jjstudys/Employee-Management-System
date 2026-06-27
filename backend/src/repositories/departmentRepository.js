const BaseRepository = require('./BaseRepository');
const Department = require('../models/Department');

class DepartmentRepository extends BaseRepository {
  constructor() {
    super(Department);
  }

  findActive() {
    return Department.find({ isActive: true }).populate('head', 'firstName lastName employeeId');
  }
}

module.exports = new DepartmentRepository();
