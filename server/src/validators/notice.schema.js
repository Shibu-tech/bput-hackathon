const { z } = require('zod');

/**
 * Notice creation validation schema
 */
const noticeSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  isEmergency: z.boolean().optional(),
  targetAudience: z.object({
    hostel: z.enum(['Hostel A', 'Hostel B', 'Hostel C', 'ALL']).optional(),
    batch: z.enum(['2023', '2024', '2025', 'ALL']).optional()
  }).optional()
});

module.exports = {
  noticeSchema
};