# Share-a-Meal Backend

Trust-first coordination engine for verified food sharing between SMEs, NGOs, sponsors, and admins.

## Stack

- Node.js + Express
- MySQL

## Quick Start

1. Install dependencies:

```bash
npm install
```

1. Create and configure `.env` (example):

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sharemeal
JWT_SECRET=your_secret
JWT_EXPIRES_IN=24h
ADMIN_SECRET=your_admin_secret
SERVICE_TOKEN=your_service_token
```

1. Create the database and tables:

- Use [db/shareMeal.sql](db/shareMeal.sql)

1. Run the server:

```bash
npm run dev
```

## API Overview

- Auth: `/auth/register`, `/auth/login`
- Admin: `/admin/users`, `/admin/users/pending`, `/admin/verify/:userId`, `/admin/revoke/:userId`
- Meals: `/meals`, `/meals/:mealId`, `/meals/status/:status`, `/meals/my/list`
- Claims: `/claims/meal/:mealId`, `/claims/my`, `/claims/:claimId/cancel`, `/claims/meal/:mealId/ready`, `/claims/:claimId/pickup`, `/claims/:claimId/complete`
- AI: `/ai/meals`, `/ai/meal/:mealId`, `/ai/meal/:mealId/expiry`, `/ai/meal/:mealId/food-status`
- Metrics: `/metrics`, `/metrics/smes`, `/metrics/ngos`, `/metrics/status`, `/metrics/timeline`, `/metrics/completion-time`

## Manual Test Cases

Use a REST client (Postman/Insomnia) or curl. Replace `:PORT` with your server port (default 3000).

### 1) Auth

- Register admin
  - `POST http://localhost:3000/admin/auth/register`
  - Body:

    ```json
    {
    	"name": "Admin User",
    	"email": "admin@test.com",
    	"password": "Admin123!",
    	"admin_secret": "your_admin_secret"
    }
    ```

- Login
  - `POST http://localhost:3000/admin/auth/login`
  - Body:

    ```json
    { "email": "admin@test.com", "password": "Admin123!" }
    ```

### 2) Admin Verification

- Get pending users
  - `GET http://localhost:3000/admin/users/pending`
  - Header: `Authorization: Bearer <ADMIN_JWT>`
- Verify user
  - `PATCH http://localhost:3000/admin/verify/:userId`
  - Header: `Authorization: Bearer <ADMIN_JWT>`

### 3) Meals (SME)

- Create meal
  - `POST http://localhost:3000/meals`
  - Header: `Authorization: Bearer <SME_JWT>`
  - Body:

    ```json
    {
    	"title": "Fresh Bread Loaves",
    	"description": "Whole wheat bread baked this morning",
    	"quantity": 20,
    	"unit": "loaves",
    	"storage_type": "Room Temperature",
    	"food_type": "Bread",
    	"food_status": "Fresh",
    	"prepared_at": "2026-02-20 08:00:00"
    }
    ```

- Get all meals
  - `GET http://localhost:3000/meals`
- Get meal by ID
  - `GET http://localhost:3000/meals/:mealId`

### 4) Claims (NGO)

- Claim meal
  - `POST http://localhost:3000/claims/meal/:mealId`
  - Header: `Authorization: Bearer <NGO_JWT>`
- Mark pickup ready (SME)
  - `PATCH http://localhost:3000/claims/meal/:mealId/ready`
  - Header: `Authorization: Bearer <SME_JWT>`
- Confirm pickup (NGO)
  - `PATCH http://localhost:3000/claims/:claimId/pickup`
  - Header: `Authorization: Bearer <NGO_JWT>`
- Confirm completion (NGO)
  - `PATCH http://localhost:3000/claims/:claimId/complete`
  - Header: `Authorization: Bearer <NGO_JWT>`

### 5) AI (Service Token)

- Get meals for processing
  - `GET http://localhost:3000/ai/meals`
  - Header: `Authorization: Bearer <SERVICE_TOKEN>`
- Set expiry
  - `POST http://localhost:3000/ai/meal/:mealId/expiry`
  - Header: `Authorization: Bearer <SERVICE_TOKEN>`
  - Body: `{ "expiry_at": "2026-02-21 08:00:00" }`
- Update food status
  - `PATCH http://localhost:3000/ai/meal/:mealId/food-status`
  - Header: `Authorization: Bearer <SERVICE_TOKEN>`
  - Body: `{ "food_status": "Moderate" }`

### 6) Metrics

- Overall metrics
  - `GET http://localhost:3000/metrics`
- Status breakdown
  - `GET http://localhost:3000/metrics/status`
- Timeline
  - `GET http://localhost:3000/metrics/timeline`
- Completion time
  - `GET http://localhost:3000/metrics/completion-time`

## Background Guards

- Auto-expire meals when `expiry_at` has passed
- Auto-cancel claims after 30 minutes without pickup
- Auto-cancel meals stuck in `PICKUP_READY` for over 2 hours

Guards run on startup and every 5 minutes from [src/jobs/mealGuards.js](src/jobs/mealGuards.js).
