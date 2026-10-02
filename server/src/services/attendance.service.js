const Attendance = require('../models/Attendance');
const User = require('../models/User');
const GatePass = require('../models/GatePass');

/**
 * Get attendance records for a warden, faculty, or admin (with optional date & subject filter)
 */
const getAttendanceRecords = async (userId, dateFilter, subjectFilter) => {
  const user = await User.findById(userId);
  if (!user || !['WARDEN', 'FACULTY', 'ADMIN'].includes(user.role)) {
    throw new Error('Unauthorized: Warden, Faculty, or Admin access required');
  }

  let query = {};

  if (dateFilter) {
    query.attDate = dateFilter;
  }

  if (subjectFilter && subjectFilter !== 'ALL') {
    query.subject = subjectFilter;
  }

  const attendanceRecords = await Attendance.find(query)
    .populate('studentId', 'fullName role phoneNumber hostel batch roomNumber email')
    .populate('markedBy', 'fullName role designation')
    .sort({ attDate: -1, createdAt: -1 });

  return attendanceRecords;
};

/**
 * Get all students for roll call roster
 */
const getStudents = async (query = {}) => {
  const filter = { role: 'STUDENT' };

  if (query.batch && query.batch !== 'ALL') {
    filter.batch = query.batch;
  }

  if (query.hostel && query.hostel !== 'ALL') {
    filter.hostel = query.hostel;
  }

  if (query.search) {
    filter.$or = [
      { fullName: { $regex: query.search, $options: 'i' } },
      { phoneNumber: { $regex: query.search, $options: 'i' } },
      { roomNumber: { $regex: query.search, $options: 'i' } },
    ];
  }

  const students = await User.find(filter)
    .select('_id fullName phoneNumber hostel roomNumber bedLabel batch email createdAt')
    .sort({ fullName: 1 });

  return students;
};

/**
 * Mark attendance for multiple students
 * Supports both Warden roll call & Faculty lecture attendance
 */
const markAttendance = async (attendanceRecords, markerId, customDate, subject = 'General') => {
  const marker = await User.findById(markerId);
  if (!marker || !['WARDEN', 'FACULTY', 'ADMIN'].includes(marker.role)) {
    throw new Error('Unauthorized: Warden, Faculty, or Admin access required');
  }

  const results = [];
  const targetDate = customDate || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const targetSubject = subject || 'General';

  for (const record of attendanceRecords) {
    const { studentId, status, remarks } = record;

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

    // Upsert attendance record
    const attendanceRecord = await Attendance.findOneAndUpdate(
      {
        studentId,
        attDate: targetDate,
        subject: targetSubject
      },
      {
        studentId,
        attDate: targetDate,
        subject: targetSubject,
        status,
        markedBy: markerId
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    results.push({
      studentId: attendanceRecord.studentId,
      success: true,
      data: attendanceRecord
    });
  }

  return results;
};

module.exports = {
  getAttendanceRecords,
  getStudents,
  markAttendance
};