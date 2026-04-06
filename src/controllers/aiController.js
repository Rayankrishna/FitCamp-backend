const aiService = require('../services/aiService');

const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = await aiService.getSuggestions(req.user.id);
    res.json({ success: true, data: suggestions });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSuggestions };
