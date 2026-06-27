const mongoose = require('mongoose');
const { ATTENDANCE_STATUSES } = require('../utils/constants');

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    checkIn: Date,
    checkOut: Date,
    status: { type: String, enum: ATTENDANCE_STATUSES, default: 'absent' },
    workHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    notes: String,
    location: {
      checkIn: { lat: Number, lng: Number },
      checkOut: { lat: Number, lng: Number },
    },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
