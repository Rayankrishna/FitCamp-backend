const router = require('express').Router();
const authenticate = require('../middleware/auth');
const aiController = require('../controllers/aiController');

router.use(authenticate); // All AI routes are protected

router.post('/suggestions', aiController.getSuggestions);

module.exports = router;
