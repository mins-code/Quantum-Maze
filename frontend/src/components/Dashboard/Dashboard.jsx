/**
 * Dashboard Component - Quantum Maze
 * Main dashboard for authenticated users
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header glass-card">
                <div className="header-content">
                    <h1 className="glitch">Quantum Maze</h1>
                    <div className="user-info">
                        <img
                            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt="Avatar"
                            className="user-avatar"
                        />
                        <div className="user-details">
                            <p className="user-name">{user?.name}</p>
                            <p className="user-username">@{user?.username}</p>
                        </div>
                        <button onClick={handleLogout} className="btn btn-secondary logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="welcome-section glass-card neon-border">
                    <h2>Welcome Back, {user?.name}!</h2>
                    <p className="welcome-text">
                        Your quantum journey continues. Ready to navigate the maze?
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card glass-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-value">{user?.totalStars || 0}</div>
                        <div className="stat-label">Total Stars</div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">🎮</div>
                        <div className="stat-value">{user?.levelsCompleted || 0}</div>
                        <div className="stat-label">Levels Completed</div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-value">{user?.totalScore || 0}</div>
                        <div className="stat-label">Total Score</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="actions-section">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        <button className="action-card glass-card neon-border">
                            <span className="action-icon">🎯</span>
                            <span className="action-text">Start New Level</span>
                        </button>

                        <button className="action-card glass-card neon-border">
                            <span className="action-icon">📊</span>
                            <span className="action-text">View Leaderboard</span>
                        </button>

                        <button className="action-card glass-card neon-border">
                            <span className="action-icon">👤</span>
                            <span className="action-text">Edit Profile</span>
                        </button>

                        <button className="action-card glass-card neon-border">
                            <span className="action-icon">⚙️</span>
                            <span className="action-text">Settings</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
