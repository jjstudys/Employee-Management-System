const mongoose = require('mongoose');
const { REVIEW_STATUSES } = require('../utils/constants');

const performanceReviewSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    reviewPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    ratings: {
      quality: { type: Number, min: 1, max: 5 },
      productivity: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      teamwork: { type: Number, min: 1, max: 5 },
      initiative: { type: Number, min: 1, max: 5 },
    },
    overallRating: { type: Number, min: 1, max: 5 },
    strengths: String,
    areasForImprovement: String,
    goals: [{ description: String, deadline: Date, status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' } }],
    employeeComments: String,
    status: { type: String, enum: REVIEW_STATUSES, default: 'draft' },
    acknowledgedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);
