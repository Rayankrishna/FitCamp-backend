# FitCamp Backend

Production-ready Node.js + Express + Supabase backend for fitness tracking.

## Features

- **Auth** — Register / Login via Supabase Auth
- **Profile** — Height, weight, age, description
- **Food Tracker** — Barcode → Open Food Facts API → DB cache → daily macro totals
- **Workout Tracker** — Workouts, exercises, sets (reps + weight)
- **AI Suggestions** — Calorie/protein targets, meal & workout recommendations

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the template and fill in your Supabase keys:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3000
SUPABASE_URL=https://xcepadmksuqzskivrmqy.supabase.co
SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

### 3. Create database tables

Open the **Supabase SQL Editor** and run the contents of [`supabase_schema.sql`](./supabase_schema.sql).

### 4. Run the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## API Reference

### Health Check
```
GET /api/health
```

### Auth
```
POST /api/auth/register   { email, password }
POST /api/auth/login       { email, password }
```

### Profile *(auth required)*
```
GET  /api/profile
PUT  /api/profile          { height?, weight?, age?, description? }
```

### Food *(auth required for meal/daily)*
```
GET  /api/food/:barcode                  — Look up food by barcode
POST /api/food/meal                      — Create meal { date?, items: [{food_id, grams}] }
GET  /api/food/daily/macros?date=YYYY-MM-DD  — Get daily macro totals
```

### Workouts *(auth required)*
```
POST /api/workout                — Create workout { name, date? }
POST /api/workout/exercise       — Create exercise { name, muscle_group? }
POST /api/workout/set            — Log set { workout_id, exercise_id, reps, weight }
GET  /api/workout/:id            — Get workout with sets
```

### AI Suggestions *(auth required)*
```
POST /api/ai/suggestions         — Get diet + workout recommendations
```

---

## Project Structure

```
src/
├── config/
│   └── supabase.js          # Supabase client setup
├── controllers/
│   ├── aiController.js
│   ├── authController.js
│   ├── foodController.js
│   ├── profileController.js
│   └── workoutController.js
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Global error handler
│   └── validate.js          # Zod validation
├── routes/
│   ├── ai.js
│   ├── auth.js
│   ├── food.js
│   ├── profile.js
│   └── workout.js
├── services/
│   ├── aiService.js
│   ├── authService.js
│   ├── foodService.js
│   ├── profileService.js
│   └── workoutService.js
├── validators/
│   ├── authValidator.js
│   ├── foodValidator.js
│   ├── profileValidator.js
│   └── workoutValidator.js
├── app.js                   # Express app
└── server.js                # Entry point
```
