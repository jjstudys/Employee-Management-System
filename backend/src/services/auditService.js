const auditLogRepository = require('../repositories/auditLogRepository');
const activityRepository = require('../repositories/activityRepository');
const { paginate, buildSort, paginatedResponse } = require('../utils/pagination');

class AuditService {
  async getAuditLogs(query) {
    const { page, limit, skip } = paginate(query);
    const filter = {};

    if (query.user) filter.user = query.user;
    if (query.action) filter.action = query.action;
    if (query.resource) filter.resource = query.resource;
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      auditLogRepository.findAll(filter, { skip, limit, sort: buildSort(query.sortBy || 'createdAt', query.order) }),
      auditLogRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getActivities(query) {
    const { page, limit, skip } = paginate(query);
    const filter = {};
    if (query.user) filter.user = query.user;
    if (query.action) filter.action = query.action;

    const [data, total] = await Promise.all([
      activityRepository.findAll(filter, { skip, limit, sort: buildSort(query.sortBy || 'createdAt', query.order) }),
      activityRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }
}

module.exports = new AuditService();
