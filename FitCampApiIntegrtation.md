# FitCamp API Documentation

**Base URL:** `https://fit-camp-backend.vercel.app/api`

---

## Health Check

### `GET /api/health`

**Auth:** None

**Response:**
```json
{ "success": true, "message": "FitCamp API is running" }
```

---

## Authentication

### `POST /api/auth/register`

**Auth:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

| Field    | Type   | Required | Rules              |
|----------|--------|----------|--------------------|
| email    | string | ✅       | Valid email format  |
| password | string | ✅       | Min 6 characters   |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com" },
    "session": {
      "access_token": "eyJhbG...",
      "refresh_token": "...",
      "expires_in": 3600
    }
  }
}
```

---

### `POST /api/auth/login`

**Auth:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com" },
    "session": {
      "access_token": "eyJhbG...",
      "refresh_token": "...",
      "expires_in": 3600
    }
  }
}
```

---

## Profile

> All profile endpoints require `Authorization: Bearer <access_token>`

### `GET /api/profile`

**Auth:** Bearer Token

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "height": 180,
    "weight": 75,
    "age": 25,
    "description": "Fitness enthusiast",
    "created_at": "2026-04-06T06:00:00.000Z"
  }
}
```

---

### `PUT /api/profile`

**Auth:** Bearer Token

**Request Body:**
```json
{
  "height": 180,
  "weight": 75,
  "age": 25,
  "description": "Fitness enthusiast"
}
```

| Field       | Type   | Required | Rules              |
|-------------|--------|----------|--------------------|
| height      | number | ❌       | Positive number    |
| weight      | number | ❌       | Positive number    |
| age         | number | ❌       | Integer, 1-150     |
| description | string | ❌       | Max 500 characters |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "height": 180,
    "weight": 75,
    "age": 25,
    "description": "Fitness enthusiast",
    "created_at": "2026-04-06T06:00:00.000Z"
  }
}
```

---

### `POST /api/profile/setup`

**Auth:** Bearer Token

Specific endpoint to set up profile data (height, weight, age). Typically used when the user first logs in or when their data is empty.

**Request Body:**
```json
{
  "height": 180,
  "weight": 75,
  "age": 25,
  "calorie_goal": 2500,
  "protein_goal": 150,
  "fat_goal": 70
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "height": 180,
    "weight": 75,
    "age": 25,
    "calorie_goal": 2500,
    "protein_goal": 150,
    "fat_goal": 70,
    "description": "Fitness enthusiast",
    "created_at": "2026-04-06T06:00:00.000Z"
  }
}
```

---

## Home Summary

### `GET /api/home`

**Auth:** Bearer Token

Returns personal info, today's macro summary, and today's workout summary. If `height` or `weight` is null in the profile, it returns `"user data not filled"`.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "personal_info": {
      "email": "user@example.com",
      "height": 180,
      "weight": "user data not filled",
      "age": 25,
      "description": "Fitness enthusiast"
    },
    "goals": {
      "calorie_goal": 2500,
      "protein_goal": 150,
      "fat_goal": 70,
      "carbs_goal": 317.5
    },
    "food_summary": {
      "date": "2026-04-06",
      "total_calories": 850.5,
      "total_protein": 45.2,
      "total_carbs": 102.3,
      "total_fat": 28.7,
      "item_count": 2
    },
    "workout_summary": {
      "date": "2026-04-06",
      "workouts": [
        { "id": "uuid", "name": "Leg Day" }
      ],
      "count": 1
    }
  }
}
```

---

## Food Tracker

### `GET /api/food/:barcode`

**Auth:** None (public)

Looks up a food product by barcode. Checks local DB cache first, then fetches from Open Food Facts API and caches the result. All macros are per 100g.

**Example:** `GET /api/food/3017620422003`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "barcode": "3017620422003",
    "name": "Nutella",
    "protein": 6.3,
    "carbs": 57.5,
    "fat": 30.9,
    "fiber": 3.4,
    "calories": 539,
    "created_at": "2026-04-06T06:00:00.000Z"
  }
}
```

---

### `POST /api/food/meal`

**Auth:** Bearer Token

Creates a meal with one or more food items and their gram amounts.

**Request Body:**
```json
{
  "date": "2026-04-06",
  "items": [
    { "food_id": "food-uuid-1", "grams": 200 },
    { "food_id": "food-uuid-2", "grams": 150 }
  ]
}
```

| Field         | Type   | Required | Rules                  |
|---------------|--------|----------|------------------------|
| date          | string | ❌       | YYYY-MM-DD (defaults to today) |
| items         | array  | ✅       | Min 1 item             |
| items[].food_id | string | ✅    | Valid UUID             |
| items[].grams | number | ✅       | Positive number        |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "meal-uuid",
    "user_id": "user-uuid",
    "date": "2026-04-06",
    "created_at": "2026-04-06T06:00:00.000Z",
    "items": [
      { "id": "item-uuid", "meal_id": "meal-uuid", "food_id": "food-uuid-1", "grams": 200 }
    ]
  }
}
```

---

### `GET /api/food/daily/macros?date=YYYY-MM-DD`

**Auth:** Bearer Token

Returns total macros consumed for a given day. Macros are scaled by grams: `(nutrient_per_100g × grams) / 100`.

**Query Parameters:**

| Param | Type   | Required | Rules                          |
|-------|--------|----------|--------------------------------|
| date  | string | ❌       | YYYY-MM-DD (defaults to today) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2026-04-06",
    "total_calories": 850.5,
    "total_protein": 45.2,
    "total_carbs": 102.3,
    "total_fat": 28.7,
    "total_fiber": 8.1,
    "items": [
      {
        "name": "Nutella",
        "grams": 200,
        "calories": 1078,
        "protein": 12.6,
        "carbs": 115,
        "fat": 61.8,
        "fiber": 6.8
      }
    ]
  }
}
```

---

## Workout Tracker

> All workout endpoints require `Authorization: Bearer <access_token>`

### `POST /api/workout`

**Auth:** Bearer Token

**Request Body:**
```json
{
  "name": "Upper Body Push",
  "date": "2026-04-06"
}
```

| Field | Type   | Required | Rules                          |
|-------|--------|----------|--------------------------------|
| name  | string | ✅       | Min 1 character                |
| date  | string | ❌       | YYYY-MM-DD (defaults to today) |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "workout-uuid",
    "user_id": "user-uuid",
    "name": "Upper Body Push",
    "date": "2026-04-06",
    "created_at": "2026-04-06T06:00:00.000Z"
  }
}
```

---

### `POST /api/workout/exercise`

**Auth:** Bearer Token

Creates a globally available exercise. If an exercise with the same name already exists, returns the existing one.

**Request Body:**
```json
{
  "name": "Bench Press",
  "muscle_group": "Chest"
}
```

| Field        | Type   | Required | Rules           |
|--------------|--------|----------|-----------------|
| name         | string | ✅       | Min 1 character |
| muscle_group | string | ❌       |                 |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "exercise-uuid",
    "name": "Bench Press",
    "muscle_group": "Chest",
    "created_at": "2026-04-06T06:00:00.000Z"
  }
}
```

---

### `POST /api/workout/set`

**Auth:** Bearer Token

Logs a set (reps + weight) for an exercise within a workout. Verifies the workout belongs to the authenticated user.

**Request Body:**
```json
{
  "workout_id": "workout-uuid",
  "exercise_id": "exercise-uuid",
  "reps": 10,
  "weight": 80
}
```

| Field       | Type   | Required | Rules             |
|-------------|--------|----------|-------------------|
| workout_id  | string | ✅       | Valid UUID         |
| exercise_id | string | ✅       | Valid UUID         |
| reps        | number | ✅       | Positive integer   |
| weight      | number | ✅       | Non-negative       |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "set-uuid",
    "workout_id": "workout-uuid",
    "exercise_id": "exercise-uuid",
    "reps": 10,
    "weight": 80,
    "created_at": "2026-04-06T06:00:00.000Z"
  }
}
```

---

### `GET /api/workout/:id`

**Auth:** Bearer Token

Returns a workout with all its sets and exercise details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "workout-uuid",
    "user_id": "user-uuid",
    "name": "Upper Body Push",
    "date": "2026-04-06",
    "created_at": "2026-04-06T06:00:00.000Z",
    "sets": [
      {
        "id": "set-uuid",
        "reps": 10,
        "weight": 80,
        "created_at": "2026-04-06T06:01:00.000Z",
        "exercises": {
          "id": "exercise-uuid",
          "name": "Bench Press",
          "muscle_group": "Chest"
        }
      }
    ]
  }
}
```

---

## AI Suggestions

### `POST /api/ai/suggestions`

**Auth:** Bearer Token

Returns diet and workout recommendations based on user profile, today's macros, and recent workout history. Uses Mifflin-St Jeor equation for BMR estimation.

**Request Body:** None (uses authenticated user's data)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "profile_summary": {
      "height": 180,
      "weight": 75,
      "age": 25
    },
    "daily_macros": {
      "date": "2026-04-06",
      "consumed_calories": 850,
      "consumed_protein": 45,
      "consumed_carbs": 102,
      "consumed_fat": 28
    },
    "recent_workouts": [
      { "name": "Upper Body Push", "date": "2026-04-05" }
    ],
    "recommendations": {
      "calorie_target": 2389,
      "protein_target": 150,
      "remaining_calories": 1539,
      "remaining_protein": 105,
      "suggested_meals": [
        { "name": "Grilled Chicken Breast with Brown Rice", "calories": 450, "protein": 42, "carbs": 40, "fat": 10 },
        { "name": "Greek Yogurt with Mixed Berries and Granola", "calories": 320, "protein": 25, "carbs": 38, "fat": 8 },
        { "name": "Salmon with Sweet Potato and Broccoli", "calories": 520, "protein": 38, "carbs": 45, "fat": 18 },
        { "name": "Protein Shake with Banana and Peanut Butter", "calories": 380, "protein": 35, "carbs": 30, "fat": 14 }
      ],
      "workout_suggestions": [
        {
          "name": "Lower Body",
          "exercises": ["Squats 4x8", "Romanian Deadlifts 3x10", "Leg Press 3x12", "Calf Raises 4x15"]
        },
        {
          "name": "Pull Day",
          "exercises": ["Deadlifts 4x6", "Pull-ups 3x8", "Barbell Rows 3x10", "Bicep Curls 3x12"]
        }
      ]
    }
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Validation errors (400):**
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

| Status | Meaning                |
|--------|------------------------|
| 400    | Validation / bad input |
| 401    | Unauthorized / bad token |
| 404    | Resource not found     |
| 502    | External API failure   |
| 500    | Internal server error  |

---

## Authentication Header

For all protected endpoints, include:

```
Authorization: Bearer <access_token>
```

The `access_token` is obtained from the `/api/auth/login` or `/api/auth/register` response at `data.session.access_token`.
