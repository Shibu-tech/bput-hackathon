const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/attendance
router.get(
  '/',
  authenticate,
  requireRole('WARDEN'),
  attendanceController.getAttendance
);

// POST /api/attendance
router.post(
  '/',
  authenticate,
  requireRole('WARDEN'),
  attendanceController.markAttendance
);

module.exports = router;