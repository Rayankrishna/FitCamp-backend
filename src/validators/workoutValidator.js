const { z } = require('zod');

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
});

const createExerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  muscle_group: z.string().optional(),
});

const createSetSchema = z.object({
  workout_id: z.string().uuid('Invalid workout ID'),
  exercise_id: z.string().uuid('Invalid exercise ID'),
  reps: z.number().int().positive('Reps must be a positive integer'),
  weight: z.number().nonnegative('Weight must be non-negative'),
});

const workoutIdParamSchema = z.object({
  id: z.string().uuid('Invalid workout ID'),
});

module.exports = {
  createWorkoutSchema,
  createExerciseSchema,
  createSetSchema,
  workoutIdParamSchema,
};
