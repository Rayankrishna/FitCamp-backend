const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get a user's profile by their auth ID.
 */
const getProfile = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, height, weight, age, description, calorie_goal, protein_goal, fat_goal, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new AppError('Profile not found', 404);
  }

  return data;
};

/**
 * Update a user's profile.
 */
const updateProfile = async (userId, updates) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return data;
};

module.exports = { getProfile, updateProfile };
