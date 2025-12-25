/**
 * LevelSelection Component - Dedicated Levels Page
 * Displays all available levels for selection
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
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        try {
            setLoading(true);
            const response = await api.get('/levels');
            setLevels(response.data.data);
            setError('');
        } catch (err) {
            console.error('Error fetching levels:', err);
            setError('Failed to load levels');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayLevel = (levelId) => {
        navigate(`/play/${levelId}`);
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
                {levels.map((level) => (
                    <div
                        key={level.levelId}
                        className={`level-card glass-card ${!level.isUnlocked ? 'locked' : ''}`}
                        onClick={() => level.isUnlocked && handlePlayLevel(level.levelId)}
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
                                    className={`star ${i <= level.stars ? 'earned' : ''}`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        {/* Completed Badge */}
                        {level.isCompleted && (
                            <div className="completed-badge">
                                ✓ Completed
                            </div>
                        )}

                        {/* Locked Overlay */}
                        {!level.isUnlocked && (
                            <div className="locked-overlay">
                                <div className="lock-icon">🔒</div>
                                <p>Locked</p>
                            </div>
                        )}

                        {/* Play Button */}
                        {level.isUnlocked && (
                            <div className="play-overlay">
                                <button className="play-btn">
                                    ▶ Play
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LevelSelection;
