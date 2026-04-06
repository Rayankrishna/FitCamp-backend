const router = require('express').Router();
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  barcodeParamSchema,
  createMealSchema,
  dailyQuerySchema,
} = require('../validators/foodValidator');
const foodController = require('../controllers/foodController');

// Barcode lookup is public (useful for scanning before logging in)
router.get('/:barcode', validate(barcodeParamSchema, 'params'), foodController.getByBarcode);

// Meal + daily routes require auth
router.post('/meal', authenticate, validate(createMealSchema), foodController.createMeal);
router.get('/daily/macros', authenticate, validate(dailyQuerySchema, 'query'), foodController.getDailyMacros);

module.exports = router;
