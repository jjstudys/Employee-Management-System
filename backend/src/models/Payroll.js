const mongoose = require('mongoose');
const { PAYROLL_STATUSES } = require('../utils/constants');

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: {
      housing: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      tax: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    overtime: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    workingDays: Number,
    presentDays: Number,
    status: { type: String, enum: PAYROLL_STATUSES, default: 'draft' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,
    paidAt: Date,
    notes: String,
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
