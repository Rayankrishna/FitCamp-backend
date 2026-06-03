const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

/**
 * Helper to check if a template belongs to a user.
 */
const verifyTemplateOwnership = async (userId, templateId) => {
  const { data, error } = await supabaseAdmin
    .from('workout_templates')
    .select('id, programs(user_id)')
    .eq('id', templateId)
    .single();

  if (error || !data || !data.programs || data.programs.user_id !== userId) {
    throw new AppError('Workout template not found or access denied', 404);
  }
  return data;
};

/**
 * Create a program.
 */
const createProgram = async (userId, name, description) => {
  const { data, error } = await supabaseAdmin
    .from('programs')
    .insert({ user_id: userId, name, description })
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
};

/**
 * Get all programs of a user.
 */
const getPrograms = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('programs')
    .select('*, workout_templates(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new AppError(error.message, 400);
  return data;
};

/**
 * Create a workout template.
 */
const createTemplate = async (userId, programId, name) => {
  // Verify program ownership
  const { data: program, error: programError } = await supabaseAdmin
    .from('programs')
    .select('id')
    .eq('id', programId)
    .eq('user_id', userId)
    .single();

  if (programError || !program) {
    throw new AppError('Program not found or access denied', 404);
  }

  const { data, error } = await supabaseAdmin
    .from('workout_templates')
    .insert({ program_id: programId, name })
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
};

/**
 * Add exercise to template.
 */
const addExerciseToTemplate = async (userId, templateId, exerciseId, sequenceOrder = 0) => {
  await verifyTemplateOwnership(userId, templateId);

  // Check if already in template
  const { data: existing } = await supabaseAdmin
    .from('workout_template_exercises')
    .select('id')
    .eq('workout_template_id', templateId)
    .eq('exercise_id', exerciseId)
    .single();

  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from('workout_template_exercises')
    .insert({
      workout_template_id: templateId,
      exercise_id: exerciseId,
      sequence_order: sequenceOrder,
    })
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
};

/**
 * Remove exercise from template.
 */
const removeExerciseFromTemplate = async (userId, templateId, exerciseId) => {
  await verifyTemplateOwnership(userId, templateId);

  const { error } = await supabaseAdmin
    .from('workout_template_exercises')
    .delete()
    .eq('workout_template_id', templateId)
    .eq('exercise_id', exerciseId);

  if (error) throw new AppError(error.message, 400);
  return { success: true };
};

/**
 * Helper to fetch the most recent sets performed by the user for an exercise.
 */
const getLastExerciseSets = async (userId, exerciseId) => {
  const { data, error } = await supabaseAdmin
    .from('sets')
    .select('workout_id, workouts!inner(user_id, date)')
    .eq('exercise_id', exerciseId)
    .eq('workouts.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  const lastWorkoutId = data[0].workout_id;
  const { data: sets, error: setsError } = await supabaseAdmin
    .from('sets')
    .select('reps, weight')
    .eq('workout_id', lastWorkoutId)
    .eq('exercise_id', exerciseId)
    .order('created_at', { ascending: true });

  if (setsError) return null;

  return {
    workout_id: lastWorkoutId,
    date: data[0].workouts.date,
    sets: sets.map((s) => ({ reps: s.reps, weight: parseFloat(s.weight) })),
  };
};

/**
 * Get a workout template with exercises and previous set logs.
 */
const getTemplateById = async (userId, templateId) => {
  await verifyTemplateOwnership(userId, templateId);

  // Fetch template and its exercises
  const { data: template, error } = await supabaseAdmin
    .from('workout_templates')
    .select('*, workout_template_exercises(id, sequence_order, exercises(*))')
    .eq('id', templateId)
    .single();

  if (error || !template) {
    throw new AppError('Template not found', 404);
  }

  // Get previous set performance for each exercise
  const exercisesWithPrev = await Promise.all(
    (template.workout_template_exercises || []).map(async (te) => {
      const exercise = te.exercises;
      const prevData = await getLastExerciseSets(userId, exercise.id);
      return {
        id: te.id,
        sequence_order: te.sequence_order,
        exercise,
        previous_performance: prevData,
      };
    })
  );

  return {
    id: template.id,
    program_id: template.program_id,
    name: template.name,
    created_at: template.created_at,
    exercises: exercisesWithPrev,
  };
};

/**
 * Create a workout.
 */
const createWorkout = async (userId, name, date, templateId = null) => {
  const workoutDate = date || new Date().toISOString().split('T')[0];

  if (templateId) {
    await verifyTemplateOwnership(userId, templateId);
  }

  const { data, error } = await supabaseAdmin
    .from('workouts')
    .insert({ user_id: userId, name, date: workoutDate, template_id: templateId })
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
const createSet = async (userId, workoutId, exerciseId, reps, weight, addToTemplate = true) => {
  // Verify the workout belongs to the user
  const { data: workout, error: workoutError } = await supabaseAdmin
    .from('workouts')
    .select('id, template_id')
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

  // Auto-update template if workout is based on template and addToTemplate is true
  if (workout.template_id && addToTemplate) {
    // Check if exercise is already in the template
    const { data: existing } = await supabaseAdmin
      .from('workout_template_exercises')
      .select('id')
      .eq('workout_template_id', workout.template_id)
      .eq('exercise_id', exerciseId)
      .single();

    if (!existing) {
      // Get the highest sequence order or count
      const { count } = await supabaseAdmin
        .from('workout_template_exercises')
        .select('id', { count: 'exact', head: true })
        .eq('workout_template_id', workout.template_id);

      await supabaseAdmin.from('workout_template_exercises').insert({
        workout_template_id: workout.template_id,
        exercise_id: exerciseId,
        sequence_order: count || 0,
      });
    }
  }

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

/**
 * Get workout calendar logs.
 */
const getWorkoutCalendar = async (userId, startDate, endDate) => {
  const { data, error } = await supabaseAdmin
    .from('workouts')
    .select('id, name, date, template_id, workout_templates(name), sets(id)')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw new AppError(error.message, 400);

  // Map to group sets / exercises by date
  return (data || []).map((w) => ({
    id: w.id,
    name: w.name,
    date: w.date,
    template_id: w.template_id,
    template_name: w.workout_templates ? w.workout_templates.name : null,
    total_sets: (w.sets || []).length,
  }));
};

/**
 * Get exercise progress history.
 */
const getExerciseProgress = async (userId, exerciseId) => {
  const { data, error } = await supabaseAdmin
    .from('sets')
    .select('id, reps, weight, created_at, workout_id, workouts!inner(date, name)')
    .eq('exercise_id', exerciseId)
    .eq('workouts.user_id', userId)
    .order('workouts.date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new AppError(error.message, 400);

  return (data || []).map((s) => ({
    set_id: s.id,
    workout_id: s.workout_id,
    workout_name: s.workouts.name,
    date: s.workouts.date,
    reps: s.reps,
    weight: parseFloat(s.weight),
    created_at: s.created_at,
  }));
};

module.exports = {
  createWorkout,
  createExercise,
  createSet,
  getWorkoutById,
  createProgram,
  getPrograms,
  createTemplate,
  addExerciseToTemplate,
  removeExerciseFromTemplate,
  getTemplateById,
  getWorkoutCalendar,
  getExerciseProgress,
};
