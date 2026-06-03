const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { email, password, height, weight, age, activity_level, diet_goal } = req.body;
    const result = await authService.register(email, password, {
      height,
      weight,
      age,
      activity_level,
      diet_goal,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
