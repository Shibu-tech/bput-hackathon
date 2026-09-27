const express = require('express');
const router = express.Router();
const pushController = require('../controllers/push.controller');
const authenticate = require('../middleware/auth');

// POST /api/push/subscribe
router.post(
  '/subscribe',
  authenticate,
  pushController.subscribe
);

module.exports = router;