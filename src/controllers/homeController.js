const homeService = require('../services/homeService');

const getHomeSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const summary = await homeService.getHomeSummary(userId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHomeSummary };
