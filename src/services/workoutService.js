const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

/**
 * Create a workout.
 */
const createWorkout = async (userId, name, date) => {
  const workoutDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('workouts')
    .insert({ user_id: userId, name, date: workoutDate })
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
};

/**
 * Create an exercise (global catalogue — not user-specific).
 */
const createExercise = async (name, muscleGroup) => {
  // Check if exercise with the same name already exists
  const { data: existing } = await supabaseAdmin
    .from('exercises')
    .select('*')
    .ilike('name', name)
    .single();

  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from('exercises')
    .insert({ name, muscle_group: muscleGroup || null })
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
};

/**
 * Log a set (reps + weight) for an exercise within a workout.
 */
const createSet = async (userId, workoutId, exerciseId, reps, weight) => {
  // Verify the workout belongs to the user
  const { data: workout, error: workoutError } = await supabaseAdmin
    .from('workouts')
    .select('id')
    .eq('id', workoutId)
    .eq('user_id', userId)
    .single();

  if (workoutError || !workout) {
    throw new AppError('Workout not found or access denied', 404);
  }

  const { data, error } = await supabaseAdmin
    .from('sets')
    .insert({ workout_id: workoutId, exercise_id: exerciseId, reps, weight })
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
};

/**
 * Get a workout with all its sets and exercise details.
 */
const getWorkoutById = async (userId, workoutId) => {
  // Fetch the workout
  const { data: workout, error: workoutError } = await supabaseAdmin
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .eq('user_id', userId)
    .single();

  if (workoutError || !workout) {
    throw new AppError('Workout not found or access denied', 404);
  }

  // Fetch sets with exercise info
  const { data: sets, error: setsError } = await supabaseAdmin
    .from('sets')
    .select('id, reps, weight, created_at, exercises(id, name, muscle_group)')
    .eq('workout_id', workoutId)
    .order('created_at', { ascending: true });

  if (setsError) throw new AppError(setsError.message, 400);

  return { ...workout, sets: sets || [] };
};

module.exports = { createWorkout, createExercise, createSet, getWorkoutById };
