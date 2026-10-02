const mongoose = require('mongoose');

const marksRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  grade: {
    type: String,
    default: 'A'
  },
  remarks: {
    type: String,
    default: '',
    trim: true
  }
});

const marksSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  subjectCode: {
    type: String,
    trim: true,
    default: ''
  },
  examType: {
    type: String,
    required: true,
    default: 'Mid Term'
  },
  batch: {
    type: String,
    required: true,
    default: '2024'
  },
  semester: {
    type: String,
    default: 'Semester 4'
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100
  },
  passingMarks: {
    type: Number,
    required: true,
    default: 40
  },
  records: [marksRecordSchema],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

marksSchema.index({ subject: 1, batch: 1, examType: 1 });
marksSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Marks', marksSchema);
