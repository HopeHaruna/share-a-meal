# ShareAMeal v2.0.0 — Render + Aiven Production Guide

**Last Updated:** February 25, 2026  
**Project Version:** 2.0.0  
**License:** MIT

---

## Overview

This document describes a single production path: deploy the backend and frontend on Render, using Aiven for MySQL. Render can host static frontends (recommended) or run the frontend as a web service.

Estimated time: ~20 minutes

---

## 1. Aiven MySQL (8 min)

1. Sign up at https://aiven.io and create a **MySQL** service (Startup-4 or equivalent).
2. Choose region (e.g., us-east-1) and name the service `sharemeal-mysql`.
3. When service is ready, copy connection info:

```
Host: <your-service>.aivencloud.com
Port: 3306
User: avnadmin
Password: <your-password>
Database: defaultdb
```

4. Initialize schema (either rename/create DB then run migrations):

```bash
# Option 1: import to defaultdb
mysql -h <HOST> -u avnadmin -p<PASSWORD> defaultdb < backend/db/migrations/shareAMeal.sql

# Option 2: create sharemeal and import
mysql -h <HOST> -u avnadmin -p<PASSWORD> -e "CREATE DATABASE sharemeal;"
mysql -h <HOST> -u avnadmin -p<PASSWORD> sharemeal < backend/db/migrations/shareAMeal.sql
```

---

## 2. Backend: Deploy to Render (7 min)

1. Sign in at https://render.com and connect your GitHub repository.
2. Create a new **Web Service** for the backend:
   - Repository: `shareAMeal`
   - Branch: `main`
   - Build command: `cd backend && npm ci`
   - Start command: `cd backend && npm start`
3. Add environment variables in Render (Environment tab):

```env
NODE_ENV=production
PORT=3000

# Aiven database
DB_HOST=<your-aiven-host>.aivencloud.com
DB_PORT=3306
DB_NAME=sharemeal
DB_USER=avnadmin
DB_PASSWORD=<your-aiven-password>

# Secrets
JWT_SECRET=<32+ char random>
ADMIN_SECRET=<32+ char random>
SERVICE_TOKEN=<32+ char random>

# Will update after frontend deploy
CORS_ORIGIN=https://sharemeal.onrender.com
```

4. Create the service — Render will build and deploy. Note the backend URL (e.g., `https://sharemeal-api.onrender.com`).

---

## 3. Frontend: Host on Render (recommended)

Render can host the frontend as a static site (fast and simple). Steps:

### Option A — Static Site (recommended)

1. Build locally or let Render build:

```bash
cd frontend
npm ci
npm run build
```

2. In Render: **+ New** → **Static Site**
   - Connect repo `shareAMeal`
   - Root directory: `frontend`
   - Build command: `npm ci && npm run build`
   - Publish directory: `frontend/dist`
3. Set environment variable on the static site (Settings → Environment):

```env
VITE_API_URL=https://<your-backend-url>
```

4. Deploy — Render gives a frontend URL (e.g., `https://sharemeal.onrender.com`).

### Option B — Serve `dist` via Web Service

If you need server-side logic or prefer it, create a light web service in `frontend/` to serve `dist` and deploy as a Render Web Service. (Not required for this project.)

---

## 4. Update Backend CORS

After frontend URL is live, update `CORS_ORIGIN` in the backend Render service to the frontend URL and redeploy if needed.

---

## 5. GitHub Actions (optional, CI/CD)

Add these secrets in GitHub repository → Settings → Secrets and variables → Actions:

```
RENDER_SERVICE_ID   (from Render service settings)
RENDER_DEPLOY_KEY   (Render deploy key or API key)
```

Your existing `.github/workflows/deploy.yml` can be used to run tests and trigger deployments.

---

## 6. Testing & Verification

1. Backend health

```bash
curl https://<your-backend-url>/api/health
```

2. Swagger: `https://<your-backend-url>/api-docs`
3. Frontend: open the Render frontend URL and exercise register/login/create-claim flows.

---

## 7. Troubleshooting (quick)

- If backend cannot connect to DB: verify Aiven host/credentials and that `DB_NAME` exists.
- If frontend shows CORS: confirm `CORS_ORIGIN` matches exact frontend origin.
- If Render build fails: check build logs and run `cd frontend && npm run build` locally.

---

## 8. Monitoring & Maintenance

- Enable Render logs and daily monitoring.
- Enable Aiven automated backups.
- Optional: add Sentry for error tracking and UptimeRobot for uptime checks.

---

## 9. Production Checklist

- [ ] Aiven MySQL created and migrations run
- [ ] Backend deployed on Render and health OK
- [ ] Frontend deployed on Render and loads
- [ ] `CORS_ORIGIN` updated
- [ ] Secrets stored in Render and GitHub (if using CI)
- [ ] Monitoring/logging enabled

---

If you want, I can now:

1. Commit and push this updated file (I will).
2. Walk through Aiven creation with you step-by-step.
3. After you provide Aiven connection details, initialize the DB and start Render deployments.

Which should I do next?
