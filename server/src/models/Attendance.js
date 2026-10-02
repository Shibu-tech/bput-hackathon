const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attDate: {
    type: String, // Format: "YYYY-MM-DD"
    required: true
  },
  subject: {
    type: String,
    default: 'General'
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT', 'ON_LEAVE'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Unique index on studentId, attDate and subject
attendanceSchema.index({ studentId: 1, attDate: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);