const employeeRepository = require('../repositories/employeeRepository');
const userRepository = require('../repositories/userRepository');
const { paginate, buildSort, buildSearchFilter, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { trackActivity } = require('./activityService');
const { createNotification } = require('./notificationService');
const { sendEmail, emailTemplates } = require('../utils/email');
const { uploadToCloudinary } = require('./uploadService');

class EmployeeService {
  async getAll(query) {
    const { page, limit, skip } = paginate(query);
    const filter = {};

    if (query.status) filter.status = query.status;
    if (query.department) filter.department = query.department;
    if (query.designation) filter.designation = query.designation;

    Object.assign(filter, buildSearchFilter(query.search, ['firstName', 'lastName', 'email', 'employeeId']));

    const [data, total] = await Promise.all([
      employeeRepository.findAll(filter, { skip, limit, sort: buildSort(query.sortBy || 'createdAt', query.order) }),
      employeeRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getById(id) {
    const employee = await employeeRepository.findByIdPopulated(id);
    if (!employee) throw new AppError('Employee not found', 404);
    return employee;
  }

  async create(data, createdBy) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) throw new AppError('Email already exists', 409);

    const existingEmp = await employeeRepository.findByEmployeeId(data.employeeId);
    if (existingEmp) throw new AppError('Employee ID already exists', 409);

    // Normalize values to lowercase for consistency
    const { password, role, ...employeeData } = data;
    const normalizedData = {
      ...employeeData,
      role: (role || 'employee').toLowerCase(),
      status: data.status?.toLowerCase(),
      employmentType: data.employmentType?.toLowerCase(),
    };
    
    const user = await userRepository.create({ email: data.email, password, role: normalizedData.role });

    const employee = await employeeRepository.create({
      ...normalizedData,
      user: user._id,
      lifecycleHistory: [{ status: 'onboarding', changedBy: createdBy, notes: 'Employee onboarded' }],
    });

    await trackActivity(createdBy, 'CREATE_EMPLOYEE', 'Employee', employee._id, `Created employee ${employee.employeeId}`);
    await sendEmail({ to: data.email, ...emailTemplates.welcome(`${data.firstName} ${data.lastName}`) });

    return employeeRepository.findByIdPopulated(employee._id);
  }

  async update(id, data, updatedBy) {
    const employee = await this.getById(id);

    // Normalize values to lowercase for consistency
    const normalizedData = {
      ...data,
      status: data.status?.toLowerCase(),
      employmentType: data.employmentType?.toLowerCase(),
    };

    if (normalizedData.status && normalizedData.status !== employee.status) {
      normalizedData.lifecycleHistory = [
        ...employee.lifecycleHistory,
        { status: normalizedData.status, changedBy: updatedBy, notes: `Status changed to ${normalizedData.status}` },
      ];

      if (['terminated', 'resigned'].includes(normalizedData.status)) {
        normalizedData.terminationDate = new Date();
        await userRepository.updateById(employee.user._id || employee.user, { isActive: false });
      }
    }

    const updated = await employeeRepository.updateById(id, normalizedData);
    await trackActivity(updatedBy, 'UPDATE_EMPLOYEE', 'Employee', id, `Updated employee ${employee.employeeId}`);
    return employeeRepository.findByIdPopulated(updated._id);
  }

  async uploadPhoto(id, file, uploadedBy) {
    const employee = await this.getById(id);
    const { url, publicId } = await uploadToCloudinary(file.buffer, 'profiles');

    await employeeRepository.updateById(id, {
      profilePhoto: { url, publicId },
    });

    await trackActivity(uploadedBy, 'UPLOAD_PHOTO', 'Employee', id, 'Profile photo uploaded');
    return { url };
  }

  async delete(id, deletedBy) {
    const employee = await this.getById(id);
    await employeeRepository.updateById(id, { status: 'terminated', terminationDate: new Date() });
    await userRepository.updateById(employee.user._id || employee.user, { isActive: false });
    await trackActivity(deletedBy, 'DELETE_EMPLOYEE', 'Employee', id, `Terminated employee ${employee.employeeId}`);
  }
}

module.exports = new EmployeeService();
