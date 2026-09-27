const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/notice.controller');
const validate = require('../middleware/validate');
const { noticeSchema } = require('../validators/notice.schema');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// POST /api/notices
router.post(
  '/',
  authenticate,
  requireRole('WARDEN', 'ADMIN'),
  validate(noticeSchema, 'body'),
  noticeController.createNotice
);

// GET /api/notices
router.get(
  '/',
  authenticate,
  noticeController.getNotices
);

module.exports = router;