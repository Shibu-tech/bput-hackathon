const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  batch: {
    type: String,
    default: 'ALL',
    trim: true
  },
  semester: {
    type: String,
    default: 'All Semesters',
    trim: true
  },
  category: {
    type: String,
    enum: ['Lecture Notes', 'Syllabus', 'Question Bank', 'Lab Manual', 'Reference Material', 'Assignment', 'Tutorial'],
    default: 'Lecture Notes'
  },
  fileUrl: {
    type: String, // Base64 data URI or public attachment link
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: String,
    default: '1.2 MB'
  },
  fileType: {
    type: String,
    default: 'application/pdf'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloadsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

noteSchema.index({ subject: 1, batch: 1, createdAt: -1 });
noteSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Note', noteSchema);
