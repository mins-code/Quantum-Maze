/**
 * Dashboard Component - Quantum Maze
 * Main dashboard with navigation to game features
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

    const navigationItems = [
        {
            icon: '🎮',
            title: 'Levels',
            description: 'Play puzzle levels',
            path: '/levels',
            gradient: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))'
        },
        {
            icon: '🏆',
            title: 'Leaderboard',
            description: 'View top players',
            path: '/leaderboard',
            gradient: 'linear-gradient(135deg, var(--warning), #ff6b35)'
        },
        {
            icon: '👤',
            title: 'Edit Profile',
            description: 'Manage your account',
            path: '/profile',
            gradient: 'linear-gradient(135deg, var(--neon-purple), #ff0055)'
        },
        {
            icon: '⚙️',
            title: 'Settings',
            description: 'Game preferences',
            path: '/settings',
            gradient: 'linear-gradient(135deg, #00d4ff, var(--success))'
        }
    ];

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

                {/* Navigation Cards */}
                <div className="navigation-section">
                    <h3 className="section-title">What would you like to do?</h3>
                    <div className="navigation-grid">
                        {navigationItems.map((item, index) => (
                            <div
                                key={index}
                                className="nav-card glass-card"
                                onClick={() => navigate(item.path)}
                                style={{ '--card-gradient': item.gradient }}
                            >
                                <div className="nav-card-glow" style={{ background: item.gradient }}></div>
                                <div className="nav-icon">{item.icon}</div>
                                <h4 className="nav-title">{item.title}</h4>
                                <p className="nav-description">{item.description}</p>
                                <div className="nav-arrow">→</div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
