const performanceReviewRepository = require('../repositories/performanceReviewRepository');
const employeeRepository = require('../repositories/employeeRepository');
const { paginate, buildSort, paginatedResponse } = require('../utils/pagination');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');
const { trackActivity } = require('./activityService');
const { createNotification } = require('./notificationService');

const calcOverallRating = (ratings) => {
  const values = Object.values(ratings || {}).filter(Boolean);
  if (!values.length) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
};

class PerformanceReviewService {
  async getAll(query, user) {
    const { page, limit, skip } = paginate(query);
    const filter = {};

    if (query.status) filter.status = query.status;
    if (query.employee) filter.employee = query.employee;

    if (user.role === ROLES.EMPLOYEE) {
      const emp = await employeeRepository.findByUserId(user._id);
      if (emp) filter.employee = emp._id;
    }

    const [data, total] = await Promise.all([
      performanceReviewRepository.findAll(filter, { skip, limit, sort: buildSort(query.sortBy || 'createdAt', query.order) }),
      performanceReviewRepository.count(filter),
    ]);

    return paginatedResponse(data, total, page, limit);
  }

  async getById(id) {
    const review = await performanceReviewRepository.findById(id, [
      { path: 'employee', select: 'firstName lastName employeeId' },
      { path: 'reviewer', select: 'firstName lastName employeeId' },
    ]);
    if (!review) throw new AppError('Performance review not found', 404);
    return review;
  }

  async create(data, reviewerUserId) {
    const reviewer = await employeeRepository.findByUserId(reviewerUserId);
    if (!reviewer) throw new AppError('Reviewer employee profile not found', 404);

    const overallRating = calcOverallRating(data.ratings);
    const review = await performanceReviewRepository.create({
      ...data,
      reviewer: reviewer._id,
      overallRating,
    });

    const employee = await employeeRepository.findByIdPopulated(data.employee);
    await createNotification(employee.user._id || employee.user, {
      title: 'Performance Review',
      message: 'A new performance review has been created for you',
      type: 'info',
      link: `/performance/${review._id}`,
    });

    await trackActivity(reviewerUserId, 'CREATE_REVIEW', 'PerformanceReview', review._id, 'Performance review created');
    return review;
  }

  async update(id, data, userId) {
    const review = await this.getById(id);
    if (data.ratings) data.overallRating = calcOverallRating(data.ratings);

    const updated = await performanceReviewRepository.updateById(id, data);
    await trackActivity(userId, 'UPDATE_REVIEW', 'PerformanceReview', id, 'Performance review updated');
    return updated;
  }

  async submit(id, userId) {
    const review = await this.getById(id);
    review.status = 'submitted';
    await review.save();
    await trackActivity(userId, 'SUBMIT_REVIEW', 'PerformanceReview', id, 'Review submitted');
    return review;
  }

  async acknowledge(id, userId) {
    const review = await this.getById(id);
    const employee = await employeeRepository.findByUserId(userId);
    if (review.employee._id.toString() !== employee._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    review.status = 'acknowledged';
    review.acknowledgedAt = new Date();
    await review.save();
    await trackActivity(userId, 'ACKNOWLEDGE_REVIEW', 'PerformanceReview', id, 'Review acknowledged');
    return review;
  }
}

module.exports = new PerformanceReviewService();
