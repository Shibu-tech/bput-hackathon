const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/attendance/students - Enrolled students roster
router.get(
  '/students',
  authenticate,
  requireRole('WARDEN', 'FACULTY', 'ADMIN'),
  attendanceController.getStudents
);

// GET /api/attendance
router.get(
  '/',
  authenticate,
  requireRole('WARDEN', 'FACULTY', 'ADMIN'),
  attendanceController.getAttendance
);

// POST /api/attendance
router.post(
  '/',
  authenticate,
  requireRole('WARDEN', 'FACULTY', 'ADMIN'),
  attendanceController.markAttendance
);

module.exports = router;