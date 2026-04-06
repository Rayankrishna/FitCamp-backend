const { supabase } = require('../config/supabase');
const { AppError } = require('./errorHandler');

/**
 * Auth middleware — verifies the Supabase JWT from the Authorization header.
 * Attaches `req.user` with { id, email }.
 */
const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid authorization header', 401);
    }

    const token = authHeader.split(' ')[1];
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw new AppError('Invalid or expired token', 401);
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;
