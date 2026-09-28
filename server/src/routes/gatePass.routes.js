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
  requireRole('STUDENT', 'WARDEN', 'ADMIN'),
  validate(gatePassSchema, 'body'),
  gatePassController.createGatePass
);

// GET /api/gate-passes/overdue
router.get(
  '/overdue',
  authenticate,
  requireRole('WARDEN'),
  gatePassController.getOverduePasses
);

// DELETE /api/gate-passes/dummy (Delete dummy/mock gate passes)
router.delete(
  '/dummy',
  authenticate,
  requireRole('ADMIN', 'WARDEN'),
  gatePassController.deleteDummyPasses
);

// POST /api/gate-passes/generate-qr (Generate standalone random QR)
router.post(
  '/generate-qr',
  authenticate,
  gatePassController.generateRandomQr
);

// POST /api/gate-passes/scan
router.post(
  '/scan',
  authenticate,
  requireRole('SECURITY', 'WARDEN', 'ADMIN'),
  gatePassController.scanGatePass
);

// GET /api/gate-passes/:id
router.get(
  '/:id',
  authenticate,
  gatePassController.getGatePassById
);

// PATCH /api/gate-passes/:id
router.patch(
  '/:id',
  authenticate,
  requireRole('WARDEN', 'ADMIN'),
  validate(gatePassUpdateSchema, 'body'),
  gatePassController.updateGatePass
);

// POST /api/gate-passes/:id/issue-qr (Issue a fresh random QR code and update DB)
router.post(
  '/:id/issue-qr',
  authenticate,
  gatePassController.issueQrCode
);

// GET /api/gate-passes/:id/qr (Get / issue fresh random QR code)
router.get(
  '/:id/qr',
  authenticate,
  gatePassController.issueQrCode
);

// POST /api/gate-passes/:id/qr (Alternative issue route)
router.post(
  '/:id/qr',
  authenticate,
  gatePassController.issueQrCode
);

module.exports = router;