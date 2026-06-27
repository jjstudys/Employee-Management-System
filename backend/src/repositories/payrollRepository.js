const BaseRepository = require('./BaseRepository');
const Payroll = require('../models/Payroll');

class PayrollRepository extends BaseRepository {
  constructor() {
    super(Payroll);
  }

  findAll(filter, options) {
    return this.find(filter, {
      ...options,
      populate: [{ path: 'employee', select: 'firstName lastName employeeId department' }],
    });
  }

  getPayrollSummary(year) {
    return Payroll.aggregate([
      { $match: { year, status: 'paid' } },
      {
        $group: {
          _id: '$month',
          totalNet: { $sum: '$netSalary' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

module.exports = new PayrollRepository();
