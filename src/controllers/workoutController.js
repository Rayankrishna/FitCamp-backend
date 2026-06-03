const workoutService = require('../services/workoutService');

const createWorkout = async (req, res, next) => {
  try {
    const { name, date, template_id } = req.body;
    const workout = await workoutService.createWorkout(req.user.id, name, date, template_id);
    res.status(201).json({ success: true, data: workout });
  } catch (err) {
    next(err);
  }
};

const createExercise = async (req, res, next) => {
  try {
    const { name, muscle_group } = req.body;
    const exercise = await workoutService.createExercise(name, muscle_group);
    res.status(201).json({ success: true, data: exercise });
  } catch (err) {
    next(err);
  }
};

const createSet = async (req, res, next) => {
  try {
    const { workout_id, exercise_id, reps, weight, add_to_template } = req.body;
    const set = await workoutService.createSet(req.user.id, workout_id, exercise_id, reps, weight, add_to_template);
    res.status(201).json({ success: true, data: set });
  } catch (err) {
    next(err);
  }
};

const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await workoutService.getWorkoutById(req.user.id, req.params.id);
    res.json({ success: true, data: workout });
  } catch (err) {
    next(err);
  }
};

const createProgram = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const program = await workoutService.createProgram(req.user.id, name, description);
    res.status(201).json({ success: true, data: program });
  } catch (err) {
    next(err);
  }
};

const getPrograms = async (req, res, next) => {
  try {
    const programs = await workoutService.getPrograms(req.user.id);
    res.json({ success: true, data: programs });
  } catch (err) {
    next(err);
  }
};

const createTemplate = async (req, res, next) => {
  try {
    const { program_id, name } = req.body;
    const template = await workoutService.createTemplate(req.user.id, program_id, name);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
};

const addExerciseToTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { exercise_id, sequence_order } = req.body;
    const te = await workoutService.addExerciseToTemplate(req.user.id, id, exercise_id, sequence_order);
    res.status(201).json({ success: true, data: te });
  } catch (err) {
    next(err);
  }
};

const removeExerciseFromTemplate = async (req, res, next) => {
  try {
    const { id, exercise_id } = req.params;
    const result = await workoutService.removeExerciseFromTemplate(req.user.id, id, exercise_id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getTemplateById = async (req, res, next) => {
  try {
    const template = await workoutService.getTemplateById(req.user.id, req.params.id);
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
};

const getWorkoutCalendar = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const calendar = await workoutService.getWorkoutCalendar(req.user.id, start_date, end_date);
    res.json({ success: true, data: calendar });
  } catch (err) {
    next(err);
  }
};

const getExerciseProgress = async (req, res, next) => {
  try {
    const { exercise_id } = req.params;
    const progress = await workoutService.getExerciseProgress(req.user.id, exercise_id);
    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
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
