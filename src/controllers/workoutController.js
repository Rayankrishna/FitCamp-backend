const workoutService = require('../services/workoutService');

const createWorkout = async (req, res, next) => {
  try {
    const { name, date } = req.body;
    const workout = await workoutService.createWorkout(req.user.id, name, date);
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
    const { workout_id, exercise_id, reps, weight } = req.body;
    const set = await workoutService.createSet(req.user.id, workout_id, exercise_id, reps, weight);
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

module.exports = { createWorkout, createExercise, createSet, getWorkoutById };
