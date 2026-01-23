/**
 * App Component - Quantum Maze
 * Main application with routing configuration
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import LevelSelection from './components/Levels/LevelSelection';
import GameLevel from './components/Game/GameLevel';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Settings from './components/Settings/Settings';
import EditProfile from './components/Profile/EditProfile';
import LevelEditor from './components/LevelEditor/LevelEditor';
import MyLevels from './components/Levels/MyLevels';
import PrivateRoute from './components/Auth/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/levels"
            element={
              <PrivateRoute>
                <LevelSelection />
              </PrivateRoute>
            }
          />

          <Route
            path="/play/:id"
            element={
              <PrivateRoute>
                <GameLevel />
              </PrivateRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-levels"
            element={
              <PrivateRoute>
                <MyLevels />
              </PrivateRoute>
            }
          />

          <Route
            path="/editor"
            element={
              <PrivateRoute>
                <LevelEditor />
              </PrivateRoute>
            }
          />

          <Route
            path="/editor/:id"
            element={
              <PrivateRoute>
                <LevelEditor />
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
