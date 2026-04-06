const router = require('express').Router();
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/profileValidator');
const profileController = require('../controllers/profileController');

router.use(authenticate); // All profile routes are protected

router.get('/', profileController.getProfile);
router.put('/', validate(updateProfileSchema), profileController.updateProfile);

module.exports = router;
