const leaveRepository = require('../repositories/leaveRepository');
const employeeRepository = require('../repositories/employeeRepository');
const userRepository = require('../repositories/userRepository');
const departmentRepository = require('../repositories/departmentRepository');
const designationRepository = require('../repositories/designationRepository');
const shiftRepository = require('../repositories/shiftRepository');
const { paginate, buildSort, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');
const { trackActivity } = require('./activityService');
const { createNotification } = require('./notificationService');
const { sendEmail, emailTemplates } = require('../utils/email');

const calculateDays = (start, end) => {
  const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(diff, 1);
};

class LeaveService {
  async getAll(query, user) {
    const { page, limit, skip } = paginate(query);
    const filter = {};

    if (query.status) filter.status = query.status;
    if (query.leaveType) filter.leaveType = query.leaveType;
    if (query.employee) filter.employee = query.employee;

    if (user.role === ROLES.EMPLOYEE) {
      const emp = await employeeRepository.findByUserId(user._id);
      if (emp) filter.employee = emp._id;
    }

    const [data, total] = await Promise.all([
      leaveRepository.findAll(filter, { skip, limit, sort: buildSort(query.sortBy || 'createdAt', query.order) }),
      leaveRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getById(id) {
    const leave = await leaveRepository.findByIdPopulated(id);
    if (!leave) throw new AppError('Leave request not found', 404);
    return leave;
  }

  async create(data, userId) {
    let employee = await employeeRepository.findByUserId(userId);
    // If employee profile missing (older users), auto-create a minimal profile so leave can be requested.
    if (!employee) {
      try {
        const user = await userRepository.findById(userId);

        // find or create a default department
        const depts = await departmentRepository.find({}, { limit: 1 });
        let dept = depts && depts[0];
        if (!dept) {
          dept = await departmentRepository.create({ name: 'General', code: 'GEN', description: 'Default department' });
        }

        // find or create a default designation
        const desigs = await designationRepository.find({ department: dept._id }, { limit: 1 });
        let desig = desigs && desigs[0];
        if (!desig) {
          desig = await designationRepository.create({ title: 'Employee', code: 'EMP', department: dept._id });
        }

        // find or create a default shift
        const shifts = await shiftRepository.find({}, { limit: 1 });
        let shift = shifts && shifts[0];
        if (!shift) {
          shift = await shiftRepository.create({ name: 'Default Shift', code: 'DEF', startTime: '09:00', endTime: '17:00', breakMinutes: 60, gracePeriodMinutes: 15 });
        }

        const emailPrefix = (user.email || '').split('@')[0] || 'Employee';
        const empData = {
          user: userId,
          employeeId: `EMP${Date.now()}`,
          firstName: emailPrefix,
          lastName: 'User',
          email: user.email,
          department: dept._id,
          designation: desig._id,
          joiningDate: new Date(),
          status: 'active',
          shift: shift._id,
          salary: { basic: 0, currency: 'USD' },
          leaveBalance: { annual: 0, sick: 0, personal: 0 },
          lifecycleHistory: [{ status: 'active', changedBy: userId, notes: 'Auto-created on leave request' }],
        };

        employee = await employeeRepository.create(empData);
      } catch (err) {
        // log and surface a clear error
        // eslint-disable-next-line no-console
        console.error('Failed to auto-create employee for leave:', err.message || err);
        throw new AppError('Employee profile not found', 404);
      }
    }

    const totalDays = calculateDays(data.startDate, data.endDate);
    const balanceKey = data.leaveType === 'annual' ? 'annual' : data.leaveType === 'sick' ? 'sick' : 'personal';

    if (['annual', 'sick', 'personal'].includes(data.leaveType)) {
      const balance = employee.leaveBalance[balanceKey] || 0;
      if (balance < totalDays) {
        throw new AppError(`Insufficient ${data.leaveType} leave balance`, 400);
      }
    }

    const approvals = [];
    if (employee.manager) {
      const managerEmp = await employeeRepository.findByIdPopulated(employee.manager);
      if (managerEmp?.user) {
        approvals.push({
          approver: managerEmp.user._id || managerEmp.user,
          approverRole: ROLES.MANAGER,
          level: 1,
        });
      }
    }

    const hrUsers = await userRepository.find({ role: ROLES.HR }, { limit: 1 });
    if (hrUsers.length) {
      approvals.push({
        approver: hrUsers[0]._id,
        approverRole: ROLES.HR,
        level: 2,
      });
    }

    const leave = await leaveRepository.create({
      ...data,
      employee: employee._id,
      totalDays,
      approvals,
    });

    for (const approval of approvals) {
      await createNotification(approval.approver, {
        title: 'New Leave Request',
        message: `${employee.firstName} ${employee.lastName} requested ${data.leaveType} leave`,
        type: 'leave',
        link: `/leaves/${leave._id}`,
      });
    }

    await trackActivity(userId, 'REQUEST_LEAVE', 'Leave', leave._id, 'Leave request submitted');
    return leaveRepository.findByIdPopulated(leave._id);
  }

  async approve(id, approverId, approverRole, { status, comments }) {
    const leave = await this.getById(id);
    if (leave.status !== 'pending') throw new AppError('Leave request is not pending', 400);

    const approvalIndex = leave.approvals.findIndex(
      (a) => a.level === leave.currentApprovalLevel && a.status === 'pending'
    );

    if (approvalIndex === -1) throw new AppError('No pending approval at current level', 400);

    const approval = leave.approvals[approvalIndex];
    if (approval.approver.toString() !== approverId.toString() && approverRole !== ROLES.ADMIN) {
      throw new AppError('Not authorized to approve this leave', 403);
    }

    leave.approvals[approvalIndex].status = status;
    leave.approvals[approvalIndex].comments = comments;
    leave.approvals[approvalIndex].actionDate = new Date();

    if (status === 'rejected') {
      leave.status = 'rejected';
      const emp = leave.employee;
      const userId = emp.user?._id || emp.user;
      await createNotification(userId, {
        title: 'Leave Rejected',
        message: `Your leave request was rejected${comments ? `: ${comments}` : ''}`,
        type: 'leave',
      });
      await sendEmail({
        to: emp.email,
        ...emailTemplates.leaveRejected(leave.leaveType, `${leave.startDate} - ${leave.endDate}`, comments),
      });
    } else {
      const nextLevel = leave.currentApprovalLevel + 1;
      const hasNext = leave.approvals.some((a) => a.level === nextLevel);

      if (hasNext) {
        leave.currentApprovalLevel = nextLevel;
        const nextApprover = leave.approvals.find((a) => a.level === nextLevel);
        await createNotification(nextApprover.approver, {
          title: 'Leave Pending Approval',
          message: 'A leave request requires your approval',
          type: 'leave',
          link: `/leaves/${leave._id}`,
        });
      } else {
        leave.status = 'approved';
        const employee = await employeeRepository.findByIdPopulated(leave.employee._id || leave.employee);
        const balanceKey = leave.leaveType === 'annual' ? 'annual' : leave.leaveType === 'sick' ? 'sick' : 'personal';

        if (['annual', 'sick', 'personal'].includes(leave.leaveType)) {
          employee.leaveBalance[balanceKey] -= leave.totalDays;
          await employee.save();
        }

        await createNotification(employee.user._id || employee.user, {
          title: 'Leave Approved',
          message: 'Your leave request has been approved',
          type: 'leave',
        });
        await sendEmail({
          to: employee.email,
          ...emailTemplates.leaveApproved(leave.leaveType, `${leave.startDate} - ${leave.endDate}`),
        });
      }
    }

    await leave.save();
    await trackActivity(approverId, 'APPROVE_LEAVE', 'Leave', id, `Leave ${status}`);
    return leaveRepository.findByIdPopulated(id);
  }

  async cancel(id, userId) {
    const leave = await this.getById(id);
    if (leave.status !== 'pending') throw new AppError('Only pending leaves can be cancelled', 400);

    leave.status = 'cancelled';
    leave.cancelledAt = new Date();
    leave.cancelledBy = userId;
    await leave.save();

    await trackActivity(userId, 'CANCEL_LEAVE', 'Leave', id, 'Leave cancelled');
    return leave;
  }
}

module.exports = new LeaveService();
