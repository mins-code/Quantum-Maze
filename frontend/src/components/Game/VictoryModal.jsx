/**
 * VictoryModal Component
 * Displays when player completes a level
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VictoryModal.css';

const VictoryModal = ({
    isOpen,
    stars,
    moves,
    parMoves,
    time,
    levelId,
    onReplay,
    onClose
}) => {
    const navigate = useNavigate();
    const [showStars, setShowStars] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Delay star animation
            setTimeout(() => setShowStars(true), 500);
        } else {
            setShowStars(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNextLevel = () => {
        const nextId = parseInt(levelId) + 1;
        // Check if next level exists (max 3 levels for now)
        if (nextId <= 3) {
            navigate(`/play/${nextId}`);
        } else {
            navigate('/levels');
        }
    };

    const handleBackToLevels = () => {
        navigate('/levels');
    };

    return (
        <div className="victory-modal-overlay">
            <div className="victory-modal glass-card">
                {/* Confetti Effect */}
                <div className="confetti-container">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                background: `hsl(${Math.random() * 360}, 70%, 60%)`
                            }}
                        />
                    ))}
                </div>

                {/* Victory Content */}
                <div className="victory-content">
                    <h2 className="victory-title">🎉 Victory! 🎉</h2>
                    <p className="victory-subtitle">Level Complete!</p>

                    {/* Stars Display */}
                    <div className="victory-stars">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`victory-star ${showStars && i <= stars ? 'earned' : ''}`}
                                style={{ animationDelay: `${i * 0.2}s` }}
                            >
                                ★
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="victory-stats">
                        <div className="victory-stat">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-info">
                                <div className="stat-label">Moves</div>
                                <div className="stat-value">{moves} / {parMoves}</div>
                            </div>
                        </div>

                        <div className="victory-stat">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-info">
                                <div className="stat-label">Time</div>
                                <div className="stat-value">{time}s</div>
                            </div>
                        </div>

                        <div className="victory-stat">
                            <div className="stat-icon">⭐</div>
                            <div className="stat-info">
                                <div className="stat-label">Stars Earned</div>
                                <div className="stat-value">{stars} / 3</div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Message */}
                    <div className="performance-message">
                        {stars === 3 && <p className="perfect">🏆 Perfect! You're a master!</p>}
                        {stars === 2 && <p className="great">✨ Great job! Almost perfect!</p>}
                        {stars === 1 && <p className="good">👍 Good work! Try for more stars!</p>}
                        {stars === 0 && <p className="retry">💪 Keep trying! You can do better!</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="victory-actions">
                        <button
                            className="btn btn-secondary victory-btn"
                            onClick={onReplay}
                        >
                            🔄 Replay Level
                        </button>

                        {parseInt(levelId) < 3 && (
                            <button
                                className="btn btn-primary victory-btn"
                                onClick={handleNextLevel}
                            >
                                ▶ Next Level
                            </button>
                        )}

                        <button
                            className="btn btn-secondary victory-btn"
                            onClick={handleBackToLevels}
                        >
                            📋 Back to Levels
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VictoryModal;
