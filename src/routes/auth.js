const router = require('express').Router();
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const authController = require('../controllers/authController');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
