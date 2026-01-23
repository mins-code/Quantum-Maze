/**
 * EditProfile Component - Placeholder
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Leaderboard/Leaderboard.css';

const EditProfile = () => {
    const navigate = useNavigate();

    return (
        <div className="placeholder-container">
            <button className="btn btn-secondary back-btn" onClick={() => navigate('/')}>
                ← Back to Dashboard
            </button>

            <div className="placeholder-content glass-card">
                <div className="placeholder-icon">👤</div>
                <h1 className="placeholder-title">Edit Profile</h1>
                <p className="placeholder-text">
                    Update your profile information, avatar, and account settings.
                </p>
                <p className="placeholder-subtitle">Coming Soon</p>
            </div>
        </div>
    );
};

export default EditProfile;
