const express = require('express');
const router = express.Router();
const gatePassController = require('../controllers/gatePass.controller');
const validate = require('../middleware/validate');
const { gatePassSchema, gatePassUpdateSchema } = require('../validators/gatePass.schema');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/gate-passes
router.get(
  '/',
  authenticate,
  gatePassController.getGatePasses
);

// POST /api/gate-passes
router.post(
  '/',
  authenticate,
  requireRole('STUDENT'),
  validate(gatePassSchema, 'body'),
  gatePassController.createGatePass
);

// PATCH /api/gate-passes/:id
router.patch(
  '/:id',
  authenticate,
  requireRole('WARDEN'),
  validate(gatePassUpdateSchema, 'body'),
  gatePassController.updateGatePass
);

// GET /api/gate-passes/:id/qr
router.get(
  '/:id/qr',
  authenticate,
  requireRole('STUDENT'),
  gatePassController.getQrCode
);

// POST /api/gate-passes/scan
router.post(
  '/scan',
  authenticate,
  requireRole('SECURITY'),
  gatePassController.scanGatePass
);

// GET /api/gate-passes/overdue
router.get(
  '/overdue',
  authenticate,
  requireRole('WARDEN'),
  gatePassController.getOverduePasses
);

module.exports = router;