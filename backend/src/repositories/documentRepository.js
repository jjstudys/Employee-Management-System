const BaseRepository = require('./BaseRepository');
const Document = require('../models/Document');

class DocumentRepository extends BaseRepository {
  constructor() {
    super(Document);
  }

  findAll(filter, options) {
    return this.find(filter, {
      ...options,
      populate: [{ path: 'employee', select: 'firstName lastName employeeId' }],
    });
  }
}

module.exports = new DocumentRepository();
