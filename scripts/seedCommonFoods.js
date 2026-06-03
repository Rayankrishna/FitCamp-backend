const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const commonFoods = [
  // === Grains & Carbs ===
  { barcode: 'common_rice_white', name: 'Cooked White Rice', protein: 2.7, carbs: 28.0, fat: 0.3, fiber: 0.4, calories: 130.0 },
  { barcode: 'common_rice_brown', name: 'Cooked Brown Rice', protein: 2.6, carbs: 23.0, fat: 0.9, fiber: 1.8, calories: 111.0 },
  { barcode: 'common_chappathi', name: 'Chappathi / Roti', protein: 8.0, carbs: 50.0, fat: 3.0, fiber: 4.0, calories: 260.0 },
  { barcode: 'common_wheat_bread', name: 'Whole Wheat Bread', protein: 13.0, carbs: 41.0, fat: 3.4, fiber: 7.0, calories: 247.0 },
  { barcode: 'common_white_bread', name: 'White Bread', protein: 9.0, carbs: 49.0, fat: 3.2, fiber: 2.7, calories: 265.0 },
  { barcode: 'common_oats_raw', name: 'Oats (Raw)', protein: 16.9, carbs: 66.0, fat: 6.9, fiber: 10.6, calories: 389.0 },
  { barcode: 'common_sweet_potato', name: 'Sweet Potato (Boiled)', protein: 1.6, carbs: 20.0, fat: 0.1, fiber: 3.0, calories: 86.0 },
  { barcode: 'common_potato_boiled', name: 'Potato (Boiled)', protein: 1.9, carbs: 20.0, fat: 0.1, fiber: 1.8, calories: 87.0 },
  { barcode: 'common_quinoa_cooked', name: 'Quinoa (Cooked)', protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, calories: 120.0 },
  { barcode: 'common_pasta_cooked', name: 'Pasta (Cooked)', protein: 5.0, carbs: 25.0, fat: 1.1, fiber: 1.8, calories: 131.0 },
  { barcode: 'common_idli', name: 'Idli', protein: 3.0, carbs: 25.0, fat: 0.5, fiber: 1.5, calories: 120.0 },
  { barcode: 'common_plain_dosa', name: 'Plain Dosa', protein: 3.9, carbs: 29.0, fat: 3.7, fiber: 1.0, calories: 168.0 },
  { barcode: 'common_rava_upma', name: 'Rava Upma', protein: 4.0, carbs: 30.0, fat: 4.0, fiber: 2.0, calories: 170.0 },

  // === Meats, Poultry & Seafood ===
  { barcode: 'common_chicken_breast', name: 'Chicken Breast (Cooked)', protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0, calories: 165.0 },
  { barcode: 'common_chicken_thigh', name: 'Chicken Thigh (Cooked)', protein: 26.0, carbs: 0.0, fat: 10.9, fiber: 0.0, calories: 209.0 },
  { barcode: 'common_turkey_breast', name: 'Turkey Breast (Cooked)', protein: 30.0, carbs: 0.0, fat: 1.0, fiber: 0.0, calories: 135.0 },
  { barcode: 'common_beef_lean', name: 'Beef (Lean, Cooked)', protein: 26.0, carbs: 0.0, fat: 15.0, fiber: 0.0, calories: 250.0 },
  { barcode: 'common_pork_chop', name: 'Pork Chop (Cooked)', protein: 27.0, carbs: 0.0, fat: 14.0, fiber: 0.0, calories: 242.0 },
  { barcode: 'common_salmon', name: 'Salmon (Cooked)', protein: 22.0, carbs: 0.0, fat: 12.0, fiber: 0.0, calories: 206.0 },
  { barcode: 'common_tuna_canned', name: 'Tuna (Canned in Water)', protein: 26.0, carbs: 0.0, fat: 1.0, fiber: 0.0, calories: 116.0 },
  { barcode: 'common_cod_fish', name: 'Cod / White Fish (Cooked)', protein: 23.0, carbs: 0.0, fat: 1.0, fiber: 0.0, calories: 105.0 },
  { barcode: 'common_shrimp', name: 'Shrimp (Cooked)', protein: 24.0, carbs: 0.2, fat: 0.3, fiber: 0.0, calories: 99.0 },
  { barcode: 'common_egg_whole', name: 'Whole Egg (Boiled)', protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0.0, calories: 155.0 },
  { barcode: 'common_egg_white', name: 'Egg White (Boiled)', protein: 11.0, carbs: 0.7, fat: 0.2, fiber: 0.0, calories: 52.0 },

  // === Dairy & Alternatives ===
  { barcode: 'common_paneer', name: 'Paneer (Cottage Cheese)', protein: 18.0, carbs: 1.2, fat: 20.0, fiber: 0.0, calories: 265.0 },
  { barcode: 'common_greek_yogurt', name: 'Greek Yogurt (Plain, Non-fat)', protein: 10.0, carbs: 3.6, fat: 0.4, fiber: 0.0, calories: 59.0 },
  { barcode: 'common_curd', name: 'Curd / Plain Yogurt', protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0.0, calories: 61.0 },
  { barcode: 'common_whole_milk', name: 'Whole Milk (3.25%)', protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0.0, calories: 61.0 },
  { barcode: 'common_skim_milk', name: 'Skimmed Milk', protein: 3.4, carbs: 5.0, fat: 0.1, fiber: 0.0, calories: 34.0 },
  { barcode: 'common_soy_milk', name: 'Soy Milk (Plain)', protein: 3.3, carbs: 6.0, fat: 1.8, fiber: 0.6, calories: 54.0 },
  { barcode: 'common_almond_milk', name: 'Almond Milk (Unsweetened)', protein: 0.5, carbs: 0.3, fat: 1.2, fiber: 0.2, calories: 15.0 },
  { barcode: 'common_butter', name: 'Butter', protein: 0.9, carbs: 0.1, fat: 81.0, fiber: 0.0, calories: 717.0 },
  { barcode: 'common_cheddar_cheese', name: 'Cheddar Cheese', protein: 25.0, carbs: 1.3, fat: 33.0, fiber: 0.0, calories: 403.0 },
  { barcode: 'common_mozzarella', name: 'Mozzarella Cheese', protein: 22.0, carbs: 3.1, fat: 20.0, fiber: 0.0, calories: 280.0 },
  { barcode: 'common_whey_protein', name: 'Whey Protein Powder', protein: 80.0, carbs: 6.0, fat: 5.0, fiber: 0.0, calories: 390.0 },

  // === Vegetables ===
  { barcode: 'common_broccoli', name: 'Broccoli (Raw)', protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6, calories: 34.0 },
  { barcode: 'common_spinach', name: 'Spinach (Raw)', protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, calories: 23.0 },
  { barcode: 'common_cauliflower', name: 'Cauliflower (Raw)', protein: 1.9, carbs: 5.0, fat: 0.3, fiber: 2.0, calories: 25.0 },
  { barcode: 'common_carrots', name: 'Carrots (Raw)', protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, calories: 41.0 },
  { barcode: 'common_tomato', name: 'Tomato (Raw)', protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, calories: 18.0 },
  { barcode: 'common_cucumber', name: 'Cucumber (Raw)', protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, calories: 15.0 },
  { barcode: 'common_onions', name: 'Onions (Raw)', protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, calories: 40.0 },
  { barcode: 'common_bell_pepper', name: 'Bell Pepper (Raw)', protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.7, calories: 20.0 },
  { barcode: 'common_mushrooms', name: 'Mushrooms (Button)', protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0, calories: 22.0 },
  { barcode: 'common_garlic', name: 'Garlic', protein: 6.4, carbs: 33.0, fat: 0.5, fiber: 2.1, calories: 149.0 },
  { barcode: 'common_green_beans', name: 'Green Beans (Boiled)', protein: 1.9, carbs: 7.9, fat: 0.3, fiber: 3.2, calories: 35.0 },
  { barcode: 'common_cabbage', name: 'Cabbage (Raw)', protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5, calories: 25.0 },
  { barcode: 'common_lettuce', name: 'Lettuce (Iceberg)', protein: 0.9, carbs: 3.0, fat: 0.1, fiber: 1.2, calories: 14.0 },

  // === Fruits ===
  { barcode: 'common_banana', name: 'Banana', protein: 1.1, carbs: 23.0, fat: 0.3, fiber: 2.6, calories: 89.0 },
  { barcode: 'common_apple', name: 'Apple', protein: 0.3, carbs: 14.0, fat: 0.2, fiber: 2.4, calories: 52.0 },
  { barcode: 'common_orange', name: 'Orange', protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, calories: 47.0 },
  { barcode: 'common_strawberry', name: 'Strawberry', protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0, calories: 32.0 },
  { barcode: 'common_blueberry', name: 'Blueberry', protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, calories: 57.0 },
  { barcode: 'common_mango', name: 'Mango', protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6, calories: 60.0 },
  { barcode: 'common_watermelon', name: 'Watermelon', protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, calories: 30.0 },
  { barcode: 'common_pineapple', name: 'Pineapple', protein: 0.5, carbs: 13.0, fat: 0.1, fiber: 1.4, calories: 50.0 },
  { barcode: 'common_grapes', name: 'Grapes', protein: 0.7, carbs: 18.0, fat: 0.2, fiber: 0.9, calories: 69.0 },
  { barcode: 'common_avocado', name: 'Avocado', protein: 2.0, carbs: 8.5, fat: 15.0, fiber: 6.7, calories: 160.0 },
  { barcode: 'common_papaya', name: 'Papaya', protein: 0.5, carbs: 11.0, fat: 0.3, fiber: 1.7, calories: 43.0 },
  { barcode: 'common_pomegranate', name: 'Pomegranate', protein: 1.7, carbs: 19.0, fat: 1.2, fiber: 4.0, calories: 83.0 },

  // === Legumes, Nuts & Seeds ===
  { barcode: 'common_chickpeas', name: 'Chickpeas / Chana (Boiled)', protein: 8.9, carbs: 27.0, fat: 2.6, fiber: 7.6, calories: 164.0 },
  { barcode: 'common_lentils', name: 'Lentils / Dal (Boiled)', protein: 9.0, carbs: 20.0, fat: 0.4, fiber: 7.9, calories: 116.0 },
  { barcode: 'common_kidney_beans', name: 'Kidney Beans / Rajma (Boiled)', protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4, calories: 127.0 },
  { barcode: 'common_edamame', name: 'Edamame (Boiled)', protein: 11.0, carbs: 10.0, fat: 5.0, fiber: 5.2, calories: 122.0 },
  { barcode: 'common_tofu', name: 'Tofu (Firm)', protein: 16.0, carbs: 2.8, fat: 8.0, fiber: 2.0, calories: 144.0 },
  { barcode: 'common_almonds', name: 'Almonds', protein: 21.0, carbs: 22.0, fat: 49.0, fiber: 12.0, calories: 579.0 },
  { barcode: 'common_peanuts', name: 'Peanuts', protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5, calories: 567.0 },
  { barcode: 'common_cashews', name: 'Cashews', protein: 18.0, carbs: 30.0, fat: 44.0, fiber: 3.3, calories: 553.0 },
  { barcode: 'common_chia_seeds', name: 'Chia Seeds', protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4, calories: 486.0 },
  { barcode: 'common_flaxseeds', name: 'Flaxseeds', protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3, calories: 534.0 },
  { barcode: 'common_peanut_butter', name: 'Peanut Butter', protein: 25.0, carbs: 20.0, fat: 50.0, fiber: 6.0, calories: 588.0 },

  // === Dishes & Prepared Meals ===
  { barcode: 'common_chicken_curry', name: 'Chicken Curry', protein: 15.0, carbs: 6.0, fat: 8.0, fiber: 1.5, calories: 150.0 },
  { barcode: 'common_paneer_masala', name: 'Paneer Butter Masala', protein: 9.5, carbs: 8.0, fat: 17.0, fiber: 1.2, calories: 220.0 },
  { barcode: 'common_dal_makhani', name: 'Dal Makhani', protein: 5.0, carbs: 16.0, fat: 6.0, fiber: 4.5, calories: 140.0 },
  { barcode: 'common_chicken_biryani', name: 'Chicken Biryani', protein: 10.0, carbs: 22.0, fat: 5.0, fiber: 1.5, calories: 160.0 },
  { barcode: 'common_samosa', name: 'Samosa', protein: 4.5, carbs: 32.0, fat: 13.0, fiber: 2.0, calories: 262.0 },
  { barcode: 'common_masala_dosa', name: 'Masala Dosa', protein: 3.5, carbs: 32.0, fat: 5.5, fiber: 2.0, calories: 190.0 },
  { barcode: 'common_pav_bhaji', name: 'Pav Bhaji', protein: 3.2, carbs: 20.0, fat: 6.5, fiber: 2.5, calories: 150.0 },
  { barcode: 'common_chole_bhature', name: 'Chole Bhature', protein: 7.5, carbs: 38.0, fat: 11.0, fiber: 4.0, calories: 280.0 },
  { barcode: 'common_pizza_margherita', name: 'Pizza Margherita', protein: 10.0, carbs: 30.0, fat: 10.0, fiber: 2.0, calories: 250.0 },
  { barcode: 'common_cheeseburger', name: 'Beef Cheeseburger', protein: 15.0, carbs: 24.0, fat: 12.0, fiber: 1.5, calories: 260.0 },
  { barcode: 'common_french_fries', name: 'French Fries', protein: 3.4, carbs: 41.0, fat: 15.0, fiber: 3.8, calories: 312.0 },
  { barcode: 'common_chicken_sandwich', name: 'Grilled Chicken Sandwich', protein: 18.0, carbs: 26.0, fat: 5.0, fiber: 2.0, calories: 220.0 },
  { barcode: 'common_caesar_salad', name: 'Caesar Salad (with Chicken)', protein: 12.0, carbs: 5.0, fat: 11.5, fiber: 1.5, calories: 170.0 },

  // === Snacks & Desserts ===
  { barcode: 'common_dark_chocolate', name: 'Dark Chocolate (70-85%)', protein: 7.8, carbs: 46.0, fat: 43.0, fiber: 11.0, calories: 598.0 },
  { barcode: 'common_gulab_jamun', name: 'Gulab Jamun', protein: 3.0, carbs: 60.0, fat: 6.0, fiber: 0.5, calories: 300.0 },
  { barcode: 'common_kheer', name: 'Kheer / Rice Pudding', protein: 3.0, carbs: 20.0, fat: 2.5, fiber: 0.2, calories: 110.0 },
  { barcode: 'common_digestive_biscuits', name: 'Digestive Biscuits', protein: 7.0, carbs: 68.0, fat: 20.0, fiber: 3.5, calories: 462.0 },
  { barcode: 'common_potato_chips', name: 'Potato Chips', protein: 7.0, carbs: 53.0, fat: 35.0, fiber: 4.3, calories: 536.0 },
  { barcode: 'common_popcorn', name: 'Popcorn (Air-Popped)', protein: 12.9, carbs: 77.9, fat: 4.5, fiber: 14.5, calories: 387.0 },

  // === Beverages ===
  { barcode: 'common_orange_juice', name: 'Orange Juice (Fresh)', protein: 0.7, carbs: 10.4, fat: 0.2, fiber: 0.2, calories: 45.0 },
  { barcode: 'common_coconut_water', name: 'Coconut Water', protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 1.1, calories: 19.0 },
  { barcode: 'common_coffee_black', name: 'Coffee (Black)', protein: 0.1, carbs: 0.0, fat: 0.0, fiber: 0.0, calories: 1.0 },
  { barcode: 'common_green_tea', name: 'Green Tea', protein: 0.2, carbs: 0.0, fat: 0.0, fiber: 0.0, calories: 1.0 },
  { barcode: 'common_soda_coke', name: 'Coca Cola / Soda', protein: 0.0, carbs: 10.0, fat: 0.0, fiber: 0.0, calories: 38.0 },
  { barcode: 'common_beer', name: 'Beer', protein: 0.5, carbs: 3.6, fat: 0.0, fiber: 0.0, calories: 43.0 },
  { barcode: 'common_red_wine', name: 'Red Wine', protein: 0.1, carbs: 2.6, fat: 0.0, fiber: 0.0, calories: 85.0 },

  // === Fats, Oils & Condiments ===
  { barcode: 'common_olive_oil', name: 'Olive Oil', protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0, calories: 884.0 },
  { barcode: 'common_coconut_oil', name: 'Coconut Oil', protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0, calories: 862.0 },
  { barcode: 'common_ghee', name: 'Ghee (Clarified Butter)', protein: 0.0, carbs: 0.0, fat: 100.0, fiber: 0.0, calories: 897.0 },
  { barcode: 'common_honey', name: 'Honey', protein: 0.3, carbs: 82.4, fat: 0.0, fiber: 0.2, calories: 304.0 },
  { barcode: 'common_ketchup', name: 'Tomato Ketchup', protein: 1.2, carbs: 27.2, fat: 0.1, fiber: 0.3, calories: 112.0 },
  { barcode: 'common_hummus', name: 'Hummus', protein: 7.9, carbs: 14.3, fat: 9.6, fiber: 6.0, calories: 166.0 },
];

async function seed() {
  console.log('Starting to seed common foods into Supabase...');

  for (const food of commonFoods) {
    // Check if food already exists by barcode
    const { data: existing } = await supabaseAdmin
      .from('foods')
      .select('id, name')
      .eq('barcode', food.barcode)
      .maybeSingle();

    if (existing) {
      console.log(`Food "${food.name}" already exists with barcode "${food.barcode}". Skipping.`);
      continue;
    }

    const { data, error } = await supabaseAdmin
      .from('foods')
      .insert(food)
      .select()
      .single();

    if (error) {
      console.error(`Failed to insert "${food.name}":`, error.message);
    } else {
      console.log(`Successfully seeded: "${data.name}" with ID ${data.id}`);
    }
  }

  console.log('Seeding finished!');
}

seed().catch((err) => {
  console.error('Unhandled error during seeding:', err);
  process.exit(1);
});
