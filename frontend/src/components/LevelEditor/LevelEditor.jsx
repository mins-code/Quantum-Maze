/**
 * LevelEditor Component - Quantum Maze
 * Interactive level creator with dual grid editing and drag-painting
 */

import React, { useState, useEffect } from 'react';
import MazeBoard from '../Game/MazeBoard';
import { TILE_TYPES } from '../../gameEngine/gameConstants';
import './LevelEditor.css';

const LevelEditor = () => {
    // State management
    const [dimensions, setDimensions] = useState({ rows: 10, cols: 10 });
    const [gridLeft, setGridLeft] = useState([]);
    const [gridRight, setGridRight] = useState([]);
    const [selectedTool, setSelectedTool] = useState(TILE_TYPES.WALL); // Default to WALL
    const [levelName, setLevelName] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [parMoves, setParMoves] = useState(10);
    const [isPainting, setIsPainting] = useState(false); // For drag-painting

    // Tile metadata for comprehensive toolbox
    const TILE_METADATA = [
        { type: TILE_TYPES.EMPTY, name: 'Empty', icon: '⬜', color: '#0a0e27' },
        { type: TILE_TYPES.WALL, name: 'Wall', icon: '⬛', color: '#2d2d44' },
        { type: TILE_TYPES.START, name: 'Start', icon: '🟢', color: '#00ff88' },
        { type: TILE_TYPES.GOAL, name: 'Goal', icon: '🟡', color: '#ffd700' },
        { type: TILE_TYPES.SWITCH, name: 'Switch', icon: '🔘', color: '#8a2be2' },
        { type: TILE_TYPES.DOOR, name: 'Door', icon: '🚪', color: '#ff6b6b' },
        { type: TILE_TYPES.PORTAL, name: 'Portal', icon: '🌀', color: '#00d4ff' },
        { type: TILE_TYPES.COIN, name: 'Coin', icon: '💰', color: '#ffaa00' }
    ];

    // Initialize or resize grids when dimensions change
    useEffect(() => {
        const createGrid = (oldGrid) => {
            const newGrid = Array(dimensions.rows).fill(null).map((_, rowIndex) =>
                Array(dimensions.cols).fill(null).map((_, colIndex) => {
                    // Preserve existing data if possible
                    if (oldGrid && oldGrid[rowIndex] && oldGrid[rowIndex][colIndex] !== undefined) {
                        return oldGrid[rowIndex][colIndex];
                    }
                    return TILE_TYPES.EMPTY; // Default to EMPTY
                })
            );
            return newGrid;
        };

        setGridLeft(prev => createGrid(prev));
        setGridRight(prev => createGrid(prev));
    }, [dimensions]);

    // Stop painting when mouse is released anywhere
    useEffect(() => {
        const handleMouseUp = () => setIsPainting(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    // Handle dimension changes
    const handleDimensionChange = (dimension, value) => {
        const numValue = parseInt(value);
        if (numValue >= 5 && numValue <= 30) {
            setDimensions(prev => ({
                ...prev,
                [dimension]: numValue
            }));
        }
    };

    // Handle cell action (click or drag) - immutable update
    const handleCellAction = (row, col, side) => {
        const updateGrid = side === 'left' ? setGridLeft : setGridRight;
        
        updateGrid(prev => {
            // Create a deep copy of the grid
            const newGrid = prev.map(r => [...r]);
            // Update the specific cell
            newGrid[row][col] = selectedTool;
            return newGrid;
        });
    };

    // Handle mouse down on a cell (start painting)
    const handleMouseDown = (row, col, side) => {
        setIsPainting(true);
        handleCellAction(row, col, side);
    };

    // Handle mouse enter on a cell (continue painting if mouse is down)
    const handleMouseEnter = (row, col, side) => {
        if (isPainting) {
            handleCellAction(row, col, side);
        }
    };

    // Save level to backend
    const handleSaveLevel = async () => {
        if (!levelName.trim()) {
            alert('Please enter a level name');
            return;
        }

        // Validate that both grids have START and GOAL
        const hasStartLeft = gridLeft.some(row => row.includes(TILE_TYPES.START));
        const hasGoalLeft = gridLeft.some(row => row.includes(TILE_TYPES.GOAL));
        const hasStartRight = gridRight.some(row => row.includes(TILE_TYPES.START));
        const hasGoalRight = gridRight.some(row => row.includes(TILE_TYPES.GOAL));

        if (!hasStartLeft || !hasGoalLeft || !hasStartRight || !hasGoalRight) {
            alert('Both grids must have a START (green) and GOAL (yellow) tile');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/custom-levels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: levelName,
                    gridLeft,
                    gridRight,
                    difficulty,
                    parMoves,
                    mechanics: {
                        switches: [],
                        doors: [],
                        portals: []
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Level saved successfully!');
                // Reset form
                setLevelName('');
                setGridLeft(Array(dimensions.rows).fill(null).map(() => Array(dimensions.cols).fill(TILE_TYPES.EMPTY)));
                setGridRight(Array(dimensions.rows).fill(null).map(() => Array(dimensions.cols).fill(TILE_TYPES.EMPTY)));
            } else {
                alert(`Error: ${data.message || 'Failed to save level'}`);
            }
        } catch (error) {
            console.error('Error saving level:', error);
            alert('Failed to save level. Please try again.');
        }
    };

    // Clear grids
    const handleClearGrids = () => {
        if (window.confirm('Are you sure you want to clear both grids?')) {
            setGridLeft(Array(dimensions.rows).fill(null).map(() => Array(dimensions.cols).fill(TILE_TYPES.EMPTY)));
            setGridRight(Array(dimensions.rows).fill(null).map(() => Array(dimensions.cols).fill(TILE_TYPES.EMPTY)));
        }
    };

    return (
        <div className="level-editor">
            {/* Top Bar */}
            <div className="editor-topbar">
                <div className="editor-controls">
                    <div className="control-group">
                        <label>Level Name:</label>
                        <input
                            type="text"
                            value={levelName}
                            onChange={(e) => setLevelName(e.target.value)}
                            placeholder="Enter level name"
                            maxLength={100}
                        />
                    </div>

                    <div className="control-group">
                        <label>Rows:</label>
                        <input
                            type="number"
                            value={dimensions.rows}
                            onChange={(e) => handleDimensionChange('rows', e.target.value)}
                            min={5}
                            max={30}
                        />
                    </div>

                    <div className="control-group">
                        <label>Columns:</label>
                        <input
                            type="number"
                            value={dimensions.cols}
                            onChange={(e) => handleDimensionChange('cols', e.target.value)}
                            min={5}
                            max={30}
                        />
                    </div>

                    <div className="control-group">
                        <label>Difficulty:</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                            <option value="Expert">Expert</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Par Moves:</label>
                        <input
                            type="number"
                            value={parMoves}
                            onChange={(e) => setParMoves(parseInt(e.target.value))}
                            min={1}
                            max={999}
                        />
                    </div>
                </div>

                <div className="editor-actions">
                    <button className="btn-clear" onClick={handleClearGrids}>
                        🗑️ Clear Grids
                    </button>
                    <button className="btn-save" onClick={handleSaveLevel}>
                        💾 Save Level
                    </button>
                </div>
            </div>

            {/* Comprehensive Tool Palette */}
            <div className="tool-palette">
                <h3>🎨 Toolbox</h3>
                <div className="tool-buttons">
                    {TILE_METADATA.map((tile) => (
                        <button
                            key={tile.type}
                            className={`tool-btn ${selectedTool === tile.type ? 'active' : ''}`}
                            onClick={() => setSelectedTool(tile.type)}
                            title={tile.name}
                        >
                            <div 
                                className="tool-preview" 
                                style={{ backgroundColor: tile.color }}
                            >
                                <span className="tool-icon">{tile.icon}</span>
                            </div>
                            <span className="tool-name">{tile.name}</span>
                        </button>
                    ))}
                </div>
                <div className="tool-hint">
                    💡 Click to place, or click and drag to paint multiple tiles
                </div>
            </div>

            {/* Main Editor Area - Dual Grids */}
            <div className="editor-main">
                <div className="editor-grid-wrapper">
                    <MazeBoard
                        gridData={gridLeft}
                        title="Left Grid (Purple)"
                        playerSide="left"
                        isEditor={true}
                        onTileClick={(row, col) => handleMouseDown(row, col, 'left')}
                        onTileEnter={(row, col) => handleMouseEnter(row, col, 'left')}
                    />
                </div>
                <div className="editor-grid-wrapper">
                    <MazeBoard
                        gridData={gridRight}
                        title="Right Grid (Cyan)"
                        playerSide="right"
                        isEditor={true}
                        onTileClick={(row, col) => handleMouseDown(row, col, 'right')}
                        onTileEnter={(row, col) => handleMouseEnter(row, col, 'right')}
                    />
                </div>
            </div>

            {/* Instructions */}
            <div className="editor-instructions">
                <h4>📖 Instructions</h4>
                <ul>
                    <li><strong>Select a tool</strong> from the toolbox above</li>
                    <li><strong>Click</strong> on tiles to place the selected tool</li>
                    <li><strong>Click and drag</strong> to paint multiple tiles at once</li>
                    <li>Both grids must have a <strong>START</strong> (🟢) and <strong>GOAL</strong> (🟡) tile</li>
                    <li>Adjust grid size (5-30 rows/cols) as needed</li>
                    <li>Set difficulty and par moves for star rating calculation</li>
                </ul>
            </div>
        </div>
    );
};

export default LevelEditor;
