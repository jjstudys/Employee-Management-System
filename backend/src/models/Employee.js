const mongoose = require('mongoose');
const { EMPLOYEE_STATUSES } = require('../utils/constants');

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, unique: true, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation', required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    joiningDate: { type: Date, required: true },
    terminationDate: Date,
    status: { type: String, enum: EMPLOYEE_STATUSES, default: 'onboarding' },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern'],
      default: 'full_time',
    },
    salary: {
      basic: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    profilePhoto: { url: String, publicId: String },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    leaveBalance: {
      annual: { type: Number, default: 20 },
      sick: { type: Number, default: 10 },
      personal: { type: Number, default: 5 },
    },
    lifecycleHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

employeeSchema.index({ firstName: 'text', lastName: 'text', email: 'text', employeeId: 'text' });
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);
