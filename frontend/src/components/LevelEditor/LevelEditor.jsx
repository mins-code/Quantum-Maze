/**
 * LevelEditor Component - Quantum Maze
 * Interactive level creator with dual grid editing
 */

import React, { useState, useEffect } from 'react';
import MazeBoard from '../Game/MazeBoard';
import { TILE_TYPES } from '../../gameEngine/gameConstants';
import './LevelEditor.css';

import { useNavigate, useParams } from 'react-router-dom';

const LevelEditor = () => {
    const { id, builtinId } = useParams(); // Get level ID or Builtin ID
    const navigate = useNavigate();

    // State management
    const [dimensions, setDimensions] = useState({ rows: 10, cols: 10 });
    const [gridLeft, setGridLeft] = useState([]);
    const [gridRight, setGridRight] = useState([]);
    const [selectedTool, setSelectedTool] = useState(TILE_TYPES.WALL); // Default to WALL
    const [selectedVariant, setSelectedVariant] = useState(0); // 0: Yellow, 1: Cyan, 2: Pink
    const [levelName, setLevelName] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [parMoves, setParMoves] = useState(10);
    const [loading, setLoading] = useState(false);

    // Tile metadata for comprehensive toolbox
    const TILE_METADATA = [
        { type: TILE_TYPES.EMPTY, name: 'Empty', icon: '⬜' },
        { type: TILE_TYPES.WALL, name: 'Wall', icon: '⬛' },
        { type: TILE_TYPES.START, name: 'Start', icon: '🟢' },
        { type: TILE_TYPES.GOAL, name: 'Goal', icon: '🟡' },
        { type: TILE_TYPES.SWITCH, name: 'Switch', icon: '🔘', hasVariants: true },
        { type: TILE_TYPES.DOOR, name: 'Door', icon: '🚪', hasVariants: true },
        { type: TILE_TYPES.PORTAL, name: 'Portal', icon: '🌀' },
        { type: TILE_TYPES.COIN, name: 'Coin', icon: '💰' },
        { type: TILE_TYPES.ONE_WAY_UP, name: 'Up Gate', icon: '⬆️' },
        { type: TILE_TYPES.ONE_WAY_DOWN, name: 'Down Gate', icon: '⬇️' },
        { type: TILE_TYPES.ONE_WAY_LEFT, name: 'Left Gate', icon: '⬅️' },
        { type: TILE_TYPES.ONE_WAY_RIGHT, name: 'Right Gate', icon: '➡️' }
    ];

    const VARIANTS = [
        { id: 0, name: 'Yellow', color: '#ffd700' },
        { id: 1, name: 'Cyan', color: '#00f3ff' },
        { id: 2, name: 'Pink', color: '#ff0055' }
    ];

    // Initialize grids or fetch existing level
    useEffect(() => {
        if (id) {
            fetchLevelData(id, false);
        } else if (builtinId) {
            fetchLevelData(builtinId, true);
        } else {
            // New level - initialize empty grids
            initializeGrids(dimensions.rows, dimensions.cols);
        }
    }, [id, builtinId]); // Only run on mount or ID change

    // Helper to initialize empty grids
    const initializeGrids = (rows, cols) => {
        const createGrid = () => Array(rows).fill(null).map(() => Array(cols).fill(TILE_TYPES.EMPTY));
        setGridLeft(createGrid());
        setGridRight(createGrid());
    };

    // Fetch existing level data
    const fetchLevelData = async (levelId, isBuiltin) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const endpoint = isBuiltin
                ? `http://localhost:5001/api/levels/${levelId}`
                : `http://localhost:5001/api/custom-levels/${levelId}`;

            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                const level = isBuiltin ? data.data : data.level;
                setLevelName(level.name);
                setDescription(level.description || '');
                setDifficulty(level.difficulty);
                setParMoves(level.parMoves);

                // Set dimensions based on loaded grid
                if (level.gridLeft && level.gridLeft.length > 0) {
                    const rows = level.gridLeft.length;
                    const cols = level.gridLeft[0].length;
                    setDimensions({ rows, cols });
                    setGridLeft(level.gridLeft);
                    setGridRight(level.gridRight);
                }
            } else {
                alert(`Error loading level: ${data.message}`);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error fetching level:', error);
            alert('Failed to load level');
        } finally {
            setLoading(false);
        }
    };

    // Handle dimension changes (resize logic)
    const handleDimensionChange = (dimension, value) => {
        const numValue = parseInt(value);
        if (numValue >= 5 && numValue <= 30) {
            const newDims = { ...dimensions, [dimension]: numValue };
            setDimensions(newDims);

            // Resize logic protecting existing data
            const resizeGrid = (oldGrid) => {
                return Array(newDims.rows).fill(null).map((_, r) =>
                    Array(newDims.cols).fill(null).map((_, c) => {
                        if (oldGrid && oldGrid[r] && oldGrid[r][c] !== undefined) {
                            return oldGrid[r][c];
                        }
                        return TILE_TYPES.EMPTY;
                    })
                );
            };

            setGridLeft(prev => resizeGrid(prev));
            setGridRight(prev => resizeGrid(prev));
        }
    };

    // Handle tile click (single place)
    const handleTileClick = (row, col, side) => {
        const updateGrid = side === 'left' ? setGridLeft : setGridRight;

        updateGrid(prev => {
            const newGrid = prev.map(r => [...r]);

            // If tool supports variants (Switch/Door), store object { type, variant }
            // Otherwise store just type
            const toolMeta = TILE_METADATA.find(t => t.type === selectedTool);
            if (toolMeta?.hasVariants) {
                newGrid[row][col] = { type: selectedTool, variant: selectedVariant };
            } else {
                newGrid[row][col] = selectedTool;
            }

            return newGrid;
        });
    };

    // Helper to extract mechanics from grids
    const generateMechanics = (leftGrid, rightGrid) => {
        const switches = [];
        const doors = [];
        const portals = [];

        // Scan a grid and collect entities
        const scanGrid = (grid) => {
            const gridSwitches = [];
            const gridDoors = [];
            const gridPortals = [];

            grid.forEach((row, r) => {
                row.forEach((tileData, c) => {
                    // Normalize tile data (can be int or object)
                    const tileType = typeof tileData === 'object' ? tileData.type : tileData;
                    const variant = typeof tileData === 'object' ? tileData.variant : 0;

                    if (tileType === TILE_TYPES.SWITCH) {
                        gridSwitches.push({ pos: { row: r, col: c }, variant });
                    } else if (tileType === TILE_TYPES.DOOR) {
                        gridDoors.push({ pos: { row: r, col: c }, variant });
                    } else if (tileType === TILE_TYPES.PORTAL) {
                        gridPortals.push({ pos: { row: r, col: c } });
                    }
                });
            });
            return { gridSwitches, gridDoors, gridPortals };
        };

        const left = scanGrid(leftGrid);
        const right = scanGrid(rightGrid);

        const allSwitches = [...left.gridSwitches, ...right.gridSwitches];
        const allDoors = [...left.gridDoors, ...right.gridDoors];
        const allPortals = [...left.gridPortals, ...right.gridPortals];

        // 1. Process Switches & Doors (Group by Variant)
        // All switches of the same color share a variant ID (e.g., switch_v0)
        // This ensures ANY switch of that color activates ALL doors of that color.
        allSwitches.forEach((s) => {
            const id = `switch_v${s.variant}`;
            switches.push({
                id,
                pos: s.pos,
                color: VARIANTS[s.variant]?.name.toLowerCase() || 'blue',
                type: 0, // Toggle
                variant: s.variant
            });
        });

        // Link doors to switches of same variant
        allDoors.forEach((d, index) => {
            const switchId = `switch_v${d.variant}`;
            doors.push({
                id: `door_${index}`,
                pos: d.pos,
                switchId: switchId,
                variant: d.variant
            });
        });

        // 3. Process Portals (Link keys to targets)
        for (let i = 0; i < allPortals.length; i += 2) {
            if (i + 1 < allPortals.length) {
                const p1 = allPortals[i];
                const p2 = allPortals[i + 1];

                portals.push({ pos: p1.pos, target: p2.pos });
                portals.push({ pos: p2.pos, target: p1.pos });
            }
        }

        return { switches, doors, portals };
    };

    // Save level (Create or Update)
    const handleSaveLevel = async () => {
        if (!levelName.trim()) {
            alert('Please enter a level name');
            return;
        }

        const hasStartLeft = gridLeft.some(row => row.some(cell => (typeof cell === 'object' ? cell.type : cell) === TILE_TYPES.START));
        const hasGoalLeft = gridLeft.some(row => row.some(cell => (typeof cell === 'object' ? cell.type : cell) === TILE_TYPES.GOAL));
        const hasStartRight = gridRight.some(row => row.some(cell => (typeof cell === 'object' ? cell.type : cell) === TILE_TYPES.START));
        const hasGoalRight = gridRight.some(row => row.some(cell => (typeof cell === 'object' ? cell.type : cell) === TILE_TYPES.GOAL));

        if (!hasStartLeft || !hasGoalLeft || !hasStartRight || !hasGoalRight) {
            alert('Both grids must have a START (green) and GOAL (yellow) tile');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            let url, method;

            if (builtinId) {
                // Update Built-in Level
                url = `http://localhost:5001/api/levels/${builtinId}`;
                method = 'PUT';
            } else {
                // Custom Level (Create/Update)
                url = id
                    ? `http://localhost:5001/api/custom-levels/${id}`
                    : `http://localhost:5001/api/custom-levels`;
                method = id ? 'PUT' : 'POST';
            }

            // Generate mechanics from grid data
            const mechanics = generateMechanics(gridLeft, gridRight);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: levelName,
                    description,
                    gridLeft,
                    gridRight,
                    difficulty,
                    parMoves,
                    mechanics // Use generated mechanics
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Level ${id ? 'updated' : 'saved'} successfully!`);
                if (!id) {
                    setLevelName('');
                    setDescription('');
                    initializeGrids(dimensions.rows, dimensions.cols);
                }
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

    const isVariantTool = (type) => {
        const meta = TILE_METADATA.find(t => t.type === type);
        return meta?.hasVariants;
    };

    return (
        <div className="level-editor">
            {/* Top Bar */}
            <div className="editor-topbar">
                <div className="editor-controls">
                    {/* Row 1: Main Controls */}
                    <div className="editor-row">
                        <button
                            className="btn-back"
                            onClick={() => navigate('/my-levels')}
                            title="Back to My Levels"
                        >
                            ← Back
                        </button>

                        <div className="control-group" style={{ flex: 2 }}>
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

                    {/* Row 2: Description (Full Width) */}
                    <div className="editor-row">
                        <div className="control-group full-width">
                            <label>Description:</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter level description"
                                maxLength={500}
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    color: '#fff',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
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
                        <div key={tile.type} className="tool-btn-wrapper" style={{ position: 'relative' }}>
                            <button
                                className={`tool-btn ${selectedTool === tile.type ? 'active' : ''}`}
                                onClick={() => setSelectedTool(tile.type)}
                                title={tile.name}
                            >
                                <div
                                    className={`tool-preview ${tile.type}`}
                                >
                                    <span className="tool-icon">{tile.icon}</span>
                                </div>
                                <span className="tool-name">{tile.name}</span>

                                {/* Indicator for selected variant */}
                                {selectedTool === tile.type && tile.hasVariants && (
                                    <div
                                        className="tool-variant-indicator"
                                        style={{
                                            background: VARIANTS.find(v => v.id === selectedVariant)?.color,
                                            width: '100%',
                                            height: '4px',
                                            borderRadius: '2px',
                                            marginTop: '4px',
                                            boxShadow: `0 0 5px ${VARIANTS.find(v => v.id === selectedVariant)?.color}`
                                        }}
                                    ></div>
                                )}
                            </button>

                            {/* Pop-up Color Selector */}
                            {selectedTool === tile.type && tile.hasVariants && (
                                <div className="variant-popup">
                                    <div className="variant-popup-arrow"></div>
                                    <span className="variant-popup-label">Select Color</span>
                                    <div className="variant-options">
                                        {VARIANTS.map(v => (
                                            <button
                                                key={v.id}
                                                className={`variant-btn ${selectedVariant === v.id ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedVariant(v.id);
                                                }}
                                                title={v.name}
                                                style={{
                                                    borderColor: selectedVariant === v.id ? '#fff' : 'transparent',
                                                    boxShadow: selectedVariant === v.id ? `0 0 10px ${v.color}` : 'none'
                                                }}
                                            >
                                                <div className="variant-dot" style={{ background: v.color }}></div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="tool-hint">
                    💡 Click on a tile to place the selected element. (Click-only mode)
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
                        onTileClick={(row, col) => handleTileClick(row, col, 'left')}
                    />
                </div>
                <div className="editor-grid-wrapper">
                    <MazeBoard
                        gridData={gridRight}
                        title="Right Grid (Cyan)"
                        playerSide="right"
                        isEditor={true}
                        onTileClick={(row, col) => handleTileClick(row, col, 'right')}
                    />
                </div>
            </div>

            {/* Instructions */}
            <div className="editor-instructions">
                <h4>📖 Instructions</h4>
                <ul>
                    <li><strong>Select a tool</strong> from the toolbox above</li>
                    <li><strong>Click</strong> on tiles to place the selected tool</li>
                    <li>Both grids must have a <strong>START</strong> (🟢) and <strong>GOAL</strong> (🟡) tile</li>
                    <li>For <strong>Switches & Doors</strong>, select a color to link them logically!</li>
                    <li>Adjust grid size (5-30 rows/cols) as needed</li>
                </ul>
            </div>
        </div>
    );
};

export default LevelEditor;
