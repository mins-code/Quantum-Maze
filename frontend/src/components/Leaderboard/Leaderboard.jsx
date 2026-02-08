/**
 * Leaderboard Component - Quantum Maze
 * Displays level-based leaderboards with sorting options
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Avatar from '../Shared/Avatar';
import './Leaderboard.css';

const Leaderboard = () => {
    const navigate = useNavigate();

    // State Management
    const [currentLevel, setCurrentLevel] = useState('overall'); // Start with overall
    const [sortBy, setSortBy] = useState('time');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [availableLevels, setAvailableLevels] = useState([]); // Will include official + custom

    // Fetch available levels on mount
    useEffect(() => {
        const fetchLevels = async () => {
            try {
                const response = await api.get('/levels/all/combined');
                if (response.data.success) {
                    setAvailableLevels(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching levels:', err);
                // Fallback to default official levels
                setAvailableLevels([
                    { id: 1, name: 'Level 1', type: 'official' },
                    { id: 2, name: 'Level 2', type: 'official' },
                    { id: 3, name: 'Level 3', type: 'official' },
                    { id: 4, name: 'Level 4', type: 'official' }
                ]);
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

                let response;
                if (currentLevel === 'overall') {
                    // Fetch overall leaderboard
                    response = await api.get('/leaderboard/overall/rankings');
                } else {
                    // Fetch level-specific leaderboard
                    const levelData = availableLevels.find(l => l.id === currentLevel);
                    const levelType = levelData?.type || 'official';
                    response = await api.get(`/leaderboard/${currentLevel}?sortBy=${sortBy}&type=${levelType}`);
                }

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

        if (currentLevel === 'overall' || availableLevels.length > 0) {
            fetchLeaderboard();
        }
    }, [currentLevel, sortBy, availableLevels]);

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
                    <label className="selector-label">SELECT LEVEL:</label>
                    <div className="level-buttons">
                        {/* Overall Tab */}
                        <button
                            className={`level-btn ${currentLevel === 'overall' ? 'active' : ''}`}
                            onClick={() => setCurrentLevel('overall')}
                        >
                            ⭐ Overall
                        </button>

                        {/* Official and Custom Levels */}
                        {availableLevels.map((level) => (
                            <button
                                key={`${level.type}-${level.id}`}
                                className={`level-btn ${currentLevel === level.id ? 'active' : ''}`}
                                onClick={() => setCurrentLevel(level.id)}
                                title={level.type === 'custom' ? `By ${level.creator}` : level.name}
                            >
                                {level.type === 'custom'
                                    ? `🎨 ${level.name}`
                                    : `Level ${level.id}`}
                            </button>
                        ))}
                    </div>
                </div>


                {/* Sort Toggle - Hide for overall */}
                {currentLevel !== 'overall' && (
                    <div className="sort-toggle">
                        <label className="selector-label">SORT BY:</label>
                        <div className="toggle-buttons">
                            <button
                                className={`toggle-btn ${sortBy === 'time' ? 'active' : ''}`}
                                onClick={() => setSortBy('time')}
                            >
                                ⏱️ Fastest Time
                            </button>
                            <button
                                className={`toggle-btn ${sortBy === 'moves' ? 'active' : ''}`}
                                onClick={() => setSortBy('moves')}
                            >
                                🎯 Least Moves
                            </button>
                        </div>
                    </div>
                )}
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
                                    {currentLevel === 'overall' ? (
                                        <>
                                            <th className="stars-col highlight">Total Stars ⭐</th>
                                            <th className="moves-col">Levels Completed</th>
                                            <th className="time-col">Avg Time</th>
                                            <th className="coins-col">Total Coins</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className={`time-col ${sortBy === 'time' ? 'highlight' : ''}`}>
                                                Time {sortBy === 'time' && '⭐'}
                                            </th>
                                            <th className={`moves-col ${sortBy === 'moves' ? 'highlight' : ''}`}>
                                                Moves {sortBy === 'moves' && '⭐'}
                                            </th>
                                            <th className="stars-col">Stars</th>
                                            <th className="coins-col">Coins</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((entry, index) => (
                                    <tr key={entry.userId} className={`rank-${index + 1}`}>
                                        <td className="rank-col">
                                            <div className="rank-badge">
                                                {index + 1 === 1 && '🥇'}
                                                {index + 1 === 2 && '🥈'}
                                                {index + 1 === 3 && '🥉'}
                                                {index + 1 > 3 && `#${index + 1}`}
                                            </div>
                                        </td>
                                        <td className="player-col">
                                            <div className="player-info">
                                                <Avatar
                                                    seed={entry.avatar}
                                                    size="sm"
                                                    className="player-avatar"
                                                />
                                                <span className="player-name">{entry.username}</span>
                                            </div>
                                        </td>
                                        {currentLevel === 'overall' ? (
                                            <>
                                                <td className="stars-col">
                                                    <div className="stars-display">
                                                        {'⭐'.repeat(Math.min(entry.totalStars, 5))}
                                                        <span className="star-count"> {entry.totalStars}</span>
                                                    </div>
                                                </td>
                                                <td className="moves-col">{entry.levelsCompleted}</td>
                                                <td className="time-col">{formatTime(entry.averageTime)}</td>
                                                <td className="coins-col">
                                                    🪙 {entry.totalCoins || 0}
                                                </td>
                                            </>
                                        ) : (
                                            <>
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
                                            </>
                                        )}
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
