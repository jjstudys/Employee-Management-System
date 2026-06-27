const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['identity', 'contract', 'certificate', 'resume', 'other'],
      default: 'other',
    },
    file: {
      url: { type: String, required: true },
      publicId: String,
      originalName: String,
      mimeType: String,
      size: Number,
    },
    expiryDate: Date,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
