-- ============================================================================
-- FitCamp — Supabase Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- -------------------------------------------------------
-- 1. Profiles (linked to auth.users)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  height      NUMERIC,          -- cm
  weight      NUMERIC,          -- kg
  age         INTEGER,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- -------------------------------------------------------
-- 2. Foods (cached from Open Food Facts)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS foods (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode  TEXT UNIQUE,
  name     TEXT NOT NULL,
  protein  NUMERIC DEFAULT 0,  -- per 100 g
  carbs    NUMERIC DEFAULT 0,
  fat      NUMERIC DEFAULT 0,
  fiber    NUMERIC DEFAULT 0,
  calories NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- Foods are public read (anyone can look up nutrition)
CREATE POLICY "Anyone can read foods"
  ON foods FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert foods"
  ON foods FOR INSERT
  WITH CHECK (true);

-- -------------------------------------------------------
-- 3. Meals
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS meals (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meals"
  ON meals FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert meals"
  ON meals FOR INSERT
  WITH CHECK (true);

-- -------------------------------------------------------
-- 4. Meal Items
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS meal_items (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id  UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_id  UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  grams    NUMERIC NOT NULL DEFAULT 100
);

ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal items"
  ON meal_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert meal items"
  ON meal_items FOR INSERT
  WITH CHECK (true);

-- -------------------------------------------------------
-- 5. Exercises (global catalogue)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  muscle_group  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exercises"
  ON exercises FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert exercises"
  ON exercises FOR INSERT
  WITH CHECK (true);

-- -------------------------------------------------------
-- 6. Workouts
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS workouts (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  date      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workouts"
  ON workouts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert workouts"
  ON workouts FOR INSERT
  WITH CHECK (true);

-- -------------------------------------------------------
-- 7. Sets (exercise logs within a workout)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS sets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id   UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id  UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  reps         INTEGER NOT NULL,
  weight       NUMERIC NOT NULL,  -- kg
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sets"
  ON sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workouts WHERE workouts.id = sets.workout_id AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert sets"
  ON sets FOR INSERT
  WITH CHECK (true);
