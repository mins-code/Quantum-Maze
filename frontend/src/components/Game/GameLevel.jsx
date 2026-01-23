/**
 * GameLevel Component - Main Gameplay Screen
 * 
 * Integrates QuantumEngine with React UI
 * Handles keyboard input and renders dual maze boards
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MazeBoard from './MazeBoard';
import VictoryModal from './VictoryModal';
import QuantumEngine from '../../gameEngine/QuantumEngine';
import { KEY_TO_DIRECTION } from '../../gameEngine/gameConstants';
import api from '../../utils/api';
import Legend from './Legend';
import './GameLevel.css';

const GameLevel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const engineRef = useRef(null);

    const [gameState, setGameState] = useState({
        leftPlayer: { row: 0, col: 0 },
        rightPlayer: { row: 0, col: 0 },
        moveCount: 0,
        hasWon: false,
        gameStarted: false
    });

    const [stats, setStats] = useState({
        moveCount: 0,
        parMoves: 0,
        stars: 0,
        elapsedTime: 0,
        canUndo: false,
        canRedo: false,
        activeSwitches: []
    });

    const [message, setMessage] = useState('');
    const [leftGrid, setLeftGrid] = useState([]);
    const [rightGrid, setRightGrid] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showVictoryModal, setShowVictoryModal] = useState(false);
    const [levelData, setLevelData] = useState(null);

    // Fetch and initialize level
    useEffect(() => {
        const fetchAndLoadLevel = async () => {
            try {
                setLoading(true);
                setError('');
                // Reset victory modal when changing levels
                setShowVictoryModal(false);

                // Fetch level data from API
                const response = await api.get(`/levels/${id}`);
                const data = response.data.data;
                setLevelData(data);

                // Create engine instance
                engineRef.current = new QuantumEngine();

                // Load level
                const success = engineRef.current.loadLevel(data);

                if (success) {
                    setLeftGrid(engineRef.current.leftMaze.getGrid());
                    setRightGrid(engineRef.current.rightMaze.getGrid());

                    setGameState({
                        leftPlayer: { ...engineRef.current.leftPlayer },
                        rightPlayer: { ...engineRef.current.rightPlayer },
                        moveCount: 0,
                        hasWon: false,
                        gameStarted: true
                    });

                    updateStats();
                    setMessage('Use Arrow Keys or WASD to move. Both players must move together!');
                } else {
                    setError('Failed to load level');
                }
            } catch (err) {
                console.error('Error loading level:', err);
                setError('Failed to load level. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAndLoadLevel();

        return () => {
            engineRef.current = null;
        };
    }, [id]);

    // Keyboard input handler
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!engineRef.current || gameState.hasWon) return;

            const direction = KEY_TO_DIRECTION[event.key];

            if (direction) {
                event.preventDefault();
                handleMove(direction);
            } else if (event.key === 'z' && event.ctrlKey) {
                event.preventDefault();
                handleUndo();
            } else if (event.key === 'r') {
                event.preventDefault();
                handleReset();
            } else if (event.key === 'h') {
                event.preventDefault();
                handleHint();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    const saveLevelCompletion = async (moves, time) => {
        try {
            const response = await api.post(`/progress/complete/${id}`, {
                moves,
                time
            });

            console.log('Level completion saved:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error saving level completion:', error);
            // Don't block the victory modal if saving fails
            return null;
        }
    };

    const handleMove = (direction) => {
        const result = engineRef.current.handleInput(direction);

        if (result.success) {
            setGameState({
                leftPlayer: { ...engineRef.current.leftPlayer },
                rightPlayer: { ...engineRef.current.rightPlayer },
                moveCount: result.moveCount,
                hasWon: result.hasWon,
                gameStarted: true
            });

            updateStats();

            if (result.hasWon) {
                // Save level completion to backend
                const currentStats = engineRef.current.getStats();
                saveLevelCompletion(currentStats.moveCount, currentStats.elapsedTime);
                setShowVictoryModal(true);
            } else {
                setMessage('');
            }
        } else {
            setMessage(`❌ ${result.reason} - Both players must move!`);
            setTimeout(() => setMessage(''), 2000);
        }
    };

    const handleUndo = () => {
        const result = engineRef.current.undo();

        if (result.success) {
            setGameState({
                leftPlayer: { ...engineRef.current.leftPlayer },
                rightPlayer: { ...engineRef.current.rightPlayer },
                moveCount: result.moveCount,
                hasWon: false,
                gameStarted: true
            });
            updateStats();
            setMessage('⏪ Move undone');
            setTimeout(() => setMessage(''), 1500);
        }
    };

    const handleReset = () => {
        engineRef.current.resetGame();

        setGameState({
            leftPlayer: { ...engineRef.current.leftPlayer },
            rightPlayer: { ...engineRef.current.rightPlayer },
            moveCount: 0,
            hasWon: false,
            gameStarted: true
        });

        updateStats();
        setShowVictoryModal(false);
        setMessage('🔄 Level reset');
        setTimeout(() => setMessage(''), 1500);
    };

    const handleHint = () => {
        const hint = engineRef.current.getHint();

        if (hint.success) {
            setMessage(`💡 Hint: Try moving ${hint.direction}`);
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage('❌ No path found');
            setTimeout(() => setMessage(''), 2000);
        }
    };

    const updateStats = () => {
        const newStats = engineRef.current.getStats();
        setStats(newStats);
    };

    const handleReplay = () => {
        setShowVictoryModal(false);
        handleReset();
    };

    const handleCloseVictory = () => {
        setShowVictoryModal(false);
    };

    const renderStars = () => {
        return (
            <div className="stars-display">
                {[1, 2, 3].map(i => (
                    <span key={i} className={`star ${i <= stats.stars ? 'active' : ''}`}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="game-level-loading">
                <div className="spinner"></div>
                <p>Loading level...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="game-level-loading">
                <div className="error-message">{error}</div>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!gameState.gameStarted) {
        return (
            <div className="game-level-loading">
                <div className="spinner"></div>
                <p>Initializing game...</p>
            </div>
        );
    }

    return (
        <div className="game-level-container">
            {/* Victory Modal */}
            <VictoryModal
                isOpen={showVictoryModal}
                stars={stats.stars}
                moves={stats.moveCount}
                parMoves={stats.parMoves}
                time={stats.elapsedTime}
                levelId={id}
                onReplay={handleReplay}
                onClose={handleCloseVictory}
            />

            {/* Header */}
            <div className="game-header">
                <h2 className="level-title">Quantum Maze</h2>
                <div className="game-stats">
                    <div className="stat-item">
                        <span className="stat-label">Moves</span>
                        <span className="stat-value">{stats.moveCount} / {stats.parMoves}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Stars</span>
                        {renderStars()}
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Time</span>
                        <span className="stat-value">{stats.elapsedTime}s</span>
                    </div>
                </div>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`game-message ${gameState.hasWon ? 'win' : ''}`}>
                    {message}
                </div>
            )}

            {/* Dual Maze Boards */}
            <div className="maze-boards-container">
                <MazeBoard
                    gridData={leftGrid}
                    playerPosition={gameState.leftPlayer}
                    playerSide="left"
                    title="Left Maze"
                    mechanics={levelData?.mechanics}
                    activeSwitches={stats.activeSwitches}
                />

                <div className="boards-divider">
                    <div className="sync-indicator">
                        <div className="sync-line"></div>
                        <div className="sync-dot"></div>
                        <span className="sync-text">SYNCED</span>
                    </div>
                </div>

                <MazeBoard
                    gridData={rightGrid}
                    playerPosition={gameState.rightPlayer}
                    playerSide="right"
                    title="Right Maze"
                    mechanics={levelData?.mechanics}
                    activeSwitches={stats.activeSwitches}
                />
            </div>

            {/* Controls */}
            <div className="game-controls">
                <button
                    className="btn btn-secondary control-btn"
                    onClick={handleUndo}
                    disabled={!stats.canUndo}
                >
                    ⏪ Undo (Ctrl+Z)
                </button>

                <button
                    className="btn btn-secondary control-btn"
                    onClick={handleReset}
                >
                    🔄 Reset (R)
                </button>

                <button
                    className="btn btn-secondary control-btn"
                    onClick={handleHint}
                >
                    💡 Hint (H)
                </button>
            </div>

            {/* Legend */}
            <Legend />

            {/* Instructions */}
            <div className="game-instructions">
                <h4>Controls</h4>
                <div className="instructions-grid">
                    <div className="instruction-item">
                        <kbd>↑ ↓ ← →</kbd>
                        <span>Move</span>
                    </div>
                    <div className="instruction-item">
                        <kbd>WASD</kbd>
                        <span>Alternative Move</span>
                    </div>
                    <div className="instruction-item">
                        <kbd>Ctrl+Z</kbd>
                        <span>Undo</span>
                    </div>
                    <div className="instruction-item">
                        <kbd>R</kbd>
                        <span>Reset</span>
                    </div>
                    <div className="instruction-item">
                        <kbd>H</kbd>
                        <span>Hint</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameLevel;
