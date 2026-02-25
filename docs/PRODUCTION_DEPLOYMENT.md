# ShareAMeal v2.0.0 - Complete Production Deployment Guide

**Last Updated:** February 25, 2026  
**Project Version:** 2.0.0  
**License:** MIT

---

## 📋 Table of Contents

1. [Quick Start Paths](#quick-start-paths)
2. [Choose Your Deployment Stack](#choose-your-deployment-stack)
3. [Path 1: Render + Aiven (Recommended)](#path-1-render--aiven-recommended)
4. [Path 2: Railway (Simplest)](#path-2-railway-simplest)
5. [Path 3: Render + External Database](#path-3-render--external-database)
6. [Environment Configuration](#environment-configuration)
7. [GitHub Actions CI/CD](#github-actions-cicd)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Scaling](#scaling)

---

## Quick Start Paths

Choose based on your preference:

### 🚀 **Render + Aiven (Recommended)**

- **Cost:** $0-27/month
- **Time:** 20 minutes
- **Best for:** Production-grade, free tier
- Go to: [Path 1: Render + Aiven](#path-1-render--aiven-recommended)

### 🎯 **Railway (Simplest)**

- **Cost:** $0/month (free credit covers small apps)
- **Time:** 5 minutes
- **Best for:** Quick deployment, minimal setup
- Go to: [Path 2: Railway](#path-2-railway-simplest)

### 💻 **Render + Custom Database**

- **Cost:** $7-50/month
- **Time:** 30 minutes
- **Best for:** Custom infrastructure
- Go to: [Path 3](#path-3-render--external-database)

---

## Choose Your Deployment Stack

| Aspect               | Render + Aiven  | Railway         | Render + Custom    |
| -------------------- | --------------- | --------------- | ------------------ |
| **Total Cost**       | $0-27/month     | $0/month (free) | $7-50/month        |
| **Setup Time**       | 20 min          | 5 min           | 30 min             |
| **Database**         | Aiven MySQL     | Railway MySQL   | PlanetScale/AWS/DO |
| **Auto-deploy**      | Yes             | Yes             | Yes                |
| **Sleep Mode**       | Yes (free tier) | No              | Yes (free tier)    |
| **Production Ready** | Yes             | Yes             | Yes                |
| **Recommended**      | ✅              | ✅              | For custom needs   |

---

# Path 1: Render + Aiven (Recommended)

**Total deployment time: ~20 minutes**

## Part 1: Set Up Aiven MySQL Database (8 min)

### Step 1: Create Aiven Account

1. Go to **https://aiven.io**
2. Click **Sign Up Free**
3. Use Google/GitHub login or email
4. No credit card required

### Step 2: Create MySQL Service

1. After login, click **+ Create Service**
2. Select **MySQL**
3. Choose plan:
   - **Startup-4** (FREE tier) - 1GB storage
4. Select cloud region:
   - Choose **AWS**
   - Region: **us-east-1** (or closest to you)
5. Service name: `sharemeal-mysql`
6. Click **Create Service** and wait 2-3 minutes

### Step 3: Get Connection Details

Once service is running (green status):

1. Click on your service
2. Go to **Connection information** tab
3. Copy these details (save to notepad):

```
Host:     <your-service>.aivencloud.com
Port:     3306
User:     avnadmin
Password: <long-password>
Database: defaultdb
```

**Note:** Aiven allows all connections by default (0.0.0.0/0). No firewall changes needed.

### Step 4: Initialize Database

Use a MySQL client to run the migration:

```bash
mysql -h <your-aiven-host>.aivencloud.com \
  -u avnadmin \
  -p[PASSWORD] \
  defaultdb < backend/db/migrations/shareAMeal.sql
```

Or rename the database:

```sql
CREATE DATABASE sharemeal;
USE sharemeal;
SOURCE backend/db/migrations/shareAMeal.sql;
```

Verify tables were created:

```bash
mysql -h <your-aiven-host>.aivencloud.com \
  -u avnadmin \
  -p[PASSWORD] \
  sharemeal -e "SHOW TABLES;"
```

---

## Part 2: Deploy Backend to Render (7 min)

### Step 1: Create Render Account

1. Go to **https://render.com**
2. Click **Get Started**
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 2: Create Web Service

1. Click **+ New** → **Web Service**
2. Select your **ShareAMeal** repository
3. Render auto-detects `render.yaml` configuration

### Step 3: Configure Environment Variables

Add these in Render dashboard (Environment tab):

```env
NODE_ENV=production
PORT=3000

# Database (from Aiven)
DB_HOST=<your-aiven-host>.aivencloud.com
DB_PORT=3306
DB_NAME=sharemeal
DB_USER=avnadmin
DB_PASSWORD=<your-aiven-password>

# Secrets (generate random values)
JWT_SECRET=<generate-32-char-random-string>
ADMIN_SECRET=<generate-32-char-random-string>
SERVICE_TOKEN=<generate-32-char-random-string>

# Frontend URL (update after Vercel deployment)
CORS_ORIGIN=https://sharemeal-xxx.vercel.app
```

**Generate secure secrets:**

```bash
# In terminal, run 3 times for 3 secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy

1. Click **Create Web Service**
2. Render will:
   - Clone your repo
   - Install dependencies
   - Build Docker image
   - Start server
3. Wait 2-3 minutes for deployment

**Your Backend URL:** `https://sharemeal-[random].onrender.com`

---

## Part 3: Deploy Frontend to Vercel (5 min)

### Step 1: Create Vercel Account

1. Go to **https://vercel.com**
2. Sign up with GitHub

### Step 2: Import Project

1. Click **Add New** → **Project**
2. Select your **ShareAMeal** repository
3. Configure:
   - **Framework:** Vite
   - **Root Directory:** ./frontend
   - **Build Command:** npm run build
   - **Output Directory:** dist

### Step 3: Set Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://sharemeal-[random].onrender.com
```

(Replace with your actual Render URL from Part 2)

### Step 4: Deploy

Click **Deploy** - Vercel handles everything!

**Your Frontend URL:** `https://sharemeal-[random].vercel.app`

### Step 5: Update Backend CORS

1. Go back to Render dashboard
2. Update `CORS_ORIGIN` environment variable:

```env
CORS_ORIGIN=https://sharemeal-[random].vercel.app
```

3. Render auto-redeploys

---

## Part 4: GitHub Actions Setup (Optional)

### Set Up GitHub Actions Secrets

For automatic CI/CD deployments, add these to GitHub:

1. Go to your repo → Settings → Secrets and Variables → Actions
2. Add these secrets:

```
RENDER_SERVICE_ID=srv-xxxxxxxx (from Render dashboard)
RENDER_DEPLOY_KEY=your_key_here (from Render API settings)
```

GitHub Actions workflow (`.github/workflows/deploy.yml`) is already configured and will:

- Run tests on every push to `main`
- Auto-deploy backend to Render on success
- Vercel auto-deploys when frontend changes

---

# Path 2: Railway (Simplest)

**Total deployment time: ~5 minutes**

## Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **Start for Free**
3. Sign up with GitHub
4. Authorize Railway

## Step 2: Create Project

1. In Railway dashboard, click **New Project**
2. Select **Deploy from GitHub repo**
3. Select your **ShareAMeal** repository
4. Select branch: **main**
5. Click **Deploy**

Railway automatically detects Node.js and deploys!

## Step 3: Add MySQL Database

1. In your project, click **Create Services** or **+ New**
2. Select **MySQL** from templates
3. Click **Deploy**

Railway creates MySQL automatically and sets `DATABASE_URL` environment variable.

## Step 4: Configure Secrets

In Railway project → Variables tab, add:

```env
NODE_ENV=production
JWT_SECRET=<generate-32-char-string>
ADMIN_SECRET=<generate-32-char-string>
SERVICE_TOKEN=<generate-32-char-string>
PORT=3000
```

## Step 5: Set Start Command

In your app service → Settings:

```bash
npm run migrate && npm start
```

This runs migrations automatically on each deploy.

## Step 6: Get Your URL

1. Click your app service
2. Find **Public URL** (example: `https://sharemeal-api-prod.up.railway.app`)

## Step 7: Deploy Frontend to Vercel

Follow the Vercel steps from Path 1, using your Railway URL:

```env
VITE_API_URL=https://sharemeal-api-prod.up.railway.app
```

---

# Path 3: Render + External Database

## Supported Databases

Choose one:

### PlanetScale (Recommended - Free)

1. Go to https://planetscale.com
2. Create free account
3. Create database: `sharemeal`
4. Get connection details
5. Connect Render using connection string

### AWS RDS

1. Go to AWS Console → RDS
2. Create MySQL 8.0 instance (free tier eligible)
3. Get endpoint and credentials
4. Add security group rule for port 3306

### DigitalOcean Managed Database

1. Go to DigitalOcean Console
2. Create MySQL cluster
3. Get connection details

### Any MySQL 8.0+ Server

- Self-hosted
- Cloud provider
- Managed service

## Deploy Steps

1. Create external MySQL database
2. Run migration: `mysql -h HOST -u USER -p < backend/db/migrations/shareAMeal.sql`
3. Deploy to Render with connection details
4. Deploy frontend to Vercel
5. Update CORS_ORIGIN in Render

---

# Environment Configuration

## Backend Environment Variables

### Production (.env.production)

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DB_HOST=your-database-host.com
DB_PORT=3306
DB_NAME=sharemeal
DB_USER=your_username
DB_PASSWORD=your_secure_password

# Authentication (generate securely)
JWT_SECRET=your_32_char_random_string_here
JWT_EXPIRES_IN=24h
ADMIN_SECRET=your_16_char_random_string_here
SERVICE_TOKEN=another_32_char_random_string

# CORS
CORS_ORIGIN=https://yourdomain.vercel.app

# Logging
LOG_LEVEL=info
```

### Generate Secure Secrets

```bash
# Run these commands to generate random values:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ADMIN_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SERVICE_TOKEN=' + require('crypto').randomBytes(32).toString('hex'))"
```

## Frontend Environment Variables

### Production (.env.production)

```env
VITE_API_URL=https://sharemeal-api.onrender.com
```

Or in Vercel dashboard → Environment Variables:

```
VITE_API_URL = https://your-backend-url.com
```

---

# GitHub Actions CI/CD

## Automatic Deployment Pipeline

The `.github/workflows/deploy.yml` file is pre-configured to:

1. **Test Backend** - Run Jest tests
2. **Test Frontend** - Run Vitest
3. **Code Quality** - Check for linting issues
4. **Deploy Backend** - Auto-deploy to Render
5. **Deploy Frontend** - Auto-deploy to Vercel

## Configure GitHub Actions Secrets

For auto-deployment to work, add these to GitHub:

Account → Settings → Secrets and variables → Actions

```
RENDER_SERVICE_ID         (from Render dashboard)
RENDER_DEPLOY_KEY         (from Render API settings)
VERCEL_TOKEN              (from Vercel account settings)
VERCEL_ORG_ID             (from Vercel team settings)
VERCEL_PROJECT_ID         (from Vercel project settings)
```

### How to Get These Values

**Render:**

1. Go to your service → Settings → Service ID
2. Get Deploy Key from Render → Account Settings → API Tokens

**Vercel:**

1. Account Settings → Tokens → Create token
2. Team Settings → get ORG_ID
3. Project Settings → get PROJECT_ID

---

# Testing & Verification

## Test Backend Health

```bash
# Replace with your actual URL
curl https://sharemeal-api.onrender.com/

# Expected response:
# {
#   "status": "Server is running",
#   "message": "Welcome to ShareAMeal API v2.0.0"
# }
```

## Test Swagger Documentation

Open in browser:

```
https://sharemeal-api.onrender.com/api-docs
```

You should see the full Swagger UI with all 43 endpoints.

## Test User Registration

```bash
curl -X POST https://sharemeal-api.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Password123!",
    "phoneNumber": "0612345678",
    "role": "sme"
  }'

# Expected response (200 OK):
# {
#   "message": "User registered successfully",
#   "user": {
#     "id": 1,
#     "firstName": "Test",
#     "email": "test@example.com",
#     "role": "sme"
#   }
# }
```

## Test Frontend

1. Open in browser: `https://sharemeal-xxx.vercel.app`
2. Should load without errors
3. Check browser console (F12) - no API errors
4. Try login → should work without CORS errors

## Test Full Flow

1. **Register** new user at frontend
2. **Login** with credentials
3. **Create meal** (if SME role)
4. **View meals** (if NGO role)
5. **Make claim** to meal

If all works, deployment is successful! ✅

---

# Troubleshooting

## Backend Issues

### Backend Won't Start

**Error:** `ECONNREFUSED` or database connection error

**Solution:**

1. Check Render logs: Logs tab
2. Verify all environment variables are set
3. Check database is running and accessible
4. Verify database schema was initialized with migration

```bash
# Test database connection locally
mysql -h [HOST] -u [USER] -p[PASSWORD] [DATABASE]
```

### Port Already in Use

**Error:** `listen EADDRINUSE :::3000`

**Solution:**

- Render automatically assigns available port
- Ensure app uses `process.env.PORT`
- (Already configured in app.js)

### Migration Fails During Deploy

**Error:** `npm ERR! code ELIFECYCLE` during migration

**Solution:**

1. Manually run migration in Render Shell
2. Verify database credentials in environment
3. Check database character encoding (utf8mb4)

## Frontend Issues

### Frontend Shows "Cannot Reach API"

**Error:** CORS error or API unreachable

**Solution:**

1. Check `VITE_API_URL` is correct in Vercel environment
2. Verify backend URL is live: `curl your-backend-url.com`
3. Check CORS origin in backend environment variable
4. Hard refresh browser (Ctrl+Shift+R)

### Blank Page on Load

**Error:** 404 or white screen

**Solution:**

1. Check Vercel build logs
2. Verify root directory is `./frontend`
3. Check build command: `npm run build`
4. Verify output directory: `dist`

## Database Issues

### Connection Refused

**Error:** `ECONNREFUSED` or `Connection timed out`

**Solution:**

1. Verify database is running
2. Check hostname (include `.aivencloud.com` for Aiven)
3. Verify username and password
4. Check firewall rules (Aiven should allow all IPs)

**For Aiven:**

1. Go to service → Settings
2. Check Network section
3. Ensure IP whitelist includes 0.0.0.0/0 (or Render IP)

### Tables Not Found

**Error:** `Table 'sharemeal.users' doesn't exist`

**Solution:**

1. Run migration again: `npm run migrate`
2. Verify migration completed successfully
3. Check database name matches in connection string

## Render-Specific

### 503 Service Unavailable

**Cause:** App is sleeping (free tier) or not responding

**Solution:**

- Free tier sleeps after 15 min inactivity
- First request takes 30-60s to wake up
- Subsequent requests are instant
- For instant response, upgrade to paid plan

### 502 Bad Gateway

**Cause:** App crashed or failed to start

**Solution:**

1. Check Render logs for crash reason
2. Verify all environment variables
3. Restart service: Render dashboard → Service → Restart

## Vercel-Specific

### Build Failed

**Cause:** Dependencies not installed or build error

**Solution:**

1. Check Vercel build logs
2. Run build locally: `cd frontend && npm run build`
3. Fix any TypeScript or build errors
4. Redeploy

---

# Monitoring & Maintenance

## Check Logs Daily

### Render Logs

1. Render dashboard → Your service → Logs
2. Look for errors and warnings

### Vercel Logs

1. Vercel dashboard → Project → Deployments
2. Click recent deployment → View logs
3. Check for build or runtime errors

## Monitor Performance

### Render Metrics

- Dashboard → Service → Metrics tab
- View CPU, memory, network usage

### Aiven Monitoring

- Aiven dashboard → Service → Monitoring
- Monitor storage, connections, query performance

### Vercel Analytics

- Vercel dashboard → Analytics tab
- View page load times, Web Vitals

## Set Up Error Tracking (Optional)

### Sentry (Recommended)

```bash
# Install in backend
cd backend
npm install @sentry/node

# Add to app.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
app.use(Sentry.Handlers.errorHandler());
```

1. Create Sentry account at https://sentry.io
2. Create Node.js project
3. Get DSN and add to environment variables

### Uptime Monitoring

Use UptimeRobot (free):

1. Go to https://uptimerobot.com
2. Create account
3. Add monitor for your API URL
4. Set to check every 5 minutes
5. Get alerts if API goes down

## Database Backups

### Aiven Automatic Backups

1. Aiven automatically backs up daily
2. Retention: 2-7 days depending on plan
3. No action needed

### Manual Backup

```bash
mysqldump -h [HOST] -u [USER] -p[PASSWORD] [DATABASE] > backup.sql
```

---

# Scaling

## When to Scale

Scale when you hit limits:

- **Users:** > 100 concurrent
- **Database:** > 800MB stored
- **Response Time:** > 2 seconds

## Scaling Options

### Option 1: Upgrade Render

1. Render dashboard → Service → Settings
2. Change plan to **Pro** ($12/month) or higher
3. Increases RAM and CPU
4. Removes sleep mode

### Option 2: Upgrade Aiven

1. Aiven dashboard → Service → Upgrade
2. Choose higher tier plan
3. Increases storage, CPU, connections

### Option 3: Add Redis Cache

For frequently accessed data:

```bash
# Install Redis on Aiven or add Redis service
npm install redis
```

Add to Render environment:

```env
REDIS_URL=redis://host:port
```

### Option 4: Database Read Replicas

For heavy read loads:

1. Aiven → Service → Replication
2. Create read replica
3. Point reads to replica, writes to primary

### Option 5: Add CDN

Vercel includes built-in CDN for frontend. No additional setup needed!

## Cost Estimation After Scaling

| Component           | Free   | Scaled          |
| ------------------- | ------ | --------------- |
| **Render Backend**  | $0     | $7-50/mo        |
| **Aiven MySQL**     | $0     | $19-99/mo       |
| **Vercel Frontend** | $0     | $0-20/mo        |
| **Redis Cache**     | N/A    | $10-50/mo       |
| **Total**           | **$0** | **$36-219+/mo** |

Scale as needed based on actual usage!

---

## Production Checklist

### Database Setup

- [ ] Created MySQL database (Aiven/Railway/Custom)
- [ ] Ran migration script
- [ ] Verified tables exist
- [ ] Tested database connection

### Backend Deployment

- [ ] Created account (Render/Railway/Other)
- [ ] Connected GitHub repository
- [ ] Set all environment variables
- [ ] Backend deployed and running
- [ ] Health check passes: curl backend-url/
- [ ] Swagger docs load: backend-url/api-docs

### Frontend Deployment

- [ ] Created Vercel account
- [ ] Connected GitHub repository
- [ ] Set VITE_API_URL environment variable
- [ ] Frontend deployed
- [ ] Frontend loads without errors
- [ ] API calls work from frontend

### Testing

- [ ] API health test passed
- [ ] Swagger UI loads
- [ ] User registration works
- [ ] Login flow works
- [ ] Meal creation works (SME)
- [ ] Meal claiming works (NGO)
- [ ] Frontend connects to API
- [ ] No CORS errors in console

### CI/CD Setup (Optional)

- [ ] GitHub Actions configured
- [ ] Secrets added to GitHub
- [ ] CI/CD pipeline working
- [ ] Auto-deploy on push enabled

### Monitoring & Security

- [ ] Error tracking enabled (Sentry)
- [ ] Uptime monitoring enabled (UptimeRobot)
- [ ] Database backups verified
- [ ] HTTPS enabled (automatic)
- [ ] Strong secrets generated
- [ ] Env variables secured

### Documentation

- [ ] API documentation accessible
- [ ] Team members trained
- [ ] Runbook created for incidents
- [ ] Backup/restore process documented

---

## Support & Resources

### Official Documentation

- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs
- **Aiven:** https://aiven.io/docs
- **Railway:** https://docs.railway.app

### Status Pages

- **Render Status:** https://status.render.com
- **Vercel Status:** https://www.vercel-status.com
- **Aiven Status:** https://aiven.io/status

### Community

- **Render Discord:** https://render.com/community
- **Railway Discord:** Railway Discord community
- **Aiven Community:** https://aiven.io/community

---

## Summary

You now have a complete, production-ready ShareAMeal deployment with:

✅ Two deployment paths (Render + Aiven or Railway)  
✅ Automatic CI/CD pipeline  
✅ Frontend and backend integrated  
✅ Database initialized and connected  
✅ Error tracking and monitoring  
✅ Comprehensive troubleshooting guide

**Next steps:**

1. Choose your deployment path (we recommend Render + Aiven)
2. Follow the steps in that section
3. Test all endpoints
4. Set up monitoring
5. Share API URL with team

**Questions?** Check the troubleshooting section or refer to official platform documentation.

---

**Generated:** February 25, 2026  
**Project:** ShareAMeal v2.0.0  
**Status:** 🚀 Production Ready
