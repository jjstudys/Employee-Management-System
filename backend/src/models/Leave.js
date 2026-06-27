const mongoose = require('mongoose');
const { LEAVE_STATUSES, LEAVE_TYPES } = require('../utils/constants');

const leaveSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, enum: LEAVE_TYPES, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: LEAVE_STATUSES, default: 'pending' },
    approvals: [
      {
        approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approverRole: String,
        level: Number,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        comments: String,
        actionDate: Date,
      },
    ],
    currentApprovalLevel: { type: Number, default: 1 },
    attachments: [{ url: String, publicId: String, name: String }],
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);
