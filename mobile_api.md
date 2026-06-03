# FitCamp Mobile API & Integration Guide

This document outlines the API changes introduced in the backend upgrades and details how to integrate them into the FitCamp Mobile Application (Flutter/Dart).

---

## 1. Summary of Changes
The backend has been upgraded with three main additions:
1. **User Onboarding on Registration:** Capture physical stats, activity level, and diet goals during sign-up to calculate custom calorie and protein targets dynamically.
2. **Progressive Overload Splits & Templates:** Users can choose or configure a workout split (e.g. Upper/Lower, PPL). When tracking workouts, they start from a template and see their **previous session's set records** to progressive overload.
3. **Live Calendar & Exercise Progress:** Track workouts by month/day for calendar views and chart historical progression for individual exercises.

---

## 2. Updated API Reference

### 🔐 Auth & Profile Setup

#### `POST /api/auth/register` (Onboarding Sign-up)
Can now accept onboarding data directly to calculate accurate goals immediately on signup.
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "height": 180,
    "weight": 80,
    "age": 25,
    "activity_level": "active", // options: sedentary, lightly_active, moderately_active, active, very_active
    "diet_goal": "clean_bulk"    // options: lose_weight, maintain, gain_weight, clean_bulk
  }
  ```

#### `POST /api/profile/setup` & `PUT /api/profile` (Update Profile settings)
Used if a user skips onboarding on register or updates their stats later.
* **Request Body:**
  ```json
  {
    "height": 180,
    "weight": 80,
    "age": 25,
    "activity_level": "active",
    "diet_goal": "clean_bulk"
  }
  ```

---

### 🍎 Food Search API

#### `GET /api/food/search?q=query`
Allows free-text searching of food items and their macros. It searches the local database cache first, then queries the Open Food Facts search API in parallel, returning combined and deduplicated results.
* **Query Parameters:**
  * `q` (string, required) - The search term (e.g. `q=chicken`, `q=milk`).
* **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-or-null",
        "barcode": "common_rice_white",
        "name": "Cooked White Rice",
        "protein": 2.7,
        "carbs": 28.0,
        "fat": 0.3,
        "fiber": 0.4,
        "calories": 130.0
      }
    ]
  }
  ```

---

### 🏋️ Splits, Programs & Template APIs

#### `POST /api/workout/programs` (Create a split program)
* **Request Body:**
  ```json
  {
    "name": "Upper/Lower Split",
    "description": "4-day strength program"
  }
  ```

#### `POST /api/workout/templates` (Create routine template under program)
* **Request Body:**
  ```json
  {
    "program_id": "program-uuid",
    "name": "Upper Day"
  }
  ```

#### `POST /api/workout/templates/:id/exercises` (Add exercise to routine)
* **Request Body:**
  ```json
  {
    "exercise_id": "exercise-uuid",
    "sequence_order": 1
  }
  ```

#### `GET /api/workout/templates/:id` (Fetch template with progressive overload data)
Use this endpoint when a user selects a template to log. It returns the template's exercises, along with the user's **most recent logged sets** for each exercise so you can prepopulate input placeholders.
* **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "id": "template-uuid",
      "name": "Upper Day",
      "exercises": [
        {
          "id": "template-exercise-uuid",
          "sequence_order": 1,
          "exercise": {
            "id": "exercise-uuid",
            "name": "Bench Press",
            "muscle_group": "Chest"
          },
          "previous_performance": {
            "workout_id": "last-workout-uuid",
            "date": "2026-06-01",
            "sets": [
              { "reps": 10, "weight": 80.0 },
              { "reps": 8, "weight": 80.0 }
            ]
          }
        }
      ]
    }
  }
  ```

---

### 📊 Calendar & Progress Tracking

#### `GET /api/workout/calendar?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
Fetch workouts completed within a date range to render on a live calendar.
* **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "workout-uuid",
        "name": "Upper Day Session",
        "date": "2026-06-03",
        "template_id": "template-uuid",
        "template_name": "Upper Day",
        "total_sets": 4
      }
    ]
  }
  ```

#### `GET /api/workout/progress/:exercise_id`
Returns historical sets to chart weight/reps progression over time for an exercise.
* **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "set_id": "set-uuid",
        "workout_id": "workout-uuid",
        "workout_name": "Upper Day Session 1",
        "date": "2026-06-01",
        "reps": 10,
        "weight": 80.0,
        "created_at": "2026-06-01T10:00:00.000Z"
      }
    ]
  }
  ```

---

## 3. Recommended Mobile Screens & Integration Steps

### Screen 1: Welcome Onboarding Flow
If registering a new user, present a clean stepper sequence to collect profile information.
* **UI Controls:**
  * Rulers/Dials for **Height** (cm) and **Weight** (kg).
  * Segmented controls for **Activity Level** (Sedentary, Light, Moderate, Active, Very Active).
  * Target selector for **Diet Goal** (Lose Weight, Maintain, Gain Weight, Clean Bulk).
* **Integration:** Call `POST /api/auth/register` with these variables to ensure the Home Dashboard loads customized calorie and protein goals immediately.

### Screen 2: Program Setup & Split Manager
Allows users to choose or define their training program.
* **UI Controls:**
  * List of user programs (e.g. "My Splits") with an option to create a custom one.
  * Routine builders to add templates (e.g. "Upper Day", "Lower Day") and attach exercises to them.
* **Integration:** Bind program lists to `GET /api/workout/programs` and call `POST /api/workout/templates/:id/exercises` to manage template structures.

### Screen 3: Progressive Overload Workout Logger
The main training screen.
* **UI Controls:**
  * When a user taps "Start Routine" (e.g., "Upper Day"), load exercises.
  * For each exercise set, display a grayed-out placeholder of the previous set (e.g., `Prev: 80 kg x 10 reps`) so they know what target they need to beat.
  * Provide inline text fields to enter the current session's reps and weights.
* **Integration:** 
  1. Fetch `GET /api/workout/templates/:id` to populate exercise lists and previous stats.
  2. Create a workout session via `POST /api/workout` with `{ name, template_id }`.
  3. When the user checks off a set, make a `POST /api/workout/set` request with the current reps/weight.

### Screen 4: Live Activity Calendar
A calendar widget (like `table_calendar` in Flutter) displaying monthly progress.
* **UI Controls:**
  * A monthly calendar grid. Dates on which the user completed a workout should have a colored dot denoting completion.
  * Tapping on a date fetches logged workouts for that day.
* **Integration:** Bind calendar days dynamically using `GET /api/workout/calendar?start_date=...&end_date=...`.

### Screen 5: Analytics & Progression Charts
Help users visualize gains.
* **UI Controls:**
  * Dropdown selector for exercises (e.g., "Bench Press").
  * A line graph (using a charting package like `fl_chart`) plotting maximum weight lifted or total session volume over time.
* **Integration:** Fetch data using `GET /api/workout/progress/:exercise_id` and map the `date` and `weight` fields to the chart X/Y axes.

---

## 4. Flutter/Dart Model Helpers

Use these model classes for type-safe integration:

```dart
// User Onboarding Data Model
class OnboardingData {
  final double height;
  final double weight;
  final int age;
  final String activityLevel;
  final String dietGoal;

  OnboardingData({
    required this.height,
    required this.weight,
    required this.age,
    required this.activityLevel,
    required this.dietGoal,
  });

  Map<String, dynamic> toJson() => {
    'height': height,
    'weight': weight,
    'age': age,
    'activity_level': activityLevel,
    'diet_goal': dietGoal,
  };
}

// Progressive Overload Set Log Model
class SetLog {
  final int reps;
  final double weight;

  SetLog({required this.reps, required this.weight});

  factory SetLog.fromJson(Map<String, dynamic> json) {
    return SetLog(
      reps: json['reps'] as int,
      weight: (json['weight'] as num).toDouble(),
    );
  }
}
```
