const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const OPEN_FOOD_FACTS_URL = 'https://world.openfoodfacts.org/api/v0/product';

/**
 * Look up a food by barcode.
 *  1. Check local DB cache first.
 *  2. If not cached, fetch from Open Food Facts, normalize, and cache.
 */
const getByBarcode = async (barcode) => {
  // 1. Check cache
  const { data: cached } = await supabaseAdmin
    .from('foods')
    .select('*')
    .eq('barcode', barcode)
    .single();

  if (cached) return cached;

  // 2. Fetch from Open Food Facts
  const response = await fetch(`${OPEN_FOOD_FACTS_URL}/${barcode}.json`);
  if (!response.ok) {
    throw new AppError('Failed to fetch from Open Food Facts', 502);
  }

  const json = await response.json();
  if (json.status !== 1 || !json.product) {
    throw new AppError('Product not found for this barcode', 404);
  }

  const p = json.product;
  const nutrients = p.nutriments || {};

  const food = {
    barcode,
    name: p.product_name || p.product_name_en || 'Unknown',
    protein: round(nutrients['proteins_100g'] || 0),
    carbs: round(nutrients['carbohydrates_100g'] || 0),
    fat: round(nutrients['fat_100g'] || 0),
    fiber: round(nutrients['fiber_100g'] || 0),
    calories: round(nutrients['energy-kcal_100g'] || 0),
  };

  // 3. Cache in DB
  const { data: inserted, error } = await supabaseAdmin
    .from('foods')
    .insert(food)
    .select()
    .single();

  if (error) {
    console.error('[FOOD] Cache insert failed:', error.message);
    // Return the food even if caching fails
    return { id: null, ...food };
  }

  return inserted;
};

/**
 * Create a meal with items for a user.
 */
const createMeal = async (userId, date, items) => {
  const mealDate = date || new Date().toISOString().split('T')[0];

  // Insert meal
  const { data: meal, error: mealError } = await supabaseAdmin
    .from('meals')
    .insert({ user_id: userId, date: mealDate })
    .select()
    .single();

  if (mealError) throw new AppError(mealError.message, 400);

  // Insert meal items
  const mealItems = items.map((item) => ({
    meal_id: meal.id,
    food_id: item.food_id,
    grams: item.grams,
  }));

  const { data: insertedItems, error: itemsError } = await supabaseAdmin
    .from('meal_items')
    .insert(mealItems)
    .select();

  if (itemsError) throw new AppError(itemsError.message, 400);

  return { ...meal, items: insertedItems };
};

/**
 * Get daily macro totals for a user on a given date.
 * Macros are scaled: (nutrient_per_100g * grams) / 100
 */
const getDailyMacros = async (userId, date) => {
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Get all meals for the date
  const { data: meals, error: mealsError } = await supabaseAdmin
    .from('meals')
    .select('id')
    .eq('user_id', userId)
    .eq('date', targetDate);

  if (mealsError) throw new AppError(mealsError.message, 400);

  if (!meals || meals.length === 0) {
    return {
      date: targetDate,
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      total_fiber: 0,
      meals: [],
    };
  }

  const mealIds = meals.map((m) => m.id);

  // Get all meal items with food data
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('meal_items')
    .select('grams, food_id, foods(name, protein, carbs, fat, fiber, calories)')
    .in('meal_id', mealIds);

  if (itemsError) throw new AppError(itemsError.message, 400);

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  const detailedItems = (items || []).map((item) => {
    const scale = item.grams / 100;
    const food = item.foods;
    const scaled = {
      name: food?.name || 'Unknown',
      grams: item.grams,
      calories: round((food?.calories || 0) * scale),
      protein: round((food?.protein || 0) * scale),
      carbs: round((food?.carbs || 0) * scale),
      fat: round((food?.fat || 0) * scale),
      fiber: round((food?.fiber || 0) * scale),
    };

    totalCalories += scaled.calories;
    totalProtein += scaled.protein;
    totalCarbs += scaled.carbs;
    totalFat += scaled.fat;
    totalFiber += scaled.fiber;

    return scaled;
  });

  return {
    date: targetDate,
    total_calories: round(totalCalories),
    total_protein: round(totalProtein),
    total_carbs: round(totalCarbs),
    total_fat: round(totalFat),
    total_fiber: round(totalFiber),
    items: detailedItems,
  };
};

/**
 * Create a custom food item in the DB.
 */
const createFood = async (foodData) => {
  const food = {
    barcode: foodData.barcode || null,
    name: foodData.name,
    protein: round(foodData.protein || 0),
    carbs: round(foodData.carbs || 0),
    fat: round(foodData.fat || 0),
    fiber: round(foodData.fiber || 0),
    calories: round(foodData.calories || 0),
  };

  const { data, error } = await supabaseAdmin
    .from('foods')
    .insert(food)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return data;
};

/**
 * Search foods from local database and Open Food Facts.
 */
const searchFood = async (query) => {
  // 1. Search local DB cache
  const { data: localResults, error: localError } = await supabaseAdmin
    .from('foods')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(20);

  if (localError) {
    console.error('[FOOD] Local search failed:', localError.message);
  }

  const results = localResults || [];

  // 2. Fetch from Open Food Facts search API
  try {
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'FitCamp - WebBackend - 1.0 - https://fit-camp-backend.vercel.app'
      }
    });

    if (response.ok) {
      const json = await response.json();
      const products = json.products || [];

      const parsedOff = products.map((p) => {
        const nutrients = p.nutriments || {};
        return {
          id: null,
          barcode: p.code || null,
          name: p.product_name || p.product_name_en || 'Unknown',
          protein: round(nutrients['proteins_100g'] || 0),
          carbs: round(nutrients['carbohydrates_100g'] || 0),
          fat: round(nutrients['fat_100g'] || 0),
          fiber: round(nutrients['fiber_100g'] || 0),
          calories: round(nutrients['energy-kcal_100g'] || 0),
        };
      });

      // 3. Combine results, prioritizing local database and avoiding duplicates
      const seenBarcodes = new Set(results.map((r) => r.barcode).filter(Boolean));
      const seenNames = new Set(results.map((r) => r.name.toLowerCase()));

      for (const item of parsedOff) {
        if (item.barcode && seenBarcodes.has(item.barcode)) continue;
        if (seenNames.has(item.name.toLowerCase())) continue;
        results.push(item);
        if (item.barcode) seenBarcodes.add(item.barcode);
        seenNames.add(item.name.toLowerCase());
      }
    }
  } catch (err) {
    console.error('[FOOD] Open Food Facts search failed:', err.message);
  }

  return results;
};

function round(val) {
  return Math.round(val * 100) / 100;
}

module.exports = { getByBarcode, createMeal, getDailyMacros, createFood, searchFood };
