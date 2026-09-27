const Attendance = require('../models/Attendance');
const User = require('../models/User');
const GatePass = require('../models/GatePass');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get attendance records for a warden (with optional date filter)
 */
const getAttendanceRecords = async (wardenId, dateFilter) => {
  // Verify the user is a warden
  const warden = await User.findById(wardenId);
  if (!warden || warden.role !== 'WARDEN') {
    throw new Error('Unauthorized: Warden access required');
  }

  let query = {};

  // Add date filter if provided
  if (dateFilter) {
    query.attDate = dateFilter;
  }

  const attendanceRecords = await Attendance.find(query)
    .populate('studentId', 'fullName role phoneNumber hostel batch')
    .populate('markedBy', 'fullName role')
    .sort({ attDate: -1, createdAt: -1 });

  return attendanceRecords;
};

/**
 * Mark attendance for multiple students
 * Pre-fills roll call: students with gate pass in EXITED status default to ON_LEAVE
 * Everyone else defaults to PRESENT. Warden submits exceptions.
 */
const markAttendance = async (attendanceRecords, wardenId) => {
  // Verify the user is a warden
  const warden = await User.findById(wardenId);
  if (!warden || warden.role !== 'WARDEN') {
    throw new Error('Unauthorized: Warden access required');
  }

  const results = [];

  for (const record of attendanceRecords) {
    const { studentId, status } = record;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student) {
      results.push({
        studentId,
        success: false,
        error: 'Student not found'
      });
      continue;
    }

    // Validate status
    const validStatuses = ['PRESENT', 'ABSENT', 'ON_LEAVE'];
    if (!validStatuses.includes(status)) {
      results.push({
        studentId,
        success: false,
        error: 'Invalid status'
      });
      continue;
    }

    // Check if student has an EXITED gate pass for today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const exitedPass = await GatePass.findOne({
      studentId,
      status: 'EXITED',
      requestedExitTime: {
        $gte: new Date(`${today}T00:00:00.000Z`),
        $lt: new Date(`${today}T23:59:59.999Z`)
      }
    });

    // Determine final status: use warden's submission, but we can validate against gate pass for logging if needed
    let finalStatus;
    // If student has EXITED gate pass, the default status is ON_LEAVE; otherwise PRESENT
    const defaultStatus = exitedPass ? 'ON_LEAVE' : 'PRESENT';
    // If warden's status differs from default, it's considered an exception (but we still use warden's status)
    if (exitedPass && status !== 'ON_LEAVE') {
      // Warden is submitting an exception to the pre-filled value
      // We'll still use what the warden provided
    } else if (!exitedPass && status === 'ON_LEAVE') {
      // Student doesn't have EXITED gate pass but warden marked them ON_LEAVE
      // This is also an exception to the default (PRESENT)
      // We'll still use what the warden provided
    }
    // Use the warden's submitted status
    finalStatus = status;

    // Upsert attendance record
    const attendanceRecord = await Attendance.findOneAndUpdate(
      {
        studentId,
        attDate: today
      },
      {
        studentId,
        attDate: today,
        status: finalStatus,
        markedBy: wardenId
      },
      {
        upsert: true,
        new: true
      }
    );

    results.push({
      studentId: attendanceRecord.studentId._id,
      success: true,
      data: attendanceRecord
    });
  }

  return results;
};

module.exports = {
  getAttendanceRecords,
  markAttendance
};