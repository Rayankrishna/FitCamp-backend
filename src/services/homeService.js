const profileService = require('./profileService');
const foodService = require('./foodService');
const { supabaseAdmin } = require('../config/supabase');

/**
 * Get a summary for the home screen:
 * 1. Personal info (profile).
 * 2. Today's macro summary.
 * 3. Today's workout summary.
 */
const getHomeSummary = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Get profile
  const profile = await profileService.getProfile(userId);

  // 2. Get today's macros
  const dailyMacros = await foodService.getDailyMacros(userId, today);

  // 3. Get today's workouts
  const { data: workouts, error: workoutError } = await supabaseAdmin
    .from('workouts')
    .select('id, name, date')
    .eq('user_id', userId)
    .eq('date', today);

  if (workoutError) {
    console.error('[HOME] Workout fetch failed:', workoutError.message);
  }

  // Handle "user data not filled" logic
  const personalInfo = {
    email: profile.email,
    height: profile.height === null ? 'user data not filled' : profile.height,
    weight: profile.weight === null ? 'user data not filled' : profile.weight,
    age: profile.age,
    description: profile.description,
  };

  return {
    personal_info: personalInfo,
    food_summary: {
      date: today,
      total_calories: dailyMacros.total_calories,
      total_protein: dailyMacros.total_protein,
      total_carbs: dailyMacros.total_carbs,
      total_fat: dailyMacros.total_fat,
      item_count: (dailyMacros.items || []).length,
    },
    workout_summary: {
      date: today,
      workouts: (workouts || []).map((w) => ({
        id: w.id,
        name: w.name,
      })),
      count: (workouts || []).length,
    },
  };
};

module.exports = { getHomeSummary };
