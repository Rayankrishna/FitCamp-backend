const { supabase, supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

/**
 * Register a new user via Supabase Auth and create a profile row.
 */
const register = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw new AppError(error.message, 400);
  }

  // Create a profile row using the service-role client (bypasses RLS)
  const userId = data.user.id;
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({ id: userId, email });

  if (profileError) {
    console.error('[AUTH] Profile creation failed:', profileError.message);
    // Non-fatal: the user can still log in; profile is created lazily if needed
  }

  return {
    user: { id: userId, email: data.user.email },
    session: data.session,
  };
};

/**
 * Log in with email + password.
 */
const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  console.log("data gikoneigneogin ", data);
  console.log("error gikoneigneogin", error);
  if (error) {
    throw new AppError(error.message, 401);
  }

  return {
    user: { id: data.user.id, email: data.user.email },
    session: data.session,
  };
};

module.exports = { register, login };
