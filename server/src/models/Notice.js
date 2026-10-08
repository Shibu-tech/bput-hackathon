const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  targetAudience: {
    hostel: {
      type: String,
      default: 'ALL'
    },
    batch: {
      type: String,
      default: 'ALL'
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