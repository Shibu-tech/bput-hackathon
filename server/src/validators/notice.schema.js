const { z } = require('zod');

/**
 * Notice creation validation schema
 */
const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  isEmergency: z.boolean().optional(),
  targetAudience: z.object({
    hostel: z.string().optional(),
    batch: z.string().optional()
  }).optional()
});

module.exports = {
  noticeSchema
};