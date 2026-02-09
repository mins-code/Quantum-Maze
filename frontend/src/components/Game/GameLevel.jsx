/**
 * GameLevel Component - Main Gameplay Screen
 * 
 * Integrates QuantumEngine with React UI
 * Handles keyboard input and renders dual maze boards
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MazeBoard from './MazeBoard';
import VictoryModal from './VictoryModal';
import QuantumEngine from '../../gameEngine/QuantumEngine';
import { KEY_TO_DIRECTION, TILE_METADATA } from '../../gameEngine/gameConstants';
import api, { submitScore, fetchBestReplay } from '../../utils/api';
import Legend from './Legend';
import AudioManager from '../../utils/AudioManager';
import confetti from 'canvas-confetti';
import './GameLevel.css';

const GameLevel = ({ isCustom = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
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
        activeSwitches: [],
        coinsCollected: 0,
        totalCoins: 0,
        undoCount: 0,
        hintsUsed: 0
    });

    const [message, setMessage] = useState('');
    const [leftGrid, setLeftGrid] = useState([]);
    const [rightGrid, setRightGrid] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showVictoryModal, setShowVictoryModal] = useState(false);
    const [levelData, setLevelData] = useState(null);
    const [ghostPos, setGhostPos] = useState(null);
    const [isShaking, setIsShaking] = useState(false);
    const [scannerData, setScannerData] = useState(null);

    // Fetch and initialize level
    useEffect(() => {
        const initGame = async () => {
            if (!id) return;

            setLoading(true);
            setError('');
            setShowVictoryModal(false);

            try {
                // Determine source: Custom vs Built-in
                let data;
                if (isCustom) {
                    const response = await api.get(`/custom-levels/${id}`);
                    data = response.data.level; // Corrected: Access .level from response
                } else {
                    const response = await api.get(`/levels/${id}`);
                    data = response.data.data || response.data;
                }

                if (!data) throw new Error("Level data not found");

                // Initialize Engine
                engineRef.current = new QuantumEngine();
                const success = engineRef.current.loadLevel(data);

                if (success) {
                    // Update Component State from Engine
                    setLeftGrid(engineRef.current.leftMaze.getGrid());
                    setRightGrid(engineRef.current.rightMaze.getGrid());

                    setGameState({
                        leftPlayer: { ...engineRef.current.leftPlayer },
                        rightPlayer: { ...engineRef.current.rightPlayer },
                        moveCount: 0,
                        hasWon: false,
                        gameStarted: true
                    });

                    // Update helper states
                    setLevelData(data);
                    if (typeof updateStats === 'function') updateStats();
                    setMessage(data.description || 'Use Arrow Keys or WASD to move. Both players must move together!');

                    // Setup Audio
                    AudioManager.load('/music/cyber_ambience.mp3', '/music/cyber_beat.mp3');
                    const audioStarted = await AudioManager.play();

                    if (!audioStarted) {
                        console.log('Audio autoplay blocked - waiting for user interaction');
                        const resumeAudio = async () => {
                            const success = await AudioManager.play();
                            if (success) {
                                document.removeEventListener('click', resumeAudio);
                                document.removeEventListener('keydown', resumeAudio);
                            }
                        };
                        document.addEventListener('click', resumeAudio);
                        document.addEventListener('keydown', resumeAudio);
                    }

                    // Handles Ghost Replay (Built-in only)
                    if (!isCustom) {
                        try {
                            const replayData = await fetchBestReplay(id);
                            if (replayData && replayData.length > 0) {
                                engineRef.current.loadGhostReplay(replayData);
                                setGhostPos(engineRef.current.getGhostPositions(0));
                                console.log('Ghost replay loaded');
                            } else {
                                setGhostPos(null);
                            }
                        } catch (replayErr) {
                            console.warn("Ghost replay fetch error", replayErr);
                            setGhostPos(null);
                        }
                    } else {
                        setGhostPos(null);
                    }

                } else {
                    setError('Failed to initialize game engine with level data');
                }

            } catch (err) {
                console.error('Error loading level:', err);
                setError('Failed to load level. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            initGame();
        }

        return () => {
            // Cleanup: Stop audio when component unmounts
            AudioManager.stop();
            engineRef.current = null;
        };
    }, [id, isCustom]);

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
            // Export replay history from engine
            const replayHistory = engineRef.current.exportHistory();

            // Get current stats including coin data
            const currentStats = engineRef.current.getStats();

            // Submit score with replay data and coin data
            const scoreResponse = await submitScore(
                isCustom ? id : parseInt(id),
                moves,
                time,
                replayHistory,
                currentStats.coinsCollected,
                currentStats.totalCoins,
                isCustom // Pass isCustom flag
            );
            console.log('Score submitted:', scoreResponse);

            // For official levels, save to progress endpoint to unlock next level
            if (!isCustom) {
                const response = await api.post(`/progress/complete/${id}`, {
                    moves,
                    time
                });
                console.log('Level completion saved:', response.data);
                return response.data;
            }

            return scoreResponse; // Return score response for custom levels


        } catch (error) {
            console.error('Error saving level completion:', error);
            // Don't block the victory modal if saving fails
            return null;
        }
    };

    const triggerWinConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
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

            // Update ghost position based on current move count
            const newGhostPos = engineRef.current.getGhostPositions(result.moveCount);
            setGhostPos(newGhostPos);

            if (result.hasWon) {
                // Trigger victory confetti
                triggerWinConfetti();

                // Fire again for longer effect
                setTimeout(() => triggerWinConfetti(), 400);

                // Save level completion to backend
                const currentStats = engineRef.current.getStats();
                saveLevelCompletion(currentStats.moveCount, currentStats.elapsedTime);
                setShowVictoryModal(true);
            } else {
                setMessage('');
            }
        } else {
            // Trigger screen shake effect on collision
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 300);

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

            // Update ghost position after undo
            const newGhostPos = engineRef.current.getGhostPositions(result.moveCount);
            setGhostPos(newGhostPos);

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

        // Reset ghost position to start
        const initialGhostPos = engineRef.current.getGhostPositions(0);
        setGhostPos(initialGhostPos);

        setMessage('🔄 Level reset');
        setTimeout(() => setMessage(''), 1500);
    };

    const handleHint = () => {
        const hint = engineRef.current.getHint();

        if (hint.success) {
            setMessage(`💡 Hint: Try moving ${hint.direction}`);
            updateStats();
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage('❌ No path found');
            setTimeout(() => setMessage(''), 2000);
        }
    };

    const updateStats = () => {
        const newStats = engineRef.current.getStats();
        setStats(newStats);

        // Update audio based on distance to goal (plays beat when ≤5 steps away)
        if (newStats.distanceToGoal !== undefined) {
            AudioManager.setDistanceFromGoal(newStats.distanceToGoal);
        }
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

    // Handle tile hover for scanner with debounce
    const hoverTimeoutRef = useRef(null);

    const handleTileHover = (data) => {
        // Clear any pending timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        if (data === null) {
            // Immediately clear on mouse leave
            setScannerData(null);
        } else {
            // Small debounce to prevent rapid updates
            hoverTimeoutRef.current = setTimeout(() => {
                const metadata = TILE_METADATA[data.type];
                setScannerData({
                    ...data,
                    ...metadata
                });
            }, 50); // 50ms debounce
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

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
                coinsCollected={stats.coinsCollected}
                totalCoins={stats.totalCoins}
                undoCount={stats.undoCount}
                hintsUsed={stats.hintsUsed}
                levelId={id}
                onReplay={handleReplay}
                onClose={handleCloseVictory}
            />

            {/* Header */}
            <div className="game-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/levels')}>
                        ← Back
                    </button>
                    <h2 className="level-title">Quantum Maze</h2>
                </div>
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
                    <div className="stat-item">
                        <span className="stat-label">Coins</span>
                        <span className="stat-value">🪙 {stats.coinsCollected} / {stats.totalCoins}</span>
                    </div>
                </div>
            </div>

            {/* Scanner Panel */}
            <div className="scanner-panel">
                <div className="scanner-header">
                    <span className="scanner-icon">🔍</span>
                    <span className="scanner-title">TILE SCANNER</span>
                </div>
                <div className="scanner-content">
                    {!scannerData ? (
                        <div className="scanner-idle">
                            <span className="scanner-text">SCANNING... NO TARGET</span>
                            <span className="scanner-cursor">_</span>
                        </div>
                    ) : (
                        <div className="scanner-active">
                            <div className="scanner-row">
                                <span className="scanner-label">TARGET:</span>
                                <span
                                    className="scanner-tile-name"
                                    style={{ color: scannerData.color }}
                                >
                                    {scannerData.name}
                                </span>
                            </div>
                            <div className="scanner-row">
                                <span className="scanner-label">COORDS:</span>
                                <span className="scanner-value">
                                    [X:{scannerData.col}, Y:{scannerData.row}]
                                </span>
                            </div>
                            <div className="scanner-row">
                                <span className="scanner-label">STATUS:</span>
                                <span className={`scanner-hazard hazard-${scannerData.hazardLevel.toLowerCase()}`}>
                                    {scannerData.hazardLevel}
                                </span>
                            </div>
                            <div className="scanner-row">
                                <span className="scanner-label">SIDE:</span>
                                <span className={`scanner-side side-${scannerData.side.toLowerCase()}`}>
                                    {scannerData.side}
                                </span>
                            </div>
                            <div className="scanner-analysis">
                                <span className="scanner-label">ANALYSIS:</span>
                                <p className="scanner-description">{scannerData.description}</p>
                            </div>
                        </div>
                    )}
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
                    ghostPos={ghostPos?.left}
                    isShaking={isShaking}
                    onTileHover={handleTileHover}
                    playerAvatar={user?.avatar}
                    currentMoveCount={gameState.moveCount}
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
                    ghostPos={ghostPos?.right}
                    isShaking={isShaking}
                    onTileHover={handleTileHover}
                    playerAvatar={user?.avatar}
                    currentMoveCount={gameState.moveCount}
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