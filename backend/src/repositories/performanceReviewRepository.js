const BaseRepository = require('./BaseRepository');
const PerformanceReview = require('../models/PerformanceReview');

class PerformanceReviewRepository extends BaseRepository {
  constructor() {
    super(PerformanceReview);
  }

  findAll(filter, options) {
    return this.find(filter, {
      ...options,
      populate: [
        { path: 'employee', select: 'firstName lastName employeeId' },
        { path: 'reviewer', select: 'firstName lastName employeeId' },
      ],
    });
  }
}

module.exports = new PerformanceReviewRepository();
