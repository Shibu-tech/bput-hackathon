const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/notes - Fetch notes
router.get(
  '/',
  authenticate,
  noteController.getNotes
);

// GET /api/notes/:id - Get single note & track download
router.get(
  '/:id',
  authenticate,
  noteController.getNoteById
);

// POST /api/notes - Upload note
router.post(
  '/',
  authenticate,
  requireRole('FACULTY', 'ADMIN', 'HOD'),
  noteController.createNote
);

// DELETE /api/notes/:id - Delete note
router.delete(
  '/:id',
  authenticate,
  requireRole('FACULTY', 'ADMIN', 'HOD'),
  noteController.deleteNote
);

module.exports = router;
