# Quantum Maze - Backend API Documentation

## 🔐 Authentication Endpoints

### Base URL: `/api/auth`

---

### 1. **Signup** (Register New User)
**POST** `/api/auth/signup`

**Access**: Public

**Request Body**:
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "avatar": "https://example.com/avatar.jpg" // Optional
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "totalScore": 0,
    "levelsCompleted": 0,
    "totalStars": 0,
    "createdAt": "2025-12-25T08:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Email already registered / Username already taken / Validation error
- 500: Server error

---

### 2. **Login**
**POST** `/api/auth/login`

**Access**: Public

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "totalScore": 150,
    "levelsCompleted": 5,
    "totalStars": 12,
    "createdAt": "2025-12-25T08:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Missing email or password
- 401: Invalid credentials
- 500: Server error

---

### 3. **Get Profile**
**GET** `/api/auth/profile`

**Access**: Private (Requires JWT token)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "totalScore": 150,
    "levelsCompleted": 5,
    "totalStars": 12,
    "createdAt": "2025-12-25T08:00:00.000Z"
  }
}
```

---

### 4. **Update Profile**
**PUT** `/api/auth/profile`

**Access**: Private

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "John Updated",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

### 5. **Verify Token**
**GET** `/api/auth/verify`

**Access**: Private

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Token is valid",
  "user": { /* user object */ }
}
```

---

## 🎮 Game Endpoints

### Base URL: `/api/game`

---

### 1. **Get All Levels**
**GET** `/api/game/levels`

**Access**: Public

**Success Response** (200):
```json
{
  "success": true,
  "count": 10,
  "levels": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "levelId": 1,
      "name": "Tutorial",
      "difficulty": "Easy",
      "parMoves": 10,
      "description": "Learn the basics",
      "isActive": true,
      "createdAt": "2025-12-25T08:00:00.000Z"
    }
    // ... more levels
  ]
}
```

---

### 2. **Get Specific Level**
**GET** `/api/game/levels/:levelId`

**Access**: Public

**Example**: `/api/game/levels/1`

**Success Response** (200):
```json
{
  "success": true,
  "level": {
    "_id": "507f1f77bcf86cd799439011",
    "levelId": 1,
    "name": "Tutorial",
    "difficulty": "Easy",
    "gridLeft": [[0, 1, 0], [1, 0, 1], [0, 1, 0]],
    "gridRight": [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
    "parMoves": 10,
    "bestTime": null,
    "description": "Learn the basics",
    "unlockRequirement": null,
    "isActive": true,
    "createdAt": "2025-12-25T08:00:00.000Z"
  }
}
```

**Error Responses**:
- 404: Level not found

---

### 3. **Submit Score**
**POST** `/api/game/score`

**Access**: Private

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "levelId": 1,
  "moves": 12,
  "timeTaken": 45.5,
  "undoCount": 2,
  "hintsUsed": 0
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "score": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "levelId": 1,
    "moves": 12,
    "timeTaken": 45.5,
    "stars": 2,
    "undoCount": 2,
    "hintsUsed": 0,
    "completed": true,
    "completedAt": "2025-12-25T08:15:00.000Z"
  },
  "isNewBest": true
}
```

**Star Calculation**:
- 3 stars: moves ≤ parMoves
- 2 stars: moves ≤ parMoves × 1.5
- 1 star: moves ≤ parMoves × 2
- 0 stars: moves > parMoves × 2

---

### 4. **Get User Progress**
**GET** `/api/game/progress`

**Access**: Private

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "success": true,
  "progress": {
    "totalLevelsCompleted": 5,
    "totalStars": 12,
    "scores": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439011",
        "levelId": 1,
        "moves": 12,
        "timeTaken": 45.5,
        "stars": 2,
        "completedAt": "2025-12-25T08:15:00.000Z"
      }
      // ... more scores
    ]
  }
}
```

---

## 🏆 Leaderboard Endpoints

### Base URL: `/api/leaderboard`

---

### 1. **Get Level Leaderboard**
**GET** `/api/leaderboard/:levelId`

**Access**: Public

**Query Parameters**:
- `limit` (optional): Number of results (default: 10)

**Example**: `/api/leaderboard/1?limit=20`

**Success Response** (200):
```json
{
  "success": true,
  "levelId": 1,
  "count": 10,
  "leaderboard": [
    {
      "rank": 1,
      "username": "speedrunner",
      "avatar": "https://example.com/avatar1.jpg",
      "stars": 3,
      "moves": 8,
      "timeTaken": 25.3,
      "completedAt": "2025-12-25T08:00:00.000Z"
    }
    // ... more entries
  ]
}
```

---

### 2. **Get Global Top Players**
**GET** `/api/leaderboard/global/top`

**Access**: Public

**Query Parameters**:
- `limit` (optional): Number of results (default: 10)

**Example**: `/api/leaderboard/global/top?limit=50`

**Success Response** (200):
```json
{
  "success": true,
  "count": 10,
  "topPlayers": [
    {
      "rank": 1,
      "_id": "507f1f77bcf86cd799439011",
      "username": "progamer",
      "avatar": "https://example.com/avatar1.jpg",
      "totalStars": 45,
      "levelsCompleted": 15,
      "avgTime": 42.5
    }
    // ... more players
  ]
}
```

---

## 🔒 Authentication Flow

### How to Use JWT Tokens

1. **Signup or Login** to get a token
2. **Store the token** (localStorage, sessionStorage, or state management)
3. **Include token in headers** for protected routes:

```javascript
// Example with axios
const token = localStorage.getItem('token');

axios.get('http://localhost:5000/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

4. **Handle token expiration** (default: 7 days)
   - Check for 401 errors
   - Redirect to login if token is invalid/expired

---

## 📊 Database Models

### User Schema
```javascript
{
  name: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  avatar: String,
  totalScore: Number,
  levelsCompleted: Number,
  totalStars: Number,
  createdAt: Date
}
```

### Level Schema
```javascript
{
  levelId: Number (unique),
  name: String,
  difficulty: String (Easy/Medium/Hard/Expert),
  gridLeft: [[Number]],
  gridRight: [[Number]],
  parMoves: Number,
  bestTime: Number,
  description: String,
  unlockRequirement: Number,
  isActive: Boolean,
  createdAt: Date
}
```

### Score Schema
```javascript
{
  userId: ObjectId (ref: User),
  levelId: Number,
  moves: Number,
  timeTaken: Number,
  stars: Number (0-3),
  completed: Boolean,
  undoCount: Number,
  hintsUsed: Number,
  completedAt: Date
}
```

---

## 🧪 Testing the API

### Using cURL

**Signup**:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","email":"test@example.com","password":"test123"}'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Get Profile** (replace TOKEN):
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the endpoints
2. Set base URL: `http://localhost:5000`
3. For protected routes:
   - Go to Authorization tab
   - Type: Bearer Token
   - Token: Paste your JWT token

---

## ⚙️ Environment Variables

Required in `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/quantum-maze
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Running the Server

```bash
cd backend
npm run dev
```

Server will be available at: `http://localhost:5000`

---

## 📝 Notes

- All passwords are automatically hashed using bcryptjs
- JWT tokens expire after 7 days (configurable)
- User stats (levelsCompleted, totalStars) are automatically updated when scores are submitted
- Only the best score per user per level is kept
- Leaderboards are sorted by stars (desc), then time (asc), then moves (asc)
