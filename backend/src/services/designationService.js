const designationRepository = require('../repositories/designationRepository');
const { paginate, buildSort, buildSearchFilter, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { trackActivity } = require('./activityService');

class DesignationService {
  async getAll(query) {
    const { page, limit, skip } = paginate(query);
    const filter = {};
    if (query.department) filter.department = query.department;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    Object.assign(filter, buildSearchFilter(query.search, ['title', 'code']));

    const [data, total] = await Promise.all([
      designationRepository.find(filter, {
        skip, limit,
        sort: buildSort(query.sortBy || 'level', query.order),
        populate: [{ path: 'department', select: 'name code' }],
      }),
      designationRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getById(id) {
    const designation = await designationRepository.findById(id, [
      { path: 'department', select: 'name code' },
    ]);
    if (!designation) throw new AppError('Designation not found', 404);
    return designation;
  }

  async create(data, userId) {
    const designation = await designationRepository.create(data);
    await trackActivity(userId, 'CREATE_DESIGNATION', 'Designation', designation._id, `Created designation ${designation.title}`);
    return designation;
  }

  async update(id, data, userId) {
    await this.getById(id);
    const updated = await designationRepository.updateById(id, data);
    await trackActivity(userId, 'UPDATE_DESIGNATION', 'Designation', id, 'Updated designation');
    return updated;
  }

  async delete(id, userId) {
    await this.getById(id);
    await designationRepository.updateById(id, { isActive: false });
    await trackActivity(userId, 'DELETE_DESIGNATION', 'Designation', id, 'Deactivated designation');
  }
}

module.exports = new DesignationService();
