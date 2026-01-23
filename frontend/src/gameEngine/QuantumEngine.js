/**
 * QuantumEngine - Main Game Engine Class
 * 
 * PURPOSE: Core game logic implementing mirrored horizontal movement
 * MECHANICS: Left player moves normally, right player mirrors horizontally
 * RULE: Both players must be able to move, or neither moves
 * 
 * This class integrates all 8 data structures:
 * 1. MazeGrid (Array) - Stores both left and right maze layouts
 * 2. GameStack (Stack) - Implements undo/redo functionality
 * 3. InputQueue (Queue) - Buffers player inputs
 * 4. SwitchManager (Set) - Tracks active switches
 * 5. EntityManager (Map) - Manages player positions and states
 * 6. LinkedList - Records complete move history
 * 7. LevelHierarchy (Tree) - Manages level progression
 * 8. MazeGraph (Graph) - Provides pathfinding for hints
 */

// Import all data structures
import MazeGrid from '../dataStructures/arrayMaze.js';
import GameStack from '../dataStructures/stackUndoRedo.js';
import InputQueue from '../dataStructures/inputQueue.js';
import SwitchManager from '../dataStructures/switchSet.js';
import EntityManager from '../dataStructures/entityMap.js';
import LinkedList from '../dataStructures/moveHistoryLinkedList.js';
import LevelHierarchy from '../dataStructures/levelTree.js';
import MazeGraph from '../dataStructures/mazeGraph.js';

// Import constants and utilities
import {
    TILE_TYPES,
    EMPTY,
    WALL,
    GOAL,
    START,
    SWITCH,
    DOOR,
    PORTAL,
    PLAYER_IDS,
    GAME_STATES,
    DIRECTION_VECTORS
} from './gameConstants.js';

import {
    calculateNewPosition,
    getMirroredDirection,
    isWithinBounds,
    calculateStars,
    getTileId,
    positionsEqual,
    deepClone
} from './helperUtils.js';

export class QuantumEngine {
    constructor() {
        // Initialize all data structures
        this.leftMaze = null;      // MazeGrid for left player's maze
        this.rightMaze = null;     // MazeGrid for right player's maze
        this.undoStack = new GameStack();
        this.redoStack = new GameStack();
        this.inputQueue = new InputQueue();
        this.switches = new SwitchManager();
        this.entities = new EntityManager();
        this.moveHistory = new LinkedList();
        this.pathfindingGraph = new MazeGraph();

        // Switch-door pairing maps
        this.leftSwitchDoorPairs = new Map(); // Maps switch position to door position
        this.rightSwitchDoorPairs = new Map();

        // Game state
        this.currentLevel = null;
        this.gameState = GAME_STATES.IDLE;
        this.moveCount = 0;
        this.startTime = null;
        this.endTime = null;
        this.parMoves = 0;

        // Player positions
        this.leftPlayer = { row: 0, col: 0 };
        this.rightPlayer = { row: 0, col: 0 };

        // Goal positions
        this.leftGoal = { row: 0, col: 0 };
        this.rightGoal = { row: 0, col: 0 };
    }

    /**
     * Load a level from JSON data
     * @param {Object} levelData - Level configuration
     * @returns {boolean} - Success status
     */
    loadLevel(levelData) {
        try {
            // Validate level data
            if (!levelData || !levelData.gridLeft || !levelData.gridRight) {
                console.error('Invalid level data');
                return false;
            }

            // Store level metadata
            this.currentLevel = levelData;
            this.parMoves = levelData.parMoves || 50;

            // Get grid dimensions
            const rows = levelData.gridLeft.length;
            const cols = levelData.gridLeft[0].length;

            // Initialize maze grids
            this.leftMaze = new MazeGrid(rows, cols);
            this.rightMaze = new MazeGrid(rows, cols);

            // Populate left maze
            this.leftMaze.createGrid(EMPTY);
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    this.leftMaze.setTile(row, col, levelData.gridLeft[row][col]);
                }
            }

            // Populate right maze
            this.rightMaze.createGrid(EMPTY);
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    this.rightMaze.setTile(row, col, levelData.gridRight[row][col]);
                }
            }

            // Find and set player start positions
            this._findStartPositions();

            // Find and set goal positions
            this._findGoalPositions();

            // Initialize entities
            this.entities.clear();
            this.entities.addEntity(PLAYER_IDS.LEFT, {
                type: 'player',
                side: 'left',
                row: this.leftPlayer.row,
                col: this.leftPlayer.col
            });

            this.entities.addEntity(PLAYER_IDS.RIGHT, {
                type: 'player',
                side: 'right',
                row: this.rightPlayer.row,
                col: this.rightPlayer.col
            });

            // Build pathfinding graph for hint system
            this._buildPathfindingGraph();

            // Build switch-door pairs
            this._buildSwitchDoorPairs();

            // Reset game state
            this.resetGame();

            console.log('Level loaded successfully:', levelData.name || 'Unnamed Level');
            return true;

        } catch (error) {
            console.error('Error loading level:', error);
            return false;
        }
    }

    /**
     * Handle player input and execute move
     * @param {string} direction - Direction to move (UP, DOWN, LEFT, RIGHT)
     * @returns {Object} - Move result {success, reason, newState}
     */
    handleInput(direction) {
        // Check if game is in playing state
        if (this.gameState !== GAME_STATES.PLAYING) {
            return {
                success: false,
                reason: 'Game not in playing state',
                newState: null
            };
        }

        // Buffer the input
        this.inputQueue.enqueue(direction);

        // Process the input
        return this._processMove(direction);
    }

    /**
     * Process a move with mirrored horizontal logic
     * @param {string} direction - Direction for left player
     * @returns {Object} - Move result
     */
    _processMove(direction) {
        // STEP 1: Calculate new positions
        const leftNewPos = calculateNewPosition(
            this.leftPlayer.row,
            this.leftPlayer.col,
            direction
        );

        // Get mirrored direction for right player
        const mirroredDirection = getMirroredDirection(direction);
        const rightNewPos = calculateNewPosition(
            this.rightPlayer.row,
            this.rightPlayer.col,
            mirroredDirection
        );

        // STEP 2: Validate both moves
        const leftValid = this._isValidMove(
            leftNewPos.row,
            leftNewPos.col,
            this.leftMaze,
            'left'
        );

        const rightValid = this._isValidMove(
            rightNewPos.row,
            rightNewPos.col,
            this.rightMaze,
            'right'
        );

        // CRITICAL RULE: Both players must be able to move, or neither moves
        if (!leftValid || !rightValid) {
            return {
                success: false,
                reason: !leftValid ? 'Left player blocked' : 'Right player blocked',
                blockedPlayer: !leftValid ? 'left' : 'right',
                newState: null
            };
        }

        // STEP 3: Execute the move (both players move)
        const previousState = this._captureGameState();

        // Update positions
        this.leftPlayer = { ...leftNewPos };
        this.rightPlayer = { ...rightNewPos };

        // Update entities
        this.entities.updateEntity(PLAYER_IDS.LEFT, {
            row: this.leftPlayer.row,
            col: this.leftPlayer.col
        });

        this.entities.updateEntity(PLAYER_IDS.RIGHT, {
            row: this.rightPlayer.row,
            col: this.rightPlayer.col
        });

        // STEP 3.5: Handle tile interactions (switches, portals)
        this._handleTileInteraction(this.leftPlayer, this.leftMaze, 'left');
        this._handleTileInteraction(this.rightPlayer, this.rightMaze, 'right');

        // STEP 4: Record the move
        this.moveCount++;

        // Push to undo stack
        this.undoStack.push(previousState);

        // Clear redo stack (new move invalidates redo history)
        this.redoStack.clear();

        // Add to move history
        this.moveHistory.append({
            moveNumber: this.moveCount,
            direction,
            mirroredDirection,
            leftFrom: previousState.leftPlayer,
            leftTo: this.leftPlayer,
            rightFrom: previousState.rightPlayer,
            rightTo: this.rightPlayer,
            timestamp: Date.now()
        });

        // STEP 5: Check for win condition
        const hasWon = this.checkWin();
        if (hasWon) {
            this.gameState = GAME_STATES.WON;
            this.endTime = Date.now();
        }

        // Return new state
        return {
            success: true,
            reason: 'Move executed',
            newState: this._captureGameState(),
            moveCount: this.moveCount,
            hasWon
        };
    }

    /**
     * Validate if a move to a position is valid
     * @param {number} row - Target row
     * @param {number} col - Target column
     * @param {MazeGrid} maze - Maze to check
     * @param {string} side - 'left' or 'right' to determine which pairing map to use
     * @returns {boolean} - True if valid
     */
    _isValidMove(row, col, maze, side = 'left') {
        // Check bounds
        if (!isWithinBounds(row, col, maze.rows, maze.cols)) {
            return false;
        }

        // Check if tile is walkable
        const tile = maze.getTile(row, col);

        // Walls are never walkable
        if (tile === WALL) {
            return false;
        }

        // Handle Doors (Legacy tile 5 or numbered 20-26)
        if (tile === DOOR || (tile >= 20 && tile <= 26)) {
            const doorId = getTileId(row, col);
            const doorNum = tile >= 20 && tile <= 26 ? tile - 20 + 1 : null;

            const pairMap = side === 'left' ? this.leftSwitchDoorPairs : this.rightSwitchDoorPairs;

            // Find which switch unlocks this door
            for (const [switchId, pairedDoorId] of pairMap.entries()) {
                if (pairedDoorId === doorId) {
                    // Check if this switch is activated
                    return this.switches.isActive(switchId);
                }
            }

            // If it's a numbered door but no pairing exists yet, it's locked
            return false;
        }

        // All other tiles are walkable
        return true;
    }

    /**
     * Undo the last move
     * @returns {Object} - Undo result
     */
    undo() {
        if (this.undoStack.isEmpty()) {
            return {
                success: false,
                reason: 'No moves to undo'
            };
        }

        // Save current state to redo stack
        const currentState = this._captureGameState();
        this.redoStack.push(currentState);

        // Restore previous state
        const previousState = this.undoStack.pop();
        this._restoreGameState(previousState);

        this.moveCount--;

        return {
            success: true,
            reason: 'Move undone',
            newState: this._captureGameState(),
            moveCount: this.moveCount
        };
    }

    /**
     * Redo a previously undone move
     * @returns {Object} - Redo result
     */
    redo() {
        if (this.redoStack.isEmpty()) {
            return {
                success: false,
                reason: 'No moves to redo'
            };
        }

        // Save current state to undo stack
        const currentState = this._captureGameState();
        this.undoStack.push(currentState);

        // Restore redo state
        const redoState = this.redoStack.pop();
        this._restoreGameState(redoState);

        this.moveCount++;

        return {
            success: true,
            reason: 'Move redone',
            newState: this._captureGameState(),
            moveCount: this.moveCount
        };
    }

    /**
     * Check if both players are on their goal tiles
     * @returns {boolean} - True if won
     */
    checkWin() {
        const leftOnGoal = positionsEqual(this.leftPlayer, this.leftGoal);
        const rightOnGoal = positionsEqual(this.rightPlayer, this.rightGoal);

        return leftOnGoal && rightOnGoal;
    }

    /**
     * Get a hint using pathfinding
     * @returns {Object} - Hint data with suggested direction
     */
    getHint() {
        // Find path for left player
        const leftStartId = getTileId(this.leftPlayer.row, this.leftPlayer.col);
        const leftGoalId = getTileId(this.leftGoal.row, this.leftGoal.col);

        const path = this.pathfindingGraph.bfs(leftStartId, leftGoalId);

        if (!path || path.length < 2) {
            return {
                success: false,
                reason: 'No path found'
            };
        }

        // Get next tile in path
        const nextTileId = path[1];
        const nextPos = this._parseTileId(nextTileId);

        // Determine direction
        const direction = this._getDirectionFromPositions(
            this.leftPlayer,
            nextPos
        );

        return {
            success: true,
            direction,
            pathLength: path.length - 1
        };
    }

    /**
     * Reset the game to initial state
     */
    resetGame() {
        this.gameState = GAME_STATES.PLAYING;
        this.moveCount = 0;
        this.startTime = Date.now();
        this.endTime = null;

        // Find and reset to start positions
        this._findStartPositions();

        // Update entities
        this.entities.updateEntity(PLAYER_IDS.LEFT, {
            row: this.leftPlayer.row,
            col: this.leftPlayer.col
        });

        this.entities.updateEntity(PLAYER_IDS.RIGHT, {
            row: this.rightPlayer.row,
            col: this.rightPlayer.col
        });

        // Clear stacks and history
        this.undoStack.clear();
        this.redoStack.clear();
        this.moveHistory.clear();
        this.inputQueue.clear();
        this.switches.reset();
    }

    /**
     * Get current game statistics
     * @returns {Object} - Game stats
     */
    getStats() {
        const elapsedTime = this.endTime
            ? this.endTime - this.startTime
            : Date.now() - this.startTime;

        const stars = calculateStars(this.moveCount, this.parMoves);

        return {
            moveCount: this.moveCount,
            parMoves: this.parMoves,
            stars,
            elapsedTime: Math.floor(elapsedTime / 1000),
            gameState: this.gameState,
            canUndo: !this.undoStack.isEmpty(),
            canRedo: !this.redoStack.isEmpty()
        };
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Find start positions in the mazes
     * @private
     */
    _findStartPositions() {
        // Find left player start
        for (let row = 0; row < this.leftMaze.rows; row++) {
            for (let col = 0; col < this.leftMaze.cols; col++) {
                if (this.leftMaze.getTile(row, col) === START) {
                    this.leftPlayer = { row, col };
                    break;
                }
            }
        }

        // Find right player start
        for (let row = 0; row < this.rightMaze.rows; row++) {
            for (let col = 0; col < this.rightMaze.cols; col++) {
                if (this.rightMaze.getTile(row, col) === START) {
                    this.rightPlayer = { row, col };
                    break;
                }
            }
        }
    }

    /**
     * Find goal positions in the mazes
     * @private
     */
    _findGoalPositions() {
        // Find left goal
        for (let row = 0; row < this.leftMaze.rows; row++) {
            for (let col = 0; col < this.leftMaze.cols; col++) {
                if (this.leftMaze.getTile(row, col) === GOAL) {
                    this.leftGoal = { row, col };
                    break;
                }
            }
        }

        // Find right goal
        for (let row = 0; row < this.rightMaze.rows; row++) {
            for (let col = 0; col < this.rightMaze.cols; col++) {
                if (this.rightMaze.getTile(row, col) === GOAL) {
                    this.rightGoal = { row, col };
                    break;
                }
            }
        }
    }

    /**
     * Build pathfinding graph for hint system
     * @private
     */
    _buildPathfindingGraph() {
        this.pathfindingGraph.clear();

        // Add all walkable tiles as nodes
        for (let row = 0; row < this.leftMaze.rows; row++) {
            for (let col = 0; col < this.leftMaze.cols; col++) {
                const tile = this.leftMaze.getTile(row, col);
                if (tile !== WALL) {
                    const tileId = getTileId(row, col);
                    this.pathfindingGraph.addNode(tileId);

                    // Add edges to adjacent walkable tiles
                    const neighbors = this.leftMaze.getNeighbors(row, col);
                    neighbors.forEach(neighbor => {
                        if (neighbor.value !== WALL) {
                            const neighborId = getTileId(neighbor.row, neighbor.col);
                            this.pathfindingGraph.addEdge(tileId, neighborId);
                        }
                    });
                }
            }
        }
    }

    /**
     * Capture current game state for undo/redo
     * @private
     * @returns {Object} - Game state snapshot
     */
    _captureGameState() {
        return {
            leftPlayer: { ...this.leftPlayer },
            rightPlayer: { ...this.rightPlayer },
            moveCount: this.moveCount,
            switches: this.switches.getActiveSwitches()
        };
    }

    /**
     * Restore game state from snapshot
     * @private
     * @param {Object} state - State snapshot
     */
    _restoreGameState(state) {
        this.leftPlayer = { ...state.leftPlayer };
        this.rightPlayer = { ...state.rightPlayer };
        this.moveCount = state.moveCount;

        // Restore switches
        this.switches.reset();
        state.switches.forEach(switchId => {
            this.switches.activate(switchId);
        });

        // Update entities
        this.entities.updateEntity(PLAYER_IDS.LEFT, {
            row: this.leftPlayer.row,
            col: this.leftPlayer.col
        });

        this.entities.updateEntity(PLAYER_IDS.RIGHT, {
            row: this.rightPlayer.row,
            col: this.rightPlayer.col
        });
    }

    /**
     * Parse tile ID to coordinates
     * @private
     */
    _parseTileId(tileId) {
        const parts = tileId.split('_');
        return {
            row: parseInt(parts[1], 10),
            col: parseInt(parts[2], 10)
        };
    }

    /**
     * Get direction from two positions
     * @private
     */
    _getDirectionFromPositions(from, to) {
        const rowDiff = to.row - from.row;
        const colDiff = to.col - from.col;

        if (rowDiff < 0) return 'UP';
        if (rowDiff > 0) return 'DOWN';
        if (colDiff < 0) return 'LEFT';
        if (colDiff > 0) return 'RIGHT';

        return null;
    }

    /**
     * Handle tile interactions (switches, portals)
     * @private
     * @param {Object} playerPos - Player position {row, col}
     * @param {MazeGrid} maze - The maze the player is in
     * @param {string} side - 'left' or 'right'
     */
    _handleTileInteraction(playerPos, maze, side) {
        const tile = maze.getTile(playerPos.row, playerPos.col);

        // Handle switch activation (Legacy 4 or numbered 10-16)
        if (tile === SWITCH || (tile >= 10 && tile <= 16)) {
            const switchId = getTileId(playerPos.row, playerPos.col);
            this.switches.activate(switchId);
            console.log(`${side === 'left' ? 'Left' : 'Right'} Switch activated at (${playerPos.row}, ${playerPos.col})`);
        }

        // Handle portal teleportation (Legacy 6 or numbered 30-36)
        if (tile === PORTAL || (tile >= 30 && tile <= 36)) {
            this._handlePortalTeleport(playerPos, maze, side);
        }
    }

    /**
     * Handle portal teleportation
     * @private
     * @param {Object} playerPos - Player position {row, col}
     * @param {MazeGrid} maze - The maze to search for other portal
     * @param {string} side - 'left' or 'right'
     */
    _handlePortalTeleport(playerPos, maze, side) {
        const currentTile = maze.getTile(playerPos.row, playerPos.col);
        const isNumberedPortal = currentTile >= 30 && currentTile <= 36;

        // Find the other portal in the maze
        for (let row = 0; row < maze.rows; row++) {
            for (let col = 0; col < maze.cols; col++) {
                // Skip the current portal position
                if (row === playerPos.row && col === playerPos.col) {
                    continue;
                }

                const targetTile = maze.getTile(row, col);

                // Match: either both are legacy PORTAL(6), or both have the same portal number
                const isMatch = isNumberedPortal
                    ? targetTile === currentTile
                    : targetTile === PORTAL;

                if (isMatch) {
                    console.log(`Portal teleport (${side}): (${playerPos.row}, ${playerPos.col}) -> (${row}, ${col})`);

                    // Update player position
                    if (side === 'left') {
                        this.leftPlayer = { row, col };
                        this.entities.updateEntity(PLAYER_IDS.LEFT, { row, col });
                    } else {
                        this.rightPlayer = { row, col };
                        this.entities.updateEntity(PLAYER_IDS.RIGHT, { row, col });
                    }

                    return; // Exit after finding match
                }
            }
        }
    }

    /**
     * Build switch-door pairs based on position or number
     * @private
     */
    _buildSwitchDoorPairs() {
        this.leftSwitchDoorPairs.clear();
        this.rightSwitchDoorPairs.clear();

        const processPairs = (maze, pairMap) => {
            const switches = [];
            const doors = [];
            const numberedSwitches = new Map(); // Num -> {row, col, id}
            const numberedDoors = new Map();

            for (let row = 0; row < maze.rows; row++) {
                for (let col = 0; col < maze.cols; col++) {
                    const tile = maze.getTile(row, col);

                    if (tile === SWITCH || (tile >= 10 && tile <= 16)) {
                        const switchInfo = { row, col, id: getTileId(row, col) };
                        if (tile >= 10 && tile <= 16) {
                            numberedSwitches.set(tile - 10 + 1, switchInfo);
                        } else {
                            switches.push(switchInfo);
                        }
                    } else if (tile === DOOR || (tile >= 20 && tile <= 26)) {
                        const doorInfo = { row, col, id: getTileId(row, col) };
                        if (tile >= 20 && tile <= 26) {
                            numberedDoors.set(tile - 20 + 1, doorInfo);
                        } else {
                            doors.push(doorInfo);
                        }
                    }
                }
            }

            // Path 1: Pair by explicit number (e.g., Switch 1 -> Door 1)
            for (const [num, switchInfo] of numberedSwitches.entries()) {
                if (numberedDoors.has(num)) {
                    pairMap.set(switchInfo.id, numberedDoors.get(num).id);
                }
            }

            // Path 2: Pair legacy switches/doors by scan order
            for (let i = 0; i < Math.min(switches.length, doors.length); i++) {
                pairMap.set(switches[i].id, doors[i].id);
            }
        };

        processPairs(this.leftMaze, this.leftSwitchDoorPairs);
        processPairs(this.rightMaze, this.rightSwitchDoorPairs);

        console.log('Switch-Door Pairs Built:');
        console.log('Left:', Array.from(this.leftSwitchDoorPairs.entries()));
        console.log('Right:', Array.from(this.rightSwitchDoorPairs.entries()));
    }
}

export default QuantumEngine;
