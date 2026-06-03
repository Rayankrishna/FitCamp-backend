const { z } = require('zod');

const updateProfileSchema = z.object({
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  age: z.number().int().positive().max(150).optional(),
  description: z.string().max(500).optional(),
  calorie_goal: z.number().positive().optional(),
  protein_goal: z.number().positive().optional(),
  fat_goal: z.number().positive().optional(),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'active', 'very_active']).optional(),
  diet_goal: z.enum(['lose_weight', 'maintain', 'gain_weight', 'clean_bulk']).optional(),
});

const updateGoalsSchema = z.object({
  calorie_goal: z.number().positive(),
  protein_goal: z.number().nonnegative(),
  fat_goal: z.number().nonnegative(),
});

module.exports = { updateProfileSchema, updateGoalsSchema };
