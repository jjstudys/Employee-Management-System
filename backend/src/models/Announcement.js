const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    targetAudience: {
      type: String,
      enum: ['all', 'department', 'role'],
      default: 'all',
    },
    targetDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    targetRoles: [String],
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishDate: { type: Date, default: Date.now },
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
    attachments: [{ url: String, publicId: String, name: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
