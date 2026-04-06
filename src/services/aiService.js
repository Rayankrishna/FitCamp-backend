const profileService = require('./profileService');
const foodService = require('./foodService');
const { supabaseAdmin } = require('../config/supabase');

/**
 * Generate AI suggestions (placeholder logic).
 * Uses Mifflin-St Jeor equation for BMR estimation and returns
 * hardcoded but realistic diet + workout recommendations.
 */
const getSuggestions = async (userId) => {
  // 1. Get user profile
  const profile = await profileService.getProfile(userId);

  // 2. Get today's macros
  const today = new Date().toISOString().split('T')[0];
  const dailyMacros = await foodService.getDailyMacros(userId, today);

  // 3. Get recent workouts (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: recentWorkouts } = await supabaseAdmin
    .from('workouts')
    .select('id, name, date')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  // 4. Calculate targets using Mifflin-St Jeor (placeholder defaults)
  const weight = profile.weight || 70;
  const height = profile.height || 170;
  const age = profile.age || 25;

  // BMR estimation (using male formula as default; a gender field could improve this)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const activityMultiplier = 1.55; // moderate activity
  const tdee = Math.round(bmr * activityMultiplier);
  const proteinTarget = Math.round(weight * 2); // 2g per kg bodyweight

  // 5. Build response
  return {
    profile_summary: {
      height: profile.height,
      weight: profile.weight,
      age: profile.age,
    },
    daily_macros: {
      date: today,
      consumed_calories: dailyMacros.total_calories,
      consumed_protein: dailyMacros.total_protein,
      consumed_carbs: dailyMacros.total_carbs,
      consumed_fat: dailyMacros.total_fat,
    },
    recent_workouts: (recentWorkouts || []).map((w) => ({
      name: w.name,
      date: w.date,
    })),
    recommendations: {
      calorie_target: tdee,
      protein_target: proteinTarget,
      remaining_calories: Math.max(0, tdee - dailyMacros.total_calories),
      remaining_protein: Math.max(0, proteinTarget - dailyMacros.total_protein),
      suggested_meals: [
        {
          name: 'Grilled Chicken Breast with Brown Rice',
          calories: 450,
          protein: 42,
          carbs: 40,
          fat: 10,
        },
        {
          name: 'Greek Yogurt with Mixed Berries and Granola',
          calories: 320,
          protein: 25,
          carbs: 38,
          fat: 8,
        },
        {
          name: 'Salmon with Sweet Potato and Broccoli',
          calories: 520,
          protein: 38,
          carbs: 45,
          fat: 18,
        },
        {
          name: 'Protein Shake with Banana and Peanut Butter',
          calories: 380,
          protein: 35,
          carbs: 30,
          fat: 14,
        },
      ],
      workout_suggestions: generateWorkoutSuggestions(recentWorkouts || []),
    },
  };
};

/**
 * Generate workout suggestions based on which muscle groups were trained recently.
 */
function generateWorkoutSuggestions(recentWorkouts) {
  const recentNames = recentWorkouts.map((w) => w.name.toLowerCase());

  const allSuggestions = [
    {
      name: 'Upper Body Push',
      exercises: ['Bench Press 4x8', 'Overhead Press 3x10', 'Tricep Dips 3x12', 'Lateral Raises 3x15'],
    },
    {
      name: 'Lower Body',
      exercises: ['Squats 4x8', 'Romanian Deadlifts 3x10', 'Leg Press 3x12', 'Calf Raises 4x15'],
    },
    {
      name: 'Pull Day',
      exercises: ['Deadlifts 4x6', 'Pull-ups 3x8', 'Barbell Rows 3x10', 'Bicep Curls 3x12'],
    },
    {
      name: 'Full Body',
      exercises: ['Squats 3x8', 'Bench Press 3x8', 'Rows 3x10', 'Overhead Press 3x10'],
    },
    {
      name: 'Core & Conditioning',
      exercises: ['Planks 3x60s', 'Russian Twists 3x20', 'Mountain Climbers 3x15', 'Hanging Leg Raises 3x12'],
    },
  ];

  // Prefer workouts the user hasn't done recently
  const suggestions = allSuggestions.filter(
    (s) => !recentNames.some((n) => n.includes(s.name.toLowerCase()))
  );

  return suggestions.length > 0 ? suggestions.slice(0, 3) : allSuggestions.slice(0, 3);
}

module.exports = { getSuggestions };
