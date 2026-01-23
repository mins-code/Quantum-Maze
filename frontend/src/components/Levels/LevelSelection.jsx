/**
 * LevelSelection Component - With User Progress
 * Displays all available levels with unlock status
 * Level 1 is ALWAYS unlocked
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './LevelSelection.css';

const LevelSelection = () => {
    const navigate = useNavigate();
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLevelsWithProgress();
    }, []);

    /**
     * Fetch levels with user's progress merged
     * Uses /api/progress/levels endpoint which:
     * - Returns all levels
     * - Merges user's completion status
     * - Ensures Level 1 is ALWAYS unlocked
     */
    const fetchLevelsWithProgress = async () => {
        try {
            setLoading(true);
            // Use progress endpoint to get levels with user's progress
            const response = await api.get('/progress/levels');
            setLevels(response.data.data);
            setError('');
        } catch (err) {
            console.error('Error fetching levels:', err);
            setError('Failed to load levels');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayLevel = (level) => {
        // Level 1 is ALWAYS playable
        // Other levels check isUnlocked status
        if (level.levelId === 1 || level.isUnlocked) {
            navigate(`/play/${level.levelId}`);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy':
                return 'var(--success)';
            case 'Medium':
                return 'var(--warning)';
            case 'Hard':
                return 'var(--error)';
            default:
                return 'var(--neon-cyan)';
        }
    };

    if (loading) {
        return (
            <div className="level-selection-container">
                <div className="levels-loading">
                    <div className="spinner"></div>
                    <p>Loading levels...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="level-selection-container">
                <div className="error-message">{error}</div>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="level-selection-container">
            {/* Header */}
            <div className="levels-header">
                <button className="btn btn-secondary back-btn" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <h1 className="levels-title">Select a Level</h1>
            </div>

            {/* Levels Grid */}
            <div className="levels-grid">
                {levels.map((level) => {
                    // Level 1 is ALWAYS unlocked (bootstrap level)
                    const isUnlocked = level.levelId === 1 || level.isUnlocked;

                    return (
                        <div
                            key={level.levelId}
                            className={`level-card glass-card ${!isUnlocked ? 'locked' : ''}`}
                            onClick={() => handlePlayLevel(level)}
                        >
                            {/* Level Number Badge */}
                            <div className="level-badge">
                                <span className="level-number">{level.levelId}</span>
                            </div>

                            {/* Level Info */}
                            <div className="level-info">
                                <h4 className="level-name">{level.name}</h4>
                                <p className="level-description">{level.description}</p>
                            </div>

                            {/* Level Stats */}
                            <div className="level-stats">
                                <div
                                    className="difficulty-badge"
                                    style={{ borderColor: getDifficultyColor(level.difficulty) }}
                                >
                                    <span style={{ color: getDifficultyColor(level.difficulty) }}>
                                        {level.difficulty}
                                    </span>
                                </div>
                                <div className="par-moves">
                                    <span className="par-label">Par:</span>
                                    <span className="par-value">{level.parMoves}</span>
                                </div>
                            </div>

                            {/* Stars Display */}
                            <div className="level-stars">
                                {[1, 2, 3].map(i => (
                                    <span
                                        key={i}
                                        className={`star ${i <= (level.stars || 0) ? 'earned' : ''}`}
                                    >
                                        ★
                                    </span>
                                ))}

                                {/* Completed Badge */}
                                {level.isCompleted && (
                                    <div className="completed-badge">
                                        ✓ Completed
                                    </div>
                                )}
                            </div>

                            {/* Locked Overlay */}
                            {!isUnlocked && (
                                <div className="locked-overlay">
                                    <div className="lock-icon">🔒</div>
                                    <p>Locked</p>
                                    {level.unlockRequirement > 0 && (
                                        <p className="unlock-hint">Complete Level {level.unlockRequirement}</p>
                                    )}
                                </div>
                            )}

                            {/* Play Button */}
                            {isUnlocked && (
                                <div className="play-overlay">
                                    <button className="play-btn">
                                        ▶ Play
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelSelection;
