const { z } = require('zod');

// Phone number must be exactly 10 digits
const phoneRegex = /^\d{10}$/;

/**
 * Login validation schema
 */
const loginSchema = z.object({
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(phoneRegex, 'Phone number must be exactly 10 digits'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
});

/**
 * Register validation schema
 */
const registerSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(phoneRegex, 'Phone number must be exactly 10 digits'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'WARDEN', 'TECHNICIAN', 'SECURITY', 'ADMIN', 'MESS', 'KIOSK'], {
    errorMap: () => ({ message: 'Invalid role selected' })
  }),
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