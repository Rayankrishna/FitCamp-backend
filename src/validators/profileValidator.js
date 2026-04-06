const { z } = require('zod');

const updateProfileSchema = z.object({
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  age: z.number().int().positive().max(150).optional(),
  description: z.string().max(500).optional(),
});

module.exports = { updateProfileSchema };
