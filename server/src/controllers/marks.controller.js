const Marks = require('../models/Marks');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Helper to calculate letter grade
const calculateGrade = (score, max) => {
  if (!max || max <= 0) return 'A';
  const percentage = (score / max) * 100;
  if (percentage >= 90) return 'O (Outstanding)';
  if (percentage >= 80) return 'A+ (Excellent)';
  if (percentage >= 70) return 'A (Very Good)';
  if (percentage >= 60) return 'B+ (Good)';
  if (percentage >= 50) return 'B (Above Average)';
  if (percentage >= 40) return 'C (Pass)';
  return 'F (Fail)';
};

/**
 * @desc    Upload / create new marksheet
 * @route   POST /api/marks
 * @access  Private (FACULTY, ADMIN)
 */
const createMarksheet = asyncHandler(async (req, res) => {
  const {
    subject,
    subjectCode,
    examType,
    batch,
    semester,
    maxMarks = 100,
    passingMarks = 40,
    records = []
  } = req.body;

  if (!subject || !examType || !batch) {
    throw new ApiError(400, 'Subject, Exam Type, and Batch are required');
  }

  // Format student records and auto-calculate grades if missing
  const formattedRecords = records.map((r) => ({
    studentId: r.studentId || null,
    studentName: r.studentName,
    rollNumber: r.rollNumber,
    marksObtained: Number(r.marksObtained) || 0,
    grade: r.grade || calculateGrade(Number(r.marksObtained) || 0, maxMarks),
    remarks: r.remarks || ''
  }));

  const marksheet = await Marks.create({
    subject,
    subjectCode: subjectCode || '',
    examType,
    batch,
    semester: semester || 'Current Semester',
    maxMarks: Number(maxMarks) || 100,
    passingMarks: Number(passingMarks) || 40,
    records: formattedRecords,
    uploadedBy: req.user._id
  });

  const populated = await Marks.findById(marksheet._id)
    .populate('uploadedBy', 'fullName role designation email department');

  res.status(201).json({
    success: true,
    message: 'Marksheet uploaded successfully',
    data: populated
  });
});

/**
 * @desc    Get all marksheets (with role & batch filters)
 * @route   GET /api/marks
 * @access  Private (FACULTY, ADMIN, STUDENT)
 */
const getMarksheets = asyncHandler(async (req, res) => {
  const { subject, batch, examType } = req.query;
  const filter = {};

  if (subject) filter.subject = { $regex: subject, $options: 'i' };
  if (batch && batch !== 'ALL') filter.batch = batch;
  if (examType && examType !== 'ALL') filter.examType = examType;

  // If user is a student, only show marksheets for their batch
  if (req.user.role === 'STUDENT' && req.user.batch) {
    filter.batch = req.user.batch;
  }

  const marksheets = await Marks.find(filter)
    .populate('uploadedBy', 'fullName role designation department')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: marksheets.length,
    data: marksheets
  });
});

/**
 * @desc    Get marksheet by ID
 * @route   GET /api/marks/:id
 * @access  Private
 */
const getMarksheetById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const marksheet = await Marks.findById(id)
    .populate('uploadedBy', 'fullName role designation department email');

  if (!marksheet) {
    throw new ApiError(404, 'Marksheet not found');
  }

  res.json({
    success: true,
    data: marksheet
  });
});

/**
 * @desc    Update marksheet records
 * @route   PUT /api/marks/:id
 * @access  Private (FACULTY, ADMIN)
 */
const updateMarksheet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const marksheet = await Marks.findById(id);

  if (!marksheet) {
    throw new ApiError(404, 'Marksheet not found');
  }

  if (req.user.role !== 'ADMIN' && marksheet.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized to modify this marksheet');
  }

  const {
    subject,
    subjectCode,
    examType,
    batch,
    semester,
    maxMarks,
    passingMarks,
    records
  } = req.body;

  if (subject !== undefined) marksheet.subject = subject;
  if (subjectCode !== undefined) marksheet.subjectCode = subjectCode;
  if (examType !== undefined) marksheet.examType = examType;
  if (batch !== undefined) marksheet.batch = batch;
  if (semester !== undefined) marksheet.semester = semester;
  if (maxMarks !== undefined) marksheet.maxMarks = Number(maxMarks);
  if (passingMarks !== undefined) marksheet.passingMarks = Number(passingMarks);

  if (Array.isArray(records)) {
    marksheet.records = records.map((r) => ({
      studentId: r.studentId || null,
      studentName: r.studentName,
      rollNumber: r.rollNumber,
      marksObtained: Number(r.marksObtained) || 0,
      grade: r.grade || calculateGrade(Number(r.marksObtained) || 0, marksheet.maxMarks),
      remarks: r.remarks || ''
    }));
  }

  await marksheet.save();

  const updated = await Marks.findById(id)
    .populate('uploadedBy', 'fullName role designation department');

  res.json({
    success: true,
    message: 'Marksheet updated successfully',
    data: updated
  });
});

/**
 * @desc    Delete marksheet
 * @route   DELETE /api/marks/:id
 * @access  Private (FACULTY, ADMIN)
 */
const deleteMarksheet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const marksheet = await Marks.findById(id);

  if (!marksheet) {
    throw new ApiError(404, 'Marksheet not found');
  }

  if (req.user.role !== 'ADMIN' && marksheet.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized to delete this marksheet');
  }

  await Marks.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Marksheet deleted successfully'
  });
});

module.exports = {
  createMarksheet,
  getMarksheets,
  getMarksheetById,
  updateMarksheet,
  deleteMarksheet
};
