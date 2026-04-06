# FitCamp — Your Personal Fitness Companion

FitCamp is a comprehensive fitness tracking application that helps users take full control of their health and fitness journey. It combines smart nutrition tracking, structured workout logging, and AI-powered recommendations into a single, unified experience.

---

## What Is FitCamp?

FitCamp is designed for anyone who wants to:

- **Track what they eat** — Scan a barcode, log a meal, and see exactly what macros they've consumed for the day.
- **Track their workouts** — Create workout sessions, pick exercises, and log every set with reps and weight.
- **Get smarter over time** — Receive personalised calorie targets, meal suggestions, and workout plans based on their profile and recent activity.

The goal is to remove the guesswork from fitness. Users shouldn't have to manually calculate calories or wonder what to train next — FitCamp handles that.

---

## Core Features

### 1. User Authentication

Users sign up and log in with email and password. Authentication is powered by **Supabase Auth**, which issues JWT access tokens. All personal data (meals, workouts, profile) is scoped to the authenticated user via row-level security — no user can ever see another user's data.

### 2. User Profile

Each user has a profile containing:

| Field         | Description                                |
|---------------|--------------------------------------------|
| **Height**    | In centimetres — used for BMR calculation  |
| **Weight**    | In kilograms — used for calorie & protein targets |
| **Age**       | Used for BMR estimation                    |
| **Description** | Free-text bio (e.g. "Trying to bulk this year") |

The profile is created automatically on registration and can be updated at any time. These fields directly feed into the AI recommendation engine.

### 3. Food Tracking

FitCamp's food system works in three steps:

1. **Barcode Lookup** — The user scans a food barcode. The backend checks a local cache first; if the product isn't cached, it fetches nutritional data from the **Open Food Facts API** and stores it for future lookups. All macros (protein, carbs, fat, fiber, calories) are stored per 100g.

2. **Meal Logging** — The user creates a meal by selecting one or more food items and specifying the gram amount for each. Meals are tied to a specific date (defaults to today).

3. **Daily Macro Dashboard** — The user can view their total macro consumption for any given day. The backend scales each food item's nutrition by the gram amount consumed:
   ```
   actual = (nutrient_per_100g × grams) / 100
   ```
   The response includes a full breakdown of each item consumed plus grand totals for calories, protein, carbs, fat, and fiber.

### 4. Workout Tracking

The workout system is built around three concepts:

- **Workout** — A named session on a specific date (e.g. "Upper Body Push" on April 6th).
- **Exercise** — A globally shared catalogue of exercises (e.g. "Bench Press", muscle group: "Chest"). Once created, exercises are available to all users.
- **Set** — A single entry of reps × weight logged against a specific exercise within a specific workout.

This allows users to build a detailed history of their training volume over time. A typical flow:

1. Create a workout for today → `"Leg Day"`
2. Create (or reuse) an exercise → `"Squats"`, muscle group `"Legs"`
3. Log sets → `4×8 @ 100 kg`

When retrieving a workout, the user sees every set grouped with exercise details.

### 5. AI-Powered Suggestions

The recommendation engine brings everything together. It considers:

- The user's **profile** (height, weight, age)
- **Today's macro intake** (what they've already eaten)
- **Recent workout history** (last 7 days)

From this, FitCamp calculates:

- **Calorie target** — Using the Mifflin-St Jeor equation for BMR, multiplied by a moderate activity factor (1.55).
- **Protein target** — 2 g per kg of bodyweight.
- **Remaining calories/protein** — How much the user still needs to consume today.
- **Suggested meals** — A curated list of meals with full macro breakdowns to help hit the remaining targets.
- **Workout suggestions** — Recommended sessions based on which muscle groups the user *hasn't* trained recently, promoting balanced programming.

---

## How It All Fits Together

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Register / │     │  Set up your │     │  Start scanning │
│  Log in     │────▶│  Profile     │────▶│  & logging food │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                    ┌──────────────┐                │
                    │  Log your    │◀───────────────┘
                    │  Workouts    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Get Smart   │
                    │  AI Advice   │
                    └──────────────┘
```

1. **Sign up** and fill in your profile (height, weight, age).
2. **Scan barcodes** to look up foods, then log meals throughout the day.
3. **Create workouts**, pick exercises, and log your sets.
4. **Ask for suggestions** — FitCamp analyses your profile, today's food, and recent workouts to tell you what to eat next and what to train.

---

## Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Runtime          | Node.js                             |
| Framework        | Express.js                          |
| Database & Auth  | Supabase (PostgreSQL + Auth + RLS)  |
| Validation       | Zod                                 |
| Food Data        | Open Food Facts API (with DB cache) |
| Security         | Helmet, CORS, JWT-based auth        |
| Dev Tooling      | Nodemon, Morgan (request logging)   |

---

## Database Schema

The app uses **7 tables** with row-level security enabled on all of them:

| Table          | Purpose                                              |
|----------------|------------------------------------------------------|
| `profiles`     | User profile data (height, weight, age, bio)         |
| `foods`        | Cached nutritional data from barcode lookups         |
| `meals`        | A meal logged on a specific date by a user           |
| `meal_items`   | Individual food items within a meal (food + grams)   |
| `exercises`    | Global exercise catalogue (name + muscle group)      |
| `workouts`     | A named workout session on a specific date           |
| `sets`         | Reps × weight logged for an exercise in a workout    |

Key design decisions:
- **Profiles** are linked 1:1 with Supabase `auth.users` via foreign key.
- **Foods** are publicly readable (anyone can look up nutrition) but only insertable by the service role.
- **Meals, workouts, and sets** are fully scoped to the owning user via RLS policies — users can only read and modify their own data.
- **Exercises** are a shared, global catalogue — any user can read them, and new exercises are available to everyone.

---

## Security Model

- All protected endpoints require a valid JWT in the `Authorization: Bearer <token>` header.
- The JWT is verified server-side against Supabase Auth.
- Database-level row-level security (RLS) ensures data isolation even if a bug exists in the application layer.
- Input validation is enforced at the API boundary using Zod schemas before any database interaction.
- Helmet secures HTTP headers and CORS is configured for cross-origin requests.
