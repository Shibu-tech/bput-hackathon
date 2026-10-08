const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  clientRequestId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: false
  },
  building: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['IT', 'ELECTRICAL', 'PLUMBING', 'CARPENTRY', 'HVAC', 'OTHER', 'WIFI', 'MESS', 'CIVIL'],
    default: 'OTHER'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE'],
    default: 'OPEN'
  },
  assignedTechId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedByName: {
    type: String,
    default: ''
  },
  wardenNotes: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  parentTicketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  },
  duplicateCount: {
    type: Number,
    default: 0
  },
  // Gemini AI metadata
  aiSummary: {
    type: String,
    default: ''
  },
  aiPriority: {
    type: String,
    default: 'Medium'
  },
  aiConfidence: {
    type: Number,
    default: 90
  },
  photoUrl: {
    type: String,
    default: ''
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'DUPLICATE', 'REJECTED']
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
ticketSchema.index({ category: 1, status: 1, createdAt: 1, building: 1 });
ticketSchema.index({ parentTicketId: 1 });
ticketSchema.index({ assignedTechId: 1, status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
