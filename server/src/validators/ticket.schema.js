const { z } = require('zod');

/**
 * Ticket creation validation schema
 */
const ticketSchema = z.object({
  locationId: z.string().optional(),
  building: z.string().default('Hostel A'),
  roomNumber: z.string().optional(),
  title: z.string().optional(),
  category: z.string().default('OTHER'),
  description: z.string().min(1),
  clientRequestId: z.string().optional() // Optional for idempotency
});

module.exports = {
  ticketSchema
};