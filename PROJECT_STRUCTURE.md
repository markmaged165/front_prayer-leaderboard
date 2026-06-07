# Project Structure - Best Practices

## 📁 Backend Structure (`server/`)

```
server/
├── src/
│   ├── app.js                 # Express app setup with routes & middleware
│   ├── config/
│   │   └── database.js        # MongoDB connection configuration
│   ├── controllers/           # Business logic for handling requests
│   │   ├── playerController.js
│   │   └── seasonController.js
│   ├── services/              # Database operations & external services
│   │   ├── playerService.js
│   │   └── seasonService.js
│   ├── routes/                # API route definitions
│   │   ├── players.js
│   │   └── seasons.js
│   └── middleware/            # Express middleware (auth, error handling, etc)
├── index.js                   # Entry point
├── db.js                       # Old config (can be removed)
└── package.json
```

### Architecture Layers:
1. **Routes** - Define HTTP endpoints
2. **Controllers** - Handle HTTP requests/responses
3. **Services** - Contain business logic & database operations
4. **Config** - Configuration files (database, env, etc)

**Benefits:**
- ✅ Separation of concerns
- ✅ Easy to test each layer independently
- ✅ Scalable and maintainable
- ✅ Reusable services

---

## 📁 Frontend Structure (`src/`)

```
src/
├── components/                # Reusable React components
│   ├── common/               # Shared components (Header, etc)
│   ├── leaderboard/          # Feature-specific components
│   ├── admin/                # Admin panel components
│   └── ui/                   # UI primitives & helpers
├── pages/                    # Full page components
├── services/                 # API calls & external services
│   └── api.js               # Centralized API client
├── hooks/                    # Custom React hooks
├── contexts/                 # React Context for state management
├── constants/                # App constants & configurations
│   └── app.js
├── utils/                    # Helper functions
│   ├── storage.js           # Local/remote storage functions
│   ├── helpers.js           # Utility functions
│ └── ...
├── styles/                   # Global styles
├── data/                     # Initial data & fixtures
├── App.js                    # Main app component
└── index.js                  # Entry point
```

### Best Practices Applied:
- ✅ Organized by feature/function
- ✅ Centralized API client (`services/api.js`)
- ✅ Reusable constants
- ✅ Custom hooks for common logic
- ✅ Separation of concerns

---

## 🔄 Data Flow

### Frontend to Backend Flow:
```
React Component
    ↓
useStorageHook (custom hook)
    ↓
storage.js (fbGet/fbSet)
    ↓
services/api.js (playerAPI, seasonAPI)
    ↓
Express Router (/api/players, /api/seasons)
    ↓
Controller (handles request/response)
    ↓
Service (business logic)
    ↓
MongoDB (data persistence)
```

---

## 🚀 Running the Application

### Backend:
```bash
npm run serve  # Starts Express server on port 4000
```

### Frontend:
```bash
npm start      # Starts React dev server on port 3000/4002
```

### Database:
```bash
npm run seed-mongo  # Seeds initial data to MongoDB
```

---

## 📝 Adding New Features

### To add a new resource (e.g., `rounds`):

1. **Create Service** (`server/src/services/roundService.js`):
   - Database operations (CRUD)

2. **Create Controller** (`server/src/controllers/roundController.js`):
   - Request/response handling

3. **Create Routes** (`server/src/routes/rounds.js`):
   - Define endpoints

4. **Update App** (`server/src/app.js`):
   - Register routes: `app.use("/api/rounds", roundRoutes);`

5. **Create API Client** in `src/services/api.js`:
   - Add `roundAPI` with fetch methods

6. **Use in Components**:
   - Import and use `roundAPI.getAll()`, etc.

---

## 🔧 Environment Variables

Create a `.env` file in the root:
```
MONGODB_URI=mongodb://127.0.0.1:27017/prayer_leaderboard
MONGODB_DBNAME=prayer_leaderboard
PORT=4000
```

---

## ✅ Benefits of This Structure

1. **Scalability** - Easy to add new features
2. **Maintainability** - Clear separation of concerns
3. **Testability** - Each layer can be tested independently
4. **Reusability** - Services & components can be reused
5. **Performance** - Optimized data flow
6. **Security** - Centralized API handling
7. **Developer Experience** - Intuitive folder structure
