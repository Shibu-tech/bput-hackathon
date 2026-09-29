const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../validators/auth.schema');
const authenticate = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', validate(registerSchema, 'body'), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema, 'body'), authController.login);

// GET /api/me
router.get('/me', authenticate, authController.getMe);

// GET /api/auth/staff-requests (Super Admin verification)
router.get('/staff-requests', authenticate, authController.getStaffRequests);

// PATCH /api/auth/staff-requests/:id/verify (Super Admin accept/reject)
router.patch('/staff-requests/:id/verify', authenticate, authController.verifyStaffRequest);

module.exports = router;