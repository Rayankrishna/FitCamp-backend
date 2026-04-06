const router = require('express').Router();
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createWorkoutSchema,
  createExerciseSchema,
  createSetSchema,
  workoutIdParamSchema,
} = require('../validators/workoutValidator');
const workoutController = require('../controllers/workoutController');

router.use(authenticate); // All workout routes are protected

router.post('/', validate(createWorkoutSchema), workoutController.createWorkout);
router.post('/exercise', validate(createExerciseSchema), workoutController.createExercise);
router.post('/set', validate(createSetSchema), workoutController.createSet);
router.get('/:id', validate(workoutIdParamSchema, 'params'), workoutController.getWorkoutById);

module.exports = router;
