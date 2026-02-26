# ShareAMeal v2.0.0 - Full Stack App

Trust-first coordination engine for verified food sharing between SMEs, NGOs, sponsors, and admins.

## 📁 Project Structure (Monorepo)

```
shareAMeal/
├── backend/           # Node.js + Express API
│   ├── db/           # Database migrations & seeds
│   ├── src/          # API controllers, routes, middleware
│   ├── tests/        # Jest test suites (123 tests passing)
│   ├── scripts/      # Database migration scripts
│   ├── docs/         # Documentation & guides
│   ├── package.json  # Backend dependencies
│   ├── .env          # Backend environment config
│   └── Dockerfile    # Docker container config
│
├── frontend/          # React + Vite UI
│   ├── src/          # React components, pages, theme
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   ├── .env          # Frontend environment config
│   ├── vite.config.js # Vite build config
│   └── index.html    # HTML entry point
│
├── LICENSE
├── .gitignore
└── README.md         # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 2. Configure Environment

**Backend (.env already exists):**

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR PASSWORD
DB_NAME=sharemeal
JWT_SECRET=<your-secret>
ADMIN_SECRET=<your-secret>
SERVICE_TOKEN=<your-token>
```

**Frontend (.env already exists):**

```
VITE_API_URL=http://localhost:3000
```

### 3. Start Database (Docker)

```bash
cd backend
docker-compose up -d
```

### 4. Start Backend & Frontend

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev    # Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev    # Runs on http://localhost:5173
```

### 5. Access the App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api-docs

## 🧪 Testing

**Backend:**

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Frontend:**

```bash
cd frontend
npm test              # Run tests
```

## 🐳 Docker (Backend Only)

The backend includes Docker setup for local development:

```bash
cd backend

# Start MySQL in Docker
docker-compose up -d

# Stop MySQL
docker-compose down
```

## 📦 Build for Production

**Backend:**

```bash
cd backend
npm run migrate  # Run migrations
npm start        # Start production server
```

**Frontend:**

```bash
cd frontend
npm run build    # Build for production (creates dist/)
npm run preview  # Preview production build
```

## 🔐 Security Notes

- ✅ JWT authentication implemented
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcryptjs
- ✅ Rate limiting configured
- ✅ CORS protection enabled
- ⚠️ Never commit `.env` files with real secrets
- ⚠️ Use environment-specific credentials

## 📊 Tech Stack

**Backend:**

- Node.js 18+
- Express 5.2
- MySQL 8.0+
- JWT authentication
- Jest testing framework

**Frontend:**

- React 19
- Vite build tool
- React Router for navigation
- React Hook Form for forms
- React Icons for icons
- Leaflet for maps
- Vitest for testing

## 📖 Documentation

See `/backend/docs/` for detailed guides:

- `BACKEND_COMPLETION_SUMMARY.md` - What's been completed
- `TEAM_COORDINATION_CHECKLIST.md` - Team tasks
- `RENDER_DEPLOYMENT_GUIDE.md` - Deployment instructions
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Alternative deployment

## 🚀 Deployment

### Option 1: Render (Recommended)

1. Push to GitHub
2. Connect Render to repo
3. Set environment variables
4. Deploy

See `backend/docs/RENDER_DEPLOYMENT_GUIDE.md`

### Option 2: Railway

1. Connect GitHub repo
2. Use `railway.json` configuration
3. Set secrets in Railway dashboard

See `backend/railway.json`

### Option 3: Self-Hosted

Deploy both backend and frontend on your own servers.

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes
3. Test backend: `npm test` (in backend/)
4. Test frontend: `npm test` (in frontend/)
5. Push to GitHub
6. Create Pull Request

## 📝 License

MIT License - See LICENSE file

## 👥 Contributors

- Hope Haruna (@HopeHaruna)
- Dolapo Mosuro (@Dolapo-Mosuro)
- @nakayizakevina

---

**Status:** ✅ Backend: Production Ready (v2.0.0) | 🚀 Frontend: In Development
