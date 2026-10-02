const attendanceService = require('../services/attendance.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get attendance records (with filtering)
 * @route   GET /api/attendance
 * @access  Private (WARDEN, FACULTY, ADMIN)
 */
const getAttendance = asyncHandler(async (req, res) => {
  const { date, subject } = req.query;

  const attendanceRecords = await attendanceService.getAttendanceRecords(
    req.user._id,
    date,
    subject
  );

  res.json({
    success: true,
    data: attendanceRecords
  });
});

/**
 * @desc    Get student list for roll call / attendance / marksheet
 * @route   GET /api/attendance/students
 * @access  Private (WARDEN, FACULTY, ADMIN)
 */
const getStudents = asyncHandler(async (req, res) => {
  const { batch, hostel, search } = req.query;

  const students = await attendanceService.getStudents({
    batch,
    hostel,
    search
  });

  res.json({
    success: true,
    count: students.length,
    data: students
  });
});

/**
 * @desc    Mark attendance for students
 * @route   POST /api/attendance
 * @access  Private (WARDEN, FACULTY, ADMIN)
 */
const markAttendance = asyncHandler(async (req, res) => {
  const { attendanceRecords, date, subject } = req.body;

  if (!Array.isArray(attendanceRecords)) {
    throw new ApiError(400, 'Attendance records must be an array');
  }

  const results = await attendanceService.markAttendance(
    attendanceRecords,
    req.user._id,
    date,
    subject
  );

  res.json({
    success: true,
    data: results
  });
});

module.exports = {
  getAttendance,
  getStudents,
  markAttendance
};