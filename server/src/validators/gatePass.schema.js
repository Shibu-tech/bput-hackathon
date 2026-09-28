const { z } = require('zod');

/**
 * Robust time string parser that transforms any time format (e.g. "9:00", "09:00", "9:00 PM", "21:00", ISO) into standard "HH:MM"
 */
const timeStringSchema = z.string().optional().default('20:00').transform((val) => {
  if (!val) return '20:00';
  const str = String(val).trim();
  const match24 = str.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    let hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    const isPM = /pm/i.test(str);
    const isAM = /am/i.test(str);
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    if (hours >= 0 && hours <= 23 && parseInt(minutes, 10) >= 0 && parseInt(minutes, 10) <= 59) {
      return (hours < 10 ? '0' + hours : '' + hours) + ':' + minutes;
    }
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const h = d.getHours();
    const m = d.getMinutes();
    return (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m);
  }
  return '20:00';
});

/**
 * Gate pass creation validation schema
 */
const gatePassSchema = z.object({
  studentId: z.string().optional(),
  rollNumber: z.string().optional(),
  studentName: z.string().optional(),
  locationId: z.string().optional(),
  hostel: z.string().default('Hostel A'),
  reason: z.string().optional(),
  purpose: z.string().optional(),
  destination: z.string().optional(),
  requestedExitTime: timeStringSchema,
  expectedReturnTime: timeStringSchema,
  clientRequestId: z.string().optional() // Optional for idempotency
}).transform((data) => {
  // Ensure reason is present from reason or purpose or destination
  if (!data.reason) {
    data.reason = data.purpose
      ? `${data.purpose}${data.destination ? ` (${data.destination})` : ''}`
      : (data.destination || 'Campus Leave');
  }
  return data;
});

/**
 * Gate pass approval/rejection validation schema
 */
const gatePassUpdateSchema = z.object({
  status: z.preprocess((val) => String(val).toUpperCase(), z.enum(['APPROVED', 'REJECTED']))
});

module.exports = {
  gatePassSchema,
  gatePassUpdateSchema
};