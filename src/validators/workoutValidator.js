const { z } = require('zod');

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  template_id: z.string().uuid('Invalid template ID').optional(),
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
  add_to_template: z.boolean().optional(),
});

const workoutIdParamSchema = z.object({
  id: z.string().uuid('Invalid workout ID'),
});

const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
});

const createTemplateSchema = z.object({
  program_id: z.string().uuid('Invalid program ID'),
  name: z.string().min(1, 'Template name is required'),
});

const addTemplateExerciseSchema = z.object({
  exercise_id: z.string().uuid('Invalid exercise ID'),
  sequence_order: z.number().int().nonnegative().optional(),
});

const calendarQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
});

const exerciseIdParamSchema = z.object({
  exercise_id: z.string().uuid('Invalid exercise ID'),
});

module.exports = {
  createWorkoutSchema,
  createExerciseSchema,
  createSetSchema,
  workoutIdParamSchema,
  createProgramSchema,
  createTemplateSchema,
  addTemplateExerciseSchema,
  calendarQuerySchema,
  exerciseIdParamSchema,
};
