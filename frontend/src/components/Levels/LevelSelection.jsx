/**
 * LevelSelection Component - With User Progress
 * Displays all available levels with unlock status
 * Level 1 is ALWAYS unlocked
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './LevelSelection.css';

const LevelSelection = () => {
    const navigate = useNavigate();
    const [levels, setLevels] = useState([]);
    const [customLevels, setCustomLevels] = useState([]); // Store custom levels
    const [userScores, setUserScores] = useState({}); // Map of customLevelId -> score
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth(); // Get user to fetch their levels

    useEffect(() => {
        const loadAllLevels = async () => {
            setLoading(true);
            try {
                // Fetch built-in levels (already has progress merged)
                const builtinRes = await api.get('/progress/levels');
                setLevels(builtinRes.data.data);

                // Fetch global custom levels (returns { levels: [], pagination: {} })
                const customRes = await api.get('/custom-levels');
                setCustomLevels(customRes.data.levels || []);

                // Fetch user scores to map to custom levels (only if logged in)
                if (user) {
                    const progressRes = await api.get('/game/progress');
                    // data.progress contains the scores array, not data.data
                    const scores = progressRes.data.progress?.scores || [];

                    // Create map for quick lookup: customLevelId -> score
                    const scoreMap = {};
                    scores.forEach(score => {
                        if (score.levelType === 'custom' && score.customLevelId) {
                            scoreMap[score.customLevelId] = score;
                        }
                    });
                    setUserScores(scoreMap);
                }

                setError('');
            } catch (err) {
                console.error('Error fetching levels:', err);
                setError('Failed to load levels');
            } finally {
                setLoading(false);
            }
        };

        loadAllLevels();
    }, [user]);

    const handlePlayLevel = (levelId) => {
        navigate(`/play/${levelId}`);
    };

    const handlePlayCustomLevel = (levelId) => {
        navigate(`/play/custom/${levelId}`);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'var(--success)';
            case 'Medium': return 'var(--warning)';
            case 'Hard': return 'var(--error)';
            default: return 'var(--neon-cyan)';
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

            <div className="levels-scroll-container">
                {/* Built-in Levels Section */}
                <h2 className="section-title">Campaign Levels</h2>
                <div className="levels-grid">
                    {levels.map((level) => {
                        const isUnlocked = level.levelId === 1 || level.isUnlocked;

                        return (
                            <div
                                key={level.levelId}
                                className={`level-card glass-card ${!isUnlocked ? 'locked' : ''}`}
                                onClick={() => handlePlayLevel(level.levelId)}
                            >
                                {/* Edit Button (Top Left) */}
                                <button
                                    className="btn-edit-builtin"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/editor/builtin/${level.levelId}`);
                                    }}
                                    title="Edit Level"
                                >
                                    ✏️
                                </button>

                                {/* Level Number Badge (Top Right) */}
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

                                {/* Footer Row: Stars & Completed Status */}
                                <div className="level-footer-row">
                                    <div className="level-stars">
                                        {[1, 2, 3].map(i => (
                                            <span
                                                key={i}
                                                className={`star ${i <= (level.stars || 0) ? 'earned' : ''}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>

                                    {level.isCompleted && (
                                        <div className="completed-badge">
                                            ✓ COMPLETED
                                        </div>
                                    )}
                                </div>

                                {/* Locked Overlay */}
                                {!isUnlocked && (
                                    <div className="locked-overlay">
                                        <div className="lock-icon">🔒</div>
                                        <p>Locked</p>
                                        <p className="unlock-hint">Complete Level {level.levelId - 1}</p>
                                    </div>
                                )}

                                {/* Play Button Overlay */}
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

                {/* Custom Levels Section */}
                {customLevels.length > 0 && (
                    <>
                        <h2 className="section-title" style={{ marginTop: '2rem' }}>Custom Levels</h2>
                        <div className="levels-grid">
                            {customLevels.map((level, index) => {
                                const score = userScores[level._id];
                                const isCompleted = score && score.completed;
                                const stars = score ? score.stars : 0;

                                return (
                                    <div
                                        key={level._id}
                                        className="level-card glass-card custom-level-card"
                                        onClick={() => handlePlayCustomLevel(level._id)}
                                    >
                                        {/* Custom Badge with Number */}
                                        <div className="level-badge custom-badge">
                                            <span className="level-number">{index + 1}</span>
                                        </div>

                                        <div className="level-info">
                                            <h4 className="level-name">{level.name}</h4>
                                            <p className="level-description">{level.description || "No description"}</p>
                                        </div>

                                        <div className="level-stats">
                                            <div
                                                className="difficulty-badge"
                                                style={{ borderColor: getDifficultyColor(level.difficulty) }}
                                            >
                                                <span style={{ color: getDifficultyColor(level.difficulty) }}>
                                                    {level.difficulty}
                                                </span>
                                            </div>
                                            {/* Par Moves aligned to right (via flex margin-left auto if needed or just space-between) */}
                                            <div className="par-moves" style={{ marginLeft: 'auto' }}>
                                                <span className="par-label">Par:</span>
                                                <span className="par-value">{level.parMoves}</span>
                                            </div>
                                        </div>

                                        {/* Footer Row: Stars & Completed Status (Only if played) */}
                                        {(isCompleted || stars > 0) && (
                                            <div className="level-footer-row">
                                                <div className="level-stars">
                                                    {[1, 2, 3].map(i => (
                                                        <span
                                                            key={i}
                                                            className={`star ${i <= stars ? 'earned' : ''}`}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="completed-badge">
                                                    ✓ COMPLETED
                                                </div>
                                            </div>
                                        )}

                                        <div className="play-overlay">
                                            <button className="play-btn">
                                                ▶ Play
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LevelSelection;
