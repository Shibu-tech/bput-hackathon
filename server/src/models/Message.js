const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    default: ''
  },
  complaintTitle: {
    type: String,
    default: ''
  },
  studentId: {
    type: String,
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentRoll: {
    type: String,
    default: ''
  },
  roomNumber: {
    type: String,
    default: '101'
  },
  senderRole: {
    type: String,
    enum: ['student', 'warden'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

messageSchema.index({ studentId: 1, createdAt: 1 });
messageSchema.index({ complaintId: 1 });

module.exports = mongoose.model('Message', messageSchema);
