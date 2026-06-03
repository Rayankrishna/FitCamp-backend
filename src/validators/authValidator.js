const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  age: z.number().int().positive().max(150).optional(),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'active', 'very_active']).optional(),
  diet_goal: z.enum(['lose_weight', 'maintain', 'gain_weight', 'clean_bulk']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
