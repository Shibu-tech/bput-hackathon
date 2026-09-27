const express = require('express');
const router = express.Router();
const messController = require('../controllers/mess.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// PUT /api/mess/:date/:meal
router.put(
  '/:date/:meal',
  authenticate,
  requireRole('WARDEN'),
  messController.setMenu
);

// GET /api/mess/today
router.get(
  '/today',
  authenticate,
  messController.getTodayMenu
);

module.exports = router;