const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    level: { type: Number, default: 1 },
    description: String,
    minSalary: Number,
    maxSalary: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

designationSchema.index({ department: 1, title: 1 }, { unique: true });

module.exports = mongoose.model('Designation', designationSchema);
