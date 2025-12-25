/**
 * Leaderboard Component - Placeholder
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

const Leaderboard = () => {
    const navigate = useNavigate();

    return (
        <div className="placeholder-container">
            <button className="btn btn-secondary back-btn" onClick={() => navigate('/')}>
                ← Back to Dashboard
            </button>

            <div className="placeholder-content glass-card">
                <div className="placeholder-icon">🏆</div>
                <h1 className="placeholder-title">Leaderboard</h1>
                <p className="placeholder-text">
                    View top players and compete for the highest scores!
                </p>
                <p className="placeholder-subtitle">Coming Soon</p>
            </div>
        </div>
    );
};

export default Leaderboard;
