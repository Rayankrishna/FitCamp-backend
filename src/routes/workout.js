const router = require('express').Router();
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createWorkoutSchema,
  createExerciseSchema,
  createSetSchema,
  workoutIdParamSchema,
  createProgramSchema,
  createTemplateSchema,
  addTemplateExerciseSchema,
  calendarQuerySchema,
  exerciseIdParamSchema,
} = require('../validators/workoutValidator');
const workoutController = require('../controllers/workoutController');

router.use(authenticate); // All workout routes are protected

// Programs
router.post('/programs', validate(createProgramSchema), workoutController.createProgram);
router.get('/programs', workoutController.getPrograms);

// Templates
router.post('/templates', validate(createTemplateSchema), workoutController.createTemplate);
router.get('/templates/:id', validate(workoutIdParamSchema, 'params'), workoutController.getTemplateById);
router.post('/templates/:id/exercises', validate(workoutIdParamSchema, 'params'), validate(addTemplateExerciseSchema), workoutController.addExerciseToTemplate);
router.delete('/templates/:id/exercises/:exercise_id', validate(workoutIdParamSchema, 'params'), validate(exerciseIdParamSchema, 'params'), workoutController.removeExerciseFromTemplate);

// Calendar & Progress
router.get('/calendar', validate(calendarQuerySchema, 'query'), workoutController.getWorkoutCalendar);
router.get('/progress/:exercise_id', validate(exerciseIdParamSchema, 'params'), workoutController.getExerciseProgress);

// Workouts & Sets
router.post('/', validate(createWorkoutSchema), workoutController.createWorkout);
router.post('/exercise', validate(createExerciseSchema), workoutController.createExercise);
router.post('/set', validate(createSetSchema), workoutController.createSet);
router.get('/:id', validate(workoutIdParamSchema, 'params'), workoutController.getWorkoutById);

module.exports = router;
