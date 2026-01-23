# Quantum Maze - Project Setup Complete! 🎮

## Project Structure

```
Quantum-Maze/
├── backend/
│   ├── node_modules/
│   ├── .env                    # Environment variables (MongoDB URI, JWT secret)
│   ├── .gitignore
│   ├── package.json
│   └── server.js               # Express server with MongoDB connection
│
└── frontend/
    ├── node_modules/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── Auth/           # Authentication components
    │   │   ├── Dashboard/      # Dashboard components
    │   │   ├── Game/           # Game components
    │   │   └── Leaderboard/    # Leaderboard components
    │   ├── dataStructures/     # 8 Required Data Structures
    │   │   ├── arrayMaze.js           # Array: Maze grid representation
    │   │   ├── stackUndoRedo.js       # Stack: Undo/Redo functionality
    │   │   ├── inputQueue.js          # Queue: Input buffering
    │   │   ├── switchSet.js           # Set: Switch/trigger tracking
    │   │   ├── entityMap.js           # Map: Entity management
    │   │   ├── moveHistoryLinkedList.js  # Linked List: Move history
    │   │   ├── levelTree.js           # Tree: Level progression
    │   │   └── mazeGraph.js           # Graph: Maze connectivity
    │   ├── gameEngine/         # Game logic (to be implemented)
    │   ├── App.jsx
    │   └── main.jsx
    ├── .gitignore
    ├── package.json
    └── vite.config.js
```

## Installed Dependencies

### Backend
- ✅ **express** - Web framework
- ✅ **mongoose** - MongoDB ODM
- ✅ **dotenv** - Environment variable management
- ✅ **cors** - Cross-origin resource sharing
- ✅ **jsonwebtoken** - JWT authentication
- ✅ **bcryptjs** - Password hashing

### Frontend
- ✅ **react** - UI library
- ✅ **react-dom** - React DOM rendering
- ✅ **axios** - HTTP client for API calls
- ✅ **react-router-dom** - Client-side routing
- ✅ **styled-components** - CSS-in-JS styling for Cyberpunk theme
- ✅ **vite** - Build tool and dev server

## Environment Variables

### Location: `backend/.env`

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/quantum-maze
# For MongoDB Atlas (cloud), use:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/quantum-maze?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# JWT Expiration
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Important Notes:
1. **MONGO_URI**: Replace with your MongoDB connection string
   - Local MongoDB: `mongodb://localhost:27017/quantum-maze`
   - MongoDB Atlas: Get from your Atlas dashboard
2. **JWT_SECRET**: Generate a secure random string for production
3. **Never commit `.env` to version control!**

## How to Run

### Terminal Commands

#### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Server will run on: `http://localhost:5000`

#### 2. Start Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

### Quick Start Commands
```bash
# Backend
cd C:\Users\sahas\Downloads\Quantum-Maze\backend
npm run dev

# Frontend (new terminal)
cd C:\Users\sahas\Downloads\Quantum-Maze\frontend
npm run dev
```

## Data Structures Overview

All 8 required data structures have placeholder files created:

1. **Array** (`arrayMaze.js`) - 2D grid for maze representation
2. **Stack** (`stackUndoRedo.js`) - Undo/redo move history
3. **Queue** (`inputQueue.js`) - FIFO input buffering
4. **Set** (`switchSet.js`) - Unique switch/trigger tracking
5. **Map** (`entityMap.js`) - Key-value entity storage
6. **Linked List** (`moveHistoryLinkedList.js`) - Complete move history
7. **Tree** (`levelTree.js`) - Level progression hierarchy
8. **Graph** (`mazeGraph.js`) - Maze connectivity and pathfinding

## Next Steps

### Backend Development
1. Create `models/` folder for MongoDB schemas:
   - User model (authentication)
   - Game state model
   - Leaderboard model
2. Create `routes/` folder for API endpoints:
   - `/api/auth` - Registration, login, logout
   - `/api/game` - Game state CRUD operations
   - `/api/leaderboard` - Score tracking
3. Create `middleware/` folder:
   - Authentication middleware
   - Error handling middleware
4. Create `controllers/` folder for business logic

### Frontend Development
1. Implement authentication components (Login, Register)
2. Build game engine logic in `gameEngine/`
3. Implement the 8 data structures with full functionality
4. Create game UI components with Cyberpunk theme
5. Set up React Router for navigation
6. Connect to backend API using axios

### Database Setup
1. Install MongoDB locally OR create MongoDB Atlas account
2. Update `MONGO_URI` in `.env` file
3. Test connection by running the backend server

## API Endpoints (Placeholder)

The server is ready with these endpoints:
- `GET /` - Welcome message
- `GET /api/health` - Health check

To be implemented:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/game/save` - Save game state
- `GET /api/game/load` - Load game state
- `GET /api/leaderboard` - Get leaderboard

## Testing the Setup

1. **Test Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   Visit: `http://localhost:5000` - Should see welcome message

2. **Test Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Visit: `http://localhost:5173` - Should see Vite + React app

## Important Security Notes

⚠️ **Before Production:**
1. Change `JWT_SECRET` to a strong random string
2. Use environment-specific `.env` files
3. Enable HTTPS
4. Add rate limiting
5. Implement input validation
6. Add helmet.js for security headers

## Cyberpunk Theme Resources

For the Cyberpunk aesthetic, consider:
- **Colors**: Neon blues (#00f0ff), purples (#b026ff), pinks (#ff006e)
- **Fonts**: Orbitron, Rajdhani, Share Tech Mono
- **Effects**: Glitch effects, scanlines, glowing borders
- **Background**: Dark (#0a0e27), grid patterns

---

**Status**: ✅ Project foundation is complete and ready for development!
