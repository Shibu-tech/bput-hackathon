const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marks.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/marks - Fetch marksheets
router.get(
  '/',
  authenticate,
  marksController.getMarksheets
);

// GET /api/marks/:id - Get specific marksheet
router.get(
  '/:id',
  authenticate,
  marksController.getMarksheetById
);

// POST /api/marks - Create / upload marksheet
router.post(
  '/',
  authenticate,
  requireRole('FACULTY', 'ADMIN', 'HOD', 'EXAM_CELL'),
  marksController.createMarksheet
);

// PUT /api/marks/:id - Update marksheet
router.put(
  '/:id',
  authenticate,
  requireRole('FACULTY', 'ADMIN', 'HOD', 'EXAM_CELL'),
  marksController.updateMarksheet
);

// DELETE /api/marks/:id - Delete marksheet
router.delete(
  '/:id',
  authenticate,
  requireRole('FACULTY', 'ADMIN', 'HOD', 'EXAM_CELL'),
  marksController.deleteMarksheet
);

module.exports = router;
