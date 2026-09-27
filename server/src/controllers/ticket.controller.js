const ticketService = require('../services/ticket.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Create a new ticket
 * @route   POST /api/tickets
 * @access  Private (STUDENT)
 */
const createTicket = asyncHandler(async (req, res) => {
  // Add creatorId from authenticated user
  const ticketData = {
    ...req.body,
    creatorId: req.user._id
  };

  const ticket = await ticketService.createTicket(ticketData);

  res.status(201).json({
    success: true,
    data: ticket
  });
});

/**
 * @desc    Get tickets (with role-based filtering)
 * @route   GET /api/tickets
 * @access  Private
 */
const getTickets = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    status: req.query.status,
    building: req.query.building
  };

  // Remove undefined filters
  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined) {
      delete filters[key];
    }
  });

  const tickets = await ticketService.getTickets(filters, req.user);

  res.json({
    success: true,
    data: tickets
  });
});

/**
 * @desc    Update ticket status
 * @route   PATCH /api/tickets/:id/status
 * @access  Private (TECHNICIAN, WARDEN)
 */
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  const ticket = await ticketService.updateTicketStatus(
    id,
    { status },
    req.user._id
  );

  res.json({
    success: true,
    data: ticket
  });
});

module.exports = {
  createTicket,
  getTickets,
  updateTicketStatus
};