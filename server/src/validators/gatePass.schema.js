const { z } = require('zod');

/**
 * Gate pass creation validation schema
 */
const gatePassSchema = z.object({
  locationId: z.string().optional(),
  hostel: z.string().default('Hostel A'),
  reason: z.string().min(1),
  requestedExitTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format HH:MM'),
  expectedReturnTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format HH:MM'),
  clientRequestId: z.string().optional() // Optional for idempotency
});

/**
 * Gate pass approval/rejection validation schema
 */
const gatePassUpdateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'])
});

module.exports = {
  gatePassSchema,
  gatePassUpdateSchema
};