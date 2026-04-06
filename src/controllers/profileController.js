const profileService = require('../services/profileService');

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const setupProfile = async (req, res, next) => {
  try {
    const { height, weight, age } = req.body;
    const profile = await profileService.updateProfile(req.user.id, { height, weight, age });
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const updateGoals = async (req, res, next) => {
  try {
    const { calorie_goal, protein_goal, fat_goal } = req.body;
    const profile = await profileService.updateProfile(req.user.id, {
      calorie_goal,
      protein_goal,
      fat_goal,
    });
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, setupProfile, updateGoals };
