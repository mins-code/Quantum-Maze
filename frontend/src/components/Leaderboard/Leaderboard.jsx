/**
 * Leaderboard Component - Quantum Maze
 * Displays level-based leaderboards with sorting options
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './Leaderboard.css';

const Leaderboard = () => {
    const navigate = useNavigate();

    // State Management
    const [currentLevel, setCurrentLevel] = useState(1);
    const [sortBy, setSortBy] = useState('time');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [availableLevels, setAvailableLevels] = useState([1, 2, 3, 4]); // Default levels

    // Fetch available levels on mount
    useEffect(() => {
        const fetchLevels = async () => {
            try {
                const response = await api.get('/game/levels');
                if (response.data.success) {
                    const levelIds = response.data.levels.map(level => level.levelId);
                    setAvailableLevels(levelIds);
                }
            } catch (err) {
                console.error('Error fetching levels:', err);
            }
        };
        fetchLevels();
    }, []);

    // Fetch leaderboard data whenever level or sort changes
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await api.get(`/leaderboard/${currentLevel}?sortBy=${sortBy}`);

                if (response.data.success) {
                    setLeaderboardData(response.data.data);
                } else {
                    setError('Failed to load leaderboard');
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError('Failed to load leaderboard data');
                setLeaderboardData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [currentLevel, sortBy]);

    // Format time in seconds to display format
    const formatTime = (seconds) => {
        return `${seconds}s`;
    };

    // Get avatar URL or default
    const getAvatarUrl = (avatar) => {
        return avatar || '/default-avatar.png';
    };

    return (
        <div className="leaderboard-container">
            {/* Header */}
            <div className="leaderboard-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <div>
                    <h1 className="leaderboard-title">🏆 Leaderboard</h1>
                    <p className="leaderboard-subtitle">Compete for the top spot!</p>
                </div>
            </div>

            {/* Controls Section */}
            <div className="leaderboard-controls">
                {/* Level Selector */}
                <div className="level-selector">
                    <label className="selector-label">Select Level:</label>
                    <div className="level-buttons">
                        {availableLevels.map(levelId => (
                            <button
                                key={levelId}
                                className={`level-btn ${currentLevel === levelId ? 'active' : ''}`}
                                onClick={() => setCurrentLevel(levelId)}
                            >
                                Level {levelId}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Toggle */}
                <div className="sort-toggle">
                    <label className="selector-label">Sort By:</label>
                    <div className="toggle-buttons">
                        <button
                            className={`toggle-btn ${sortBy === 'time' ? 'active' : ''}`}
                            onClick={() => setSortBy('time')}
                        >
                            ⚡ Fastest Time
                        </button>
                        <button
                            className={`toggle-btn ${sortBy === 'moves' ? 'active' : ''}`}
                            onClick={() => setSortBy('moves')}
                        >
                            🎯 Least Moves
                        </button>
                    </div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="leaderboard-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading leaderboard...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p className="error-message">{error}</p>
                    </div>
                ) : leaderboardData.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏁</div>
                        <h3>No Records Yet</h3>
                        <p>Be the first to complete Level {currentLevel}!</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/game/${currentLevel}`)}
                        >
                            Play Level {currentLevel}
                        </button>
                    </div>
                ) : (
                    <div className="leaderboard-table-wrapper">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th className="rank-col">Rank</th>
                                    <th className="player-col">Player</th>
                                    <th className={`time-col ${sortBy === 'time' ? 'highlight' : ''}`}>
                                        Time {sortBy === 'time' && '⭐'}
                                    </th>
                                    <th className={`moves-col ${sortBy === 'moves' ? 'highlight' : ''}`}>
                                        Moves {sortBy === 'moves' && '⭐'}
                                    </th>
                                    <th className="stars-col">Stars</th>
                                    <th className="coins-col">Coins</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((entry) => (
                                    <tr key={entry.userId} className={`rank-${entry.rank}`}>
                                        <td className="rank-col">
                                            <div className="rank-badge">
                                                {entry.rank === 1 && '🥇'}
                                                {entry.rank === 2 && '🥈'}
                                                {entry.rank === 3 && '🥉'}
                                                {entry.rank > 3 && `#${entry.rank}`}
                                            </div>
                                        </td>
                                        <td className="player-col">
                                            <div className="player-info">
                                                <img
                                                    src={getAvatarUrl(entry.avatar)}
                                                    alt={entry.username}
                                                    className="player-avatar"
                                                    onError={(e) => {
                                                        e.target.src = '/default-avatar.png';
                                                    }}
                                                />
                                                <span className="player-name">{entry.username}</span>
                                            </div>
                                        </td>
                                        <td className={`time-col ${sortBy === 'time' ? 'highlight' : ''}`}>
                                            {formatTime(entry.timeTaken)}
                                        </td>
                                        <td className={`moves-col ${sortBy === 'moves' ? 'highlight' : ''}`}>
                                            {entry.moves}
                                        </td>
                                        <td className="stars-col">
                                            <div className="stars-display">
                                                {[1, 2, 3].map(i => (
                                                    <span
                                                        key={i}
                                                        className={`star ${i <= entry.stars ? 'active' : ''}`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="coins-col">
                                            {entry.allCoinsCollected ? (
                                                <span className="all-coins">🪙 {entry.coinsCollected}/{entry.maxCoins}</span>
                                            ) : (
                                                <span className="some-coins">{entry.coinsCollected}/{entry.maxCoins}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
