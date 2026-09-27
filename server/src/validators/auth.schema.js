const { z } = require('zod');

/**
 * Login validation schema
 */
const loginSchema = z.object({
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

/**
 * Register validation schema
 */
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'WARDEN', 'TECHNICIAN', 'SECURITY', 'ADMIN', 'MESS', 'KIOSK']),
  // Optional fields based on role
  locationId: z.string().optional(), // For students
  hostel: z.string().optional(), // For students/wardens
  batch: z.string().optional(), // For students
  shifts: z.array(z.object({
    category: z.enum(['IT', 'ELECTRICAL', 'PLUMBING', 'CARPENTRY', 'HVAC', 'OTHER']),
    startMinute: z.number().min(0).max(1439),
    endMinute: z.number().min(0).max(1439)
  })).optional() // For technicians
});

module.exports = {
  loginSchema,
  registerSchema
};