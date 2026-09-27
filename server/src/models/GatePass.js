const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  clientRequestId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostel: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  requestedExitTime: {
    type: Date,
    required: true
  },
  expectedReturnTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXITED', 'RETURNED', 'EXPIRED'],
    default: 'PENDING'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actualExitTime: {
    type: Date
  },
  actualReturnTime: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
gatePassSchema.index({ status: 1, hostel: 1 });
gatePassSchema.index({ studentId: 1, createdAt: 1 });

module.exports = mongoose.model('GatePass', gatePassSchema);