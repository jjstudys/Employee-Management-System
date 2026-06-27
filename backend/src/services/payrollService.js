const payrollRepository = require('../repositories/payrollRepository');
const employeeRepository = require('../repositories/employeeRepository');
const { paginate, buildSort, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');
const { trackActivity } = require('./activityService');
const { createNotification } = require('./notificationService');

const normalizeCurrency = (currency) => {
  if (!currency) return 'INR';
  const normalized = String(currency).trim().toUpperCase();
  if (['RS', 'RS.', '₹', 'INR', 'RUPEE', 'RUPEES'].includes(normalized)) return 'INR';
  return normalized;
};

const calculateNetSalary = (data) => {
  const allowances = Object.values(data.allowances || {}).reduce((s, v) => s + (v || 0), 0);
  const deductions = Object.values(data.deductions || {}).reduce((s, v) => s + (v || 0), 0);
  return data.basicSalary + allowances + (data.overtime || 0) + (data.bonus || 0) - deductions;
};

class PayrollService {
  async getAll(query, user) {
    const { page, limit, skip } = paginate(query);
    const filter = {};

    if (query.month) filter.month = parseInt(query.month, 10);
    if (query.year) filter.year = parseInt(query.year, 10);
    if (query.status) filter.status = query.status;
    if (query.employee) filter.employee = query.employee;

    if (user.role === ROLES.EMPLOYEE) {
      const emp = await employeeRepository.findByUserId(user._id);
      if (emp) filter.employee = emp._id;
    }

    const [data, total] = await Promise.all([
      payrollRepository.findAll(filter, { skip, limit, sort: buildSort(query.sortBy || 'createdAt', query.order) }),
      payrollRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getById(id) {
    const payroll = await payrollRepository.findById(id, [
      { path: 'employee', select: 'firstName lastName employeeId department' },
    ]);
    if (!payroll) throw new AppError('Payroll record not found', 404);
    return payroll;
  }

  async create(data, userId) {
    const netSalary = calculateNetSalary(data);
    const payroll = await payrollRepository.create({
      ...data,
      netSalary,
      currency: normalizeCurrency(data.currency),
      status: 'draft',
    });
    await trackActivity(userId, 'CREATE_PAYROLL', 'Payroll', payroll._id, 'Payroll created');
    return payroll;
  }

  async process(id, userId) {
    const payroll = await this.getById(id);
    if (payroll.status !== 'draft') throw new AppError('Payroll already processed', 400);

    payroll.status = 'processed';
    payroll.processedBy = userId;
    payroll.processedAt = new Date();
    await payroll.save();

    await trackActivity(userId, 'PROCESS_PAYROLL', 'Payroll', id, 'Payroll processed');
    return payroll;
  }

  async markPaid(id, userId) {
    const payroll = await this.getById(id);
    if (payroll.status !== 'processed') throw new AppError('Payroll must be processed first', 400);

    payroll.status = 'paid';
    payroll.paidAt = new Date();
    await payroll.save();

    const employee = payroll.employee;
    const empData = await employeeRepository.findByIdPopulated(employee._id || employee);
    await createNotification(empData.user._id || empData.user, {
      title: 'Salary Credited',
      message: `Your salary for ${payroll.month}/${payroll.year} has been paid`,
      type: 'payroll',
    });

    await trackActivity(userId, 'PAY_PAYROLL', 'Payroll', id, 'Payroll marked as paid');
    return payroll;
  }

  async generateBulk(month, year, userId) {
    const employees = await employeeRepository.find({ status: 'active' }, { limit: 1000 });
    const results = [];

    for (const emp of employees) {
      const existing = await payrollRepository.findOne({
        employee: emp._id,
        month,
        year,
      });

      if (!existing) {
        const currency = normalizeCurrency(emp.salary?.currency);
        const data = {
          employee: emp._id,
          month,
          year,
          basicSalary: emp.salary?.basic || 0,
          currency,
          allowances: {
            housing: 0,
            transport: 0,
            medical: 0,
            other: 0,
          },
          deductions: {
            tax: 0,
            insurance: 0,
            providentFund: 0,
            other: 0,
          },
          overtime: 0,
          bonus: 0,
          netSalary: emp.salary?.basic || 0,
          status: 'draft',
        };
        const payroll = await payrollRepository.create(data);
        results.push(payroll);
      }
    }

    await trackActivity(userId, 'BULK_PAYROLL', 'Payroll', null, `Generated ${results.length} payroll records`);
    return { generated: results.length, records: results };
  }
}

module.exports = new PayrollService();
