const router = require('express').Router();
const auth = require('../middleware/auth');
const homeController = require('../controllers/homeController');

/**
 * @route GET /api/home
 * @desc Get home screen summary (profile, today's food/workouts)
 * @access Private
 */
router.get('/', auth, homeController.getHomeSummary);

module.exports = router;
