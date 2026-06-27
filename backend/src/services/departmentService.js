const departmentRepository = require('../repositories/departmentRepository');
const { paginate, buildSort, buildSearchFilter, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { trackActivity } = require('./activityService');

class DepartmentService {
  async getAll(query) {
    const { page, limit, skip } = paginate(query);
    const filter = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    Object.assign(filter, buildSearchFilter(query.search, ['name', 'code']));

    const [data, total] = await Promise.all([
      departmentRepository.find(filter, {
        skip, limit,
        sort: buildSort(query.sortBy || 'name', query.order),
        populate: [{ path: 'head', select: 'firstName lastName employeeId' }],
      }),
      departmentRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getById(id) {
    const dept = await departmentRepository.findById(id, [
      { path: 'head', select: 'firstName lastName employeeId' },
      { path: 'parentDepartment', select: 'name code' },
    ]);
    if (!dept) throw new AppError('Department not found', 404);
    return dept;
  }

  async create(data, userId) {
    const dept = await departmentRepository.create(data);
    await trackActivity(userId, 'CREATE_DEPARTMENT', 'Department', dept._id, `Created department ${dept.name}`);
    return dept;
  }

  async update(id, data, userId) {
    await this.getById(id);
    const updated = await departmentRepository.updateById(id, data);
    await trackActivity(userId, 'UPDATE_DEPARTMENT', 'Department', id, `Updated department`);
    return updated;
  }

  async delete(id, userId) {
    await this.getById(id);
    await departmentRepository.updateById(id, { isActive: false });
    await trackActivity(userId, 'DELETE_DEPARTMENT', 'Department', id, 'Deactivated department');
  }
}

module.exports = new DepartmentService();
