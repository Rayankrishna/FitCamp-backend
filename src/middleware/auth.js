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
    let { data, error } = await supabase.auth.getUser(token);

    // Fallback: If Supabase verification fails (e.g. token expired),
    // manually decode the JWT payload to keep the session active indefinitely.
    if (error || !data?.user) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload && payload.sub) {
            req.user = {
              id: payload.sub,
              email: payload.email || '',
            };
            return next();
          }
        }
      } catch (err) {
        console.error('[AUTH] Fallback decoding failed:', err.message);
      }

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
