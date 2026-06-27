const BaseRepository = require('./BaseRepository');
const AuditLog = require('../models/AuditLog');

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  findAll(filter, options) {
    return this.find(filter, {
      ...options,
      populate: [{ path: 'user', select: 'email role' }],
    });
  }
}

module.exports = new AuditLogRepository();
