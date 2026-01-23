/**
 * Dashboard Component - Quantum Maze
 * Main dashboard with navigation to game features
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProgress();
    }, []);

    const fetchUserProgress = async () => {
        try {
            setLoading(true);
            const response = await api.get('/progress');
            setProgress(response.data.data);
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Calculate total score based on performance
     * Scoring system:
     * - 3 stars: 1000 points
     * - 2 stars: 600 points
     * - 1 star: 300 points
     * - 0 stars: 100 points (completion bonus)
     */
    const calculateTotalScore = () => {
        if (!progress || !progress.completedLevels) return 0;

        return progress.completedLevels.reduce((total, level) => {
            let score = 0;

            // Base score from stars
            switch (level.stars) {
                case 3:
                    score = 1000;
                    break;
                case 2:
                    score = 600;
                    break;
                case 1:
                    score = 300;
                    break;
                default:
                    score = 100; // Completion bonus
            }

            return total + score;
        }, 0);
    };

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
        },
        {
            icon: '🧩',
            title: 'My Levels',
            description: 'Create & Manage Levels',
            path: '/my-levels',
            gradient: 'linear-gradient(135deg, #FFD700, #FF8C00)'
        }
    ];

    const totalStars = progress?.totalStars || 0;
    const levelsCompleted = progress?.completedLevels?.length || 0;
    const totalScore = calculateTotalScore();

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
                        <div className="stat-value">
                            {loading ? '...' : totalStars}
                        </div>
                        <div className="stat-label">Total Stars</div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">🎮</div>
                        <div className="stat-value">
                            {loading ? '...' : levelsCompleted}
                        </div>
                        <div className="stat-label">Levels Completed</div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-value">
                            {loading ? '...' : totalScore.toLocaleString()}
                        </div>
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

