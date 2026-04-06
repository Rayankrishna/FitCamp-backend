const { z } = require('zod');

const barcodeParamSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
});

const createMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  items: z
    .array(
      z.object({
        food_id: z.string().uuid('Invalid food ID'),
        grams: z.number().positive('Grams must be positive'),
      })
    )
    .min(1, 'At least one meal item is required'),
});

const dailyQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
});

module.exports = { barcodeParamSchema, createMealSchema, dailyQuerySchema };
