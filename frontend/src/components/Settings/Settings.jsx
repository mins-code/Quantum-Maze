/**
 * Settings Component - Full Featured
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [username, setUsername] = useState(user?.username || '');
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Initialize theme from localStorage
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    const [soundEnabled, setSoundEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [soundVolume, setSoundVolume] = useState(70);
    const [musicVolume, setMusicVolume] = useState(50);
    const [showNotifications, setShowNotifications] = useState(true);

    // Mock achievements data
    const achievements = [
        { id: 1, name: 'First Steps', icon: '🎯', description: 'Complete your first level', earned: true },
        { id: 2, name: 'Speed Demon', icon: '⚡', description: 'Complete a level in under 30 seconds', earned: true },
        { id: 3, name: 'Perfect Score', icon: '⭐', description: 'Get 3 stars on any level', earned: true },
        { id: 4, name: 'Gold Medal', icon: '🥇', description: 'Reach #1 on the leaderboard', earned: false },
        { id: 5, name: 'Silver Medal', icon: '🥈', description: 'Reach top 3 on the leaderboard', earned: false },
        { id: 6, name: 'Bronze Medal', icon: '🥉', description: 'Reach top 10 on the leaderboard', earned: true },
        { id: 7, name: 'Master Mind', icon: '🧠', description: 'Complete all levels with 3 stars', earned: false },
        { id: 8, name: 'Persistent', icon: '💪', description: 'Play 50 levels', earned: true },
    ];

    useEffect(() => {
        // Apply theme and save to localStorage
        const theme = isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [isDarkMode]);

    const handleUsernameUpdate = () => {
        // TODO: API call to update username
        console.log('Updating username to:', username);
        setIsEditingUsername(false);
    };

    const handlePasswordReset = () => {
        setShowPasswordModal(true);
    };

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button className="btn btn-secondary back-btn" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <h1 className="settings-title">Settings</h1>
            </div>

            <div className="settings-content">
                {/* Account Section */}
                <section className="settings-section glass-card">
                    <h2 className="section-title">
                        <span className="section-icon">👤</span>
                        Account
                    </h2>

                    <div className="setting-item">
                        <label className="setting-label">Username</label>
                        <div className="username-control">
                            {isEditingUsername ? (
                                <>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="username-input"
                                        placeholder="Enter new username"
                                    />
                                    <button className="btn btn-primary btn-sm" onClick={handleUsernameUpdate}>
                                        Save
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingUsername(false)}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="username-display">{username}</span>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingUsername(true)}>
                                        Edit
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="setting-item">
                        <label className="setting-label">Password</label>
                        <button className="btn btn-secondary" onClick={handlePasswordReset}>
                            Reset Password
                        </button>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="settings-section glass-card">
                    <h2 className="section-title">
                        <span className="section-icon">🎨</span>
                        Appearance
                    </h2>

                    <div className="setting-item">
                        <div className="setting-row">
                            <div>
                                <label className="setting-label">Theme</label>
                                <p className="setting-description">Switch between dark and light mode</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={isDarkMode}
                                    onChange={handleThemeToggle}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-label">{isDarkMode ? 'Dark' : 'Light'}</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Audio Section */}
                <section className="settings-section glass-card">
                    <h2 className="section-title">
                        <span className="section-icon">🔊</span>
                        Audio
                    </h2>

                    <div className="setting-item">
                        <div className="setting-row">
                            <label className="setting-label">Sound Effects</label>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={soundEnabled}
                                    onChange={() => setSoundEnabled(!soundEnabled)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        {soundEnabled && (
                            <div className="volume-control">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={soundVolume}
                                    onChange={(e) => setSoundVolume(e.target.value)}
                                    className="volume-slider"
                                />
                                <span className="volume-value">{soundVolume}%</span>
                            </div>
                        )}
                    </div>

                    <div className="setting-item">
                        <div className="setting-row">
                            <label className="setting-label">Background Music</label>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={musicEnabled}
                                    onChange={() => setMusicEnabled(!musicEnabled)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        {musicEnabled && (
                            <div className="volume-control">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={musicVolume}
                                    onChange={(e) => setMusicVolume(e.target.value)}
                                    className="volume-slider"
                                />
                                <span className="volume-value">{musicVolume}%</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="settings-section glass-card">
                    <h2 className="section-title">
                        <span className="section-icon">🔔</span>
                        Notifications
                    </h2>

                    <div className="setting-item">
                        <div className="setting-row">
                            <div>
                                <label className="setting-label">Enable Notifications</label>
                                <p className="setting-description">Receive updates about achievements and challenges</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={showNotifications}
                                    onChange={() => setShowNotifications(!showNotifications)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Achievements Section */}
                <section className="settings-section glass-card">
                    <h2 className="section-title">
                        <span className="section-icon">🏆</span>
                        Achievements
                    </h2>

                    <div className="achievements-grid">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                            >
                                <div className="achievement-icon">{achievement.icon}</div>
                                <div className="achievement-info">
                                    <h4 className="achievement-name">{achievement.name}</h4>
                                    <p className="achievement-description">{achievement.description}</p>
                                </div>
                                {achievement.earned && <div className="achievement-badge">✓</div>}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Password Reset Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Reset Password</h3>
                        <form className="password-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" className="form-input" placeholder="Enter current password" />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" className="form-input" placeholder="Enter new password" />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input type="password" className="form-input" placeholder="Confirm new password" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
