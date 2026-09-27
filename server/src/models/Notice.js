const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  targetAudience: {
    hostel: {
      type: String,
      enum: ['Hostel A', 'Hostel B', 'Hostel C', 'ALL']
    },
    batch: {
      type: String,
      enum: ['2023', '2024', '2025', 'ALL'] // Adjust as needed
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index
noticeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);