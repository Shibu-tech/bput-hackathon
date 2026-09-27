const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Location = require('../models/Location');
const { emitToUser, emitToRole } = require('../sockets');
const ApiError = require('../utils/ApiError');

/**
 * Calculate minutes since midnight for a given time in IST
 */
const getISTMinutesSinceMidnight = (date = new Date()) => {
  // IST is UTC+5:30
  const istTime = new Date(date.getTime() + (5 * 60 + 30) * 60000);
  return istTime.getHours() * 60 + istTime.getMinutes();
};

/**
 * Find on-duty technicians for a given category
 */
const findOnDutyTechnicians = async (category) => {
  const currentMinute = getISTMinutesSinceMidnight();

  const technicians = await User.find({
    role: 'TECHNICIAN',
    'shifts.category': category,
    $expr: {
      $and: [
        { $gte: [currentMinute, '$shifts.startMinute'] },
        { $lte: [currentMinute, '$shifts.endMinute'] }
      ]
    }
  });

  return technicians;
};

/**
 * Count active tickets for a technician
 */
const countActiveTickets = async (technicianId) => {
  return Ticket.countDocuments({
    assignedTechId: technicianId,
    status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] }
  });
};

/**
 * Create a new ticket with deduplication logic
 */
const createTicket = async (ticketData) => {
  const {
    clientRequestId,
    creatorId,
    locationId,
    building,
    category,
    description
  } = ticketData;

  // 1. Check if ticket with clientRequestId already exists (idempotency)
  if (clientRequestId) {
    const existingTicket = await Ticket.findOne({ clientRequestId });
    if (existingTicket) {
      return existingTicket;
    }
  }

  // 2. Run deduplication lookup
  let matchQuery = { building: building || 'Hostel A', category: category || 'OTHER' };

  if (locationId && require('mongoose').Types.ObjectId.isValid(locationId)) {
    const location = await Location.findById(locationId);
    if (location) {
      if (category === 'PLUMBING' || category === 'CARPENTRY') {
        matchQuery = {
          building: location.buildingName,
          floor: location.floor,
          roomNumber: location.roomNumber,
          category
        };
      } else {
        matchQuery = {
          building: location.buildingName,
          category
        };
      }
    }
  } else if (ticketData.roomNumber && (category === 'PLUMBING' || category === 'CARPENTRY')) {
    matchQuery.roomNumber = ticketData.roomNumber;
  }

  // Try to find a matching ticket and atomically increment duplicateCount
  const existingMatch = await Ticket.findOneAndUpdate(
    matchQuery,
    { $inc: { duplicateCount: 1 } },
    { new: true }
  );

  if (existingMatch) {
    // 3. If match found: create ticket as DUPLICATE
    const duplicateTicket = await Ticket.create({
      ...ticketData,
      status: 'DUPLICATE',
      parentTicketId: existingMatch._id
    });

    return duplicateTicket;
  }

  // 4. If no match: find on-duty technician
  const onDutyTechs = await findOnDutyTechnicians(category);

  if (onDutyTechs.length > 0) {
    // Find technician with fewest active tickets
    const techWithLeastTickets = await Promise.all(
      onDutyTechs.map(async (tech) => ({
        tech,
        activeTickets: await countActiveTickets(tech._id)
      }))
    ).then(techs => techs.reduce((min, current) =>
      current.activeTickets < min.activeTickets ? current : min
    )).then(result => result.tech);

    // Create ticket as ASSIGNED
    const ticket = await Ticket.create({
      ...ticketData,
      status: 'ASSIGNED',
      assignedTechId: techWithLeastTickets._id
    });

    // Emit socket event to assigned technician
    await emitToUser(techWithLeastTickets._id.toString(), 'ticket:assigned', {
      ticketId: ticket._id,
      ticket
    });

    return ticket;
  } else {
    // 5. If nobody on duty: save as OPEN
    const ticket = await Ticket.create({
      ...ticketData,
      status: 'OPEN'
    });

    // Emit socket event to WARDEN role
    await emitToRole('WARDEN', 'ticket:unassigned', {
      ticketId: ticket._id,
      ticket
    });

    return ticket;
  }
};

/**
 * Update ticket status
 */
const updateTicketStatus = async (ticketId, statusUpdate, updatedBy) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  // Update status
  ticket.status = statusUpdate.status;

  // Add to status history
  ticket.statusHistory.push({
    status: statusUpdate.status,
    changedAt: new Date(),
    changedBy: updatedBy
  });

  // If resolved, set resolvedAt
  if (statusUpdate.status === 'RESOLVED') {
    ticket.resolvedAt = new Date();

    // 6. Bulk-update all children tickets to RESOLVED
    if (ticket._id) {
      await Ticket.updateMany(
        { parentTicketId: ticket._id },
        {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          $push: {
            statusHistory: {
              status: 'RESOLVED',
              changedAt: new Date(),
              changedBy: updatedBy
            }
          }
        }
      );

      // Notify creators of child tickets
      const childTickets = await Ticket.find({ parentTicketId: ticket._id });
      for (const childTicket of childTickets) {
        await emitToUser(childTicket.creatorId.toString(), 'ticket:resolved', {
          ticketId: childTicket._id,
          parentTicketId: ticket._id
        });
      }
    }
  }

  await ticket.save();
  return ticket;
};

/**
 * Get tickets based on filters (role-based filtering)
 */
const getTickets = async (filters, user) => {
  let query = {};

  // Role-based filtering
  switch (user.role) {
    case 'STUDENT':
      query.creatorId = user._id;
      break;
    case 'TECHNICIAN':
      query.assignedTechId = user._id;
      break;
    case 'WARDEN':
      // Wardens can see tickets in their hostel
      // For simplicity, we'll show all tickets - can be refined later
      break;
    case 'ADMIN':
    case 'SECURITY':
      // Can see all tickets
      break;
    default:
      break;
  }

  // Apply additional filters
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.building) query.building = filters.building;

  const tickets = await Ticket.find(query)
    .populate('creatorId', 'fullName role')
    .populate('assignedTechId', 'fullName role')
    .populate('locationId')
    .sort({ createdAt: -1 });

  return tickets;
};

module.exports = {
  createTicket,
  updateTicketStatus,
  getTickets,
  findOnDutyTechnicians,
  countActiveTickets
};