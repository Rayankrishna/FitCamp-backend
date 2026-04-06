const foodService = require('../services/foodService');

const getByBarcode = async (req, res, next) => {
  try {
    const food = await foodService.getByBarcode(req.params.barcode);
    res.json({ success: true, data: food });
  } catch (err) {
    next(err);
  }
};

const createMeal = async (req, res, next) => {
  try {
    const { date, items } = req.body;
    const meal = await foodService.createMeal(req.user.id, date, items);
    res.status(201).json({ success: true, data: meal });
  } catch (err) {
    next(err);
  }
};

const getDailyMacros = async (req, res, next) => {
  try {
    const { date } = req.query;
    const macros = await foodService.getDailyMacros(req.user.id, date);
    res.json({ success: true, data: macros });
  } catch (err) {
    next(err);
  }
};

module.exports = { getByBarcode, createMeal, getDailyMacros };
