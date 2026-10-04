const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const validate = require('../middleware/validate');
const { ticketSchema } = require('../validators/ticket.schema');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// POST /api/tickets
router.post(
  '/',
  authenticate,
  requireRole('STUDENT'),
  validate(ticketSchema, 'body'),
  ticketController.createTicket
);

// GET /api/tickets
router.get(
  '/',
  authenticate,
  ticketController.getTickets
);

// PATCH /api/tickets/:id/status
router.patch(
  '/:id/status',
  authenticate,
  requireRole('TECHNICIAN', 'WARDEN', 'FACULTY', 'HOD', 'ADMIN'),
  ticketController.updateTicketStatus
);

module.exports = router;