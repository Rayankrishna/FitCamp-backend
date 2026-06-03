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
  {
    barcode: 'common_chappathi',
    name: 'Chappathi',
    protein: 8.0,
    carbs: 50.0,
    fat: 3.0,
    fiber: 4.0,
    calories: 260.0,
  },
  {
    barcode: 'common_chicken_curry',
    name: 'Chicken Curry',
    protein: 15.0,
    carbs: 6.0,
    fat: 8.0,
    fiber: 1.5,
    calories: 150.0,
  },
  {
    barcode: 'common_rice',
    name: 'Cooked White Rice',
    protein: 2.7,
    carbs: 28.0,
    fat: 0.3,
    fiber: 0.4,
    calories: 130.0,
  },
  {
    barcode: 'common_egg',
    name: 'Whole Egg (Boiled)',
    protein: 13.0,
    carbs: 1.1,
    fat: 11.0,
    fiber: 0.0,
    calories: 155.0,
  },
  {
    barcode: 'common_chicken_breast',
    name: 'Chicken Breast (Cooked)',
    protein: 31.0,
    carbs: 0.0,
    fat: 3.6,
    fiber: 0.0,
    calories: 165.0,
  },
  {
    barcode: 'common_oats',
    name: 'Oats (Raw)',
    protein: 16.9,
    carbs: 66.0,
    fat: 6.9,
    fiber: 10.6,
    calories: 389.0,
  },
  {
    barcode: 'common_whey',
    name: 'Whey Protein',
    protein: 80.0,
    carbs: 6.0,
    fat: 5.0,
    fiber: 0.0,
    calories: 390.0,
  },
  {
    barcode: 'common_banana',
    name: 'Banana',
    protein: 1.1,
    carbs: 23.0,
    fat: 0.3,
    fiber: 2.6,
    calories: 89.0,
  },
  {
    barcode: 'common_apple',
    name: 'Apple',
    protein: 0.3,
    carbs: 14.0,
    fat: 0.2,
    fiber: 2.4,
    calories: 52.0,
  },
  {
    barcode: 'common_milk',
    name: 'Whole Milk',
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    fiber: 0.0,
    calories: 61.0,
  },
  {
    barcode: 'common_paneer',
    name: 'Paneer (Cottage Cheese)',
    protein: 18.0,
    carbs: 1.2,
    fat: 20.0,
    fiber: 0.0,
    calories: 265.0,
  },
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
