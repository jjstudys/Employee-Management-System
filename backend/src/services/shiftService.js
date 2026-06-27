const shiftRepository = require('../repositories/shiftRepository');
const { paginate, buildSort, buildSearchFilter, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { trackActivity } = require('./activityService');

class ShiftService {
  async getAll(query) {
    const { page, limit, skip } = paginate(query);
    const filter = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    Object.assign(filter, buildSearchFilter(query.search, ['name', 'code']));

    const [data, total] = await Promise.all([
      shiftRepository.find(filter, { skip, limit, sort: buildSort(query.sortBy || 'name', query.order) }),
      shiftRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getById(id) {
    const shift = await shiftRepository.findById(id);
    if (!shift) throw new AppError('Shift not found', 404);
    return shift;
  }

  async create(data, userId) {
    const shift = await shiftRepository.create(data);
    await trackActivity(userId, 'CREATE_SHIFT', 'Shift', shift._id, `Created shift ${shift.name}`);
    return shift;
  }

  async update(id, data, userId) {
    await this.getById(id);
    const updated = await shiftRepository.updateById(id, data);
    await trackActivity(userId, 'UPDATE_SHIFT', 'Shift', id, 'Updated shift');
    return updated;
  }

  async delete(id, userId) {
    await this.getById(id);
    await shiftRepository.updateById(id, { isActive: false });
    await trackActivity(userId, 'DELETE_SHIFT', 'Shift', id, 'Deactivated shift');
  }
}

module.exports = new ShiftService();
