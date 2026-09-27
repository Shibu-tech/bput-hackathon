const attendanceService = require('../services/attendance.service');
const gatePassService = require('../services/gatePass.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get attendance records (with filtering)
 * @route   GET /api/attendance
 * @access  Private (WARDEN)
 */
const getAttendance = asyncHandler(async (req, res) => {
  const { date } = req.query;

  const attendanceRecords = await attendanceService.getAttendanceRecords(
    req.user._id, // Warden ID
    date
  );

  res.json({
    success: true,
    data: attendanceRecords
  });
});

/**
 * @desc    Mark attendance for students
 * @route   POST /api/attendance
 * @access  Private (WARDEN)
 */
const markAttendance = asyncHandler(async (req, res) => {
  const { attendanceRecords } = req.body;

  if (!Array.isArray(attendanceRecords)) {
    throw new ApiError(400, 'Attendance records must be an array');
  }

  const results = await attendanceService.markAttendance(
    attendanceRecords,
    req.user._id // Warden ID
  );

  res.json({
    success: true,
    data: results
  });
});

module.exports = {
  getAttendance,
  markAttendance
};