const userRepository = require('../repositories/userRepository');
const { paginate, buildSort, buildSearchFilter, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { trackActivity } = require('./activityService');

class UserService {
  async getAll(query) {
    const { page, limit, skip } = paginate(query);
    const filter = {};
    if (query.role) filter.role = query.role;
    if (query.email) filter.email = new RegExp(query.email, 'i');
    Object.assign(filter, buildSearchFilter(query.search, ['email', 'role']));

    const [data, total] = await Promise.all([
      userRepository.find(filter, { skip, limit, sort: buildSort(query.sortBy || 'createdAt', query.order) }),
      userRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async create(data, createdBy) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email already exists', 409);

    const user = await userRepository.create(data);
    await trackActivity(createdBy, 'CREATE_USER', 'User', user._id, `Created user ${user.email}`);
    return user;
  }

  async update(id, data, updatedBy) {
    await this.getById(id);
    const updated = await userRepository.updateById(id, data);
    await trackActivity(updatedBy, 'UPDATE_USER', 'User', id, `Updated user ${updated.email}`);
    return updated;
  }

  async delete(id, deletedBy) {
    await this.getById(id);
    await userRepository.updateById(id, { isActive: false });
    await trackActivity(deletedBy, 'DEACTIVATE_USER', 'User', id, 'Deactivated user');
  }
}

module.exports = new UserService();
