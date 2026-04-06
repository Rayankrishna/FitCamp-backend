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

  // Calculate carb goal if calorie goal exists
  let calorieGoal = profile.calorie_goal;
  let proteinGoal = profile.protein_goal;
  let fatGoal = profile.fat_goal;
  let carbsGoal = null;

  if (calorieGoal && proteinGoal !== null && fatGoal !== null) {
    const proteinKcal = proteinGoal * 4;
    const fatKcal = fatGoal * 9;
    const carbsKcal = calorieGoal - proteinKcal - fatKcal;
    carbsGoal = Math.round((carbsKcal / 4) * 100) / 100;
  }

  return {
    personal_info: personalInfo,
    goals: {
      calorie_goal: calorieGoal || 'user data not filled',
      protein_goal: proteinGoal || 'user data not filled',
      fat_goal: fatGoal || 'user data not filled',
      carbs_goal: carbsGoal || 'user data not filled',
    },
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
