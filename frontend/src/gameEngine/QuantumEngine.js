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
    COIN,
    ONE_WAY_UP,
    ONE_WAY_DOWN,
    ONE_WAY_LEFT,
    ONE_WAY_RIGHT,
    SCHRODINGER,
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
    deepClone,
    calculateManhattanDistance
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
        this.doors = new Map(); // Map<posKey, doorData>
        this.portals = new Map(); // Map<posKey, targetPos>
        this.entities = new EntityManager();
        this.moveHistory = new LinkedList();
        this.pathfindingGraph = new MazeGraph();

        // Ghost replay system
        this.ghostHistory = [];

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

        // Coin collection tracking
        this.coinsCollected = 0;
        this.totalCoins = 0;
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

            // Count total coins in both grids
            this.totalCoins = 0;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    if (levelData.gridLeft[row][col] === COIN) {
                        this.totalCoins++;
                    }
                    if (levelData.gridRight[row][col] === COIN) {
                        this.totalCoins++;
                    }
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

            // Load mechanics
            if (levelData.mechanics) {
                // Switches are handled dynamically via this.currentLevel.mechanics
                // No need to initialize SwitchManager with static data

                // Load doors
                this.doors.clear();

                if (levelData.mechanics.doors) {
                    levelData.mechanics.doors.forEach(door => {
                        const key = getTileId(door.pos.row, door.pos.col);
                        this.doors.set(key, door);
                    });
                }

                // Load portals
                this.portals.clear();
                if (levelData.mechanics.portals) {
                    levelData.mechanics.portals.forEach(portal => {
                        // Forward portal (entry -> target)
                        const key = getTileId(portal.pos.row, portal.pos.col);
                        this.portals.set(key, portal.target);

                        // Bidirectional: Set reverse portal if needed (optional, depends on game design)
                        // For now assuming one-way or explicit pairs in data
                    });
                }
            }

            // Build pathfinding graph for hint system
            this._buildPathfindingGraph();

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
            direction
        );

        const rightValid = this._isValidMove(
            rightNewPos.row,
            rightNewPos.col,
            this.rightMaze,
            mirroredDirection
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

        // STEP 4: Handle Mechanics (Switches & Portals)
        this._handleMechanics(this.leftPlayer, this.leftMaze);
        this._handleMechanics(this.rightPlayer, this.rightMaze);

        // Record the move
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
     * @param {string} direction - Direction of movement
     * @returns {boolean} - True if valid
     */
    _isValidMove(row, col, maze, direction) {
        // Check bounds
        if (!isWithinBounds(row, col, maze.rows, maze.cols)) {
            return false;
        }

        // Check if tile is walkable (not a wall)
        const tile = maze.getTile(row, col);

        // Wall check
        if (tile === WALL) return false;

        // One-Way Door Checks
        if (tile === ONE_WAY_UP && direction !== 'UP') return false;
        if (tile === ONE_WAY_DOWN && direction !== 'DOWN') return false;
        if (tile === ONE_WAY_LEFT && direction !== 'LEFT') return false;
        if (tile === ONE_WAY_RIGHT && direction !== 'RIGHT') return false;

        // Schrödinger Tile Check
        if (tile === SCHRODINGER) {
            // If solid, treat as WALL (return false)
            if (this._isSchrodingerSolid(this.moveCount)) {
                return false;
            }
            // If not solid, treat as EMPTY (continue)
        }

        // Door check
        if (tile === DOOR) {
            const tileId = getTileId(row, col);
            const door = this.doors.get(tileId);

            // If we have door data, check if its switch is active
            if (door && door.switchId) {
                return this.switches.isActive(door.switchId);
            }
            // Default to closed if no data found
            return false;
        }

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

        // Reset coin collection
        this.coinsCollected = 0;

        // Recalculate total coins from current grid state
        this.totalCoins = 0;
        if (this.leftMaze && this.rightMaze) {
            for (let row = 0; row < this.leftMaze.rows; row++) {
                for (let col = 0; col < this.leftMaze.cols; col++) {
                    if (this.leftMaze.getTile(row, col) === COIN) {
                        this.totalCoins++;
                    }
                    if (this.rightMaze.getTile(row, col) === COIN) {
                        this.totalCoins++;
                    }
                }
            }
        }

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
     * Get minimum distance to goal from either player
     * @returns {number} - Minimum Manhattan distance to goal
     */
    getMinDistanceToGoal() {
        // Calculate distance from each player to their respective goal
        const leftDistance = calculateManhattanDistance(this.leftPlayer, this.leftGoal);
        const rightDistance = calculateManhattanDistance(this.rightPlayer, this.rightGoal);

        // Return the minimum distance (whichever player is closest to winning)
        return Math.min(leftDistance, rightDistance);
    }

    /**
     * Calculate current audio intensity based on player progress
     * @returns {number} - Intensity value between 0.0 (farthest) and 1.0 (on goal)
     */
    calculateCurrentIntensity() {
        // Calculate distance from each player to their respective goal
        const leftDistance = calculateManhattanDistance(this.leftPlayer, this.leftGoal);
        const rightDistance = calculateManhattanDistance(this.rightPlayer, this.rightGoal);

        // Find the minimum distance (whichever player is closest to winning)
        const minDistance = Math.min(leftDistance, rightDistance);

        // Calculate max possible distance (roughly rows + cols)
        const maxDistance = this.leftMaze.rows + this.leftMaze.cols;

        // Return normalized value: 1.0 when on goal (distance = 0), 0.0 when farthest away
        return 1.0 - (minDistance / maxDistance);
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
            canRedo: !this.redoStack.isEmpty(),
            activeSwitches: this.switches.getActiveSwitches(),
            intensity: this.calculateCurrentIntensity(),
            distanceToGoal: this.getMinDistanceToGoal(),
            coinsCollected: this.coinsCollected,
            totalCoins: this.totalCoins
        };
    }

    /**
     * Handle mechanics when a player lands on a tile
     * @private
     */
    _handleMechanics(playerPos, maze) {
        const tile = maze.getTile(playerPos.row, playerPos.col);
        const tileId = getTileId(playerPos.row, playerPos.col);

        // Handle Coin Collection
        if (tile === COIN) {
            console.log(`[Engine] Coin collected at ${playerPos.row},${playerPos.col}!`);
            this.coinsCollected++;
            // Remove the coin by setting tile to EMPTY
            maze.setTile(playerPos.row, playerPos.col, EMPTY);
        }

        // Handle Switch
        if (tile === SWITCH) {
            console.log(`[Engine] Landed on SWITCH at ${playerPos.row},${playerPos.col}`);
            const mechanics = this.currentLevel.mechanics;
            if (mechanics && mechanics.switches) {
                const switchData = mechanics.switches.find(s =>
                    s.pos.row === playerPos.row && s.pos.col === playerPos.col
                );

                if (switchData) {
                    if (!this.switches.isActive(switchData.id)) {
                        console.log(`[Engine] Activating switch: ${switchData.id}`);
                        this.switches.activate(switchData.id);
                    }
                } else {
                    console.warn(`[Engine] Switch found at ${playerPos.row},${playerPos.col} but no data in mechanics!`);
                }
            } else {
                console.warn('[Engine] No mechanics/switches definition found!');
            }
        }

        // Handle Portal
        if (tile === PORTAL) {
            console.log(`[Engine] Landed on PORTAL at ${playerPos.row},${playerPos.col}`);
            const target = this.portals.get(tileId);
            if (target) {
                console.log(`[Engine] Teleporting to ${target.row},${target.col}`);
                // Teleport player
                playerPos.row = target.row;
                playerPos.col = target.col;

                // Update entity position immediately
                const playerId = (maze === this.leftMaze) ? PLAYER_IDS.LEFT : PLAYER_IDS.RIGHT;
                this.entities.updateEntity(playerId, {
                    row: playerPos.row,
                    col: playerPos.col
                });
            } else {
                console.warn(`[Engine] Portal found at ${tileId} but no target in map! Keys:`, Array.from(this.portals.keys()));
            }
        }
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
     * Check if Schrödinger tile is solid based on move count
     * @param {number} moveCount - Current move count
     * @returns {boolean} - True if solid (WALL), false if intangible (FLOOR)
     * @private
     */
    _isSchrodingerSolid(moveCount) {
        // Changes state every 3 moves
        // If (moveCount / 3) is odd, it's solid (WALL)
        // If (moveCount / 3) is even, it's empty (FLOOR)
        return Math.floor(moveCount / 3) % 2 !== 0;
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

    // ==================== GHOST REPLAY SYSTEM ====================

    /**
     * Load ghost replay data from a history array
     * @param {Array} historyArray - Array of move objects with player positions
     * @returns {boolean} - True if loaded successfully
     */
    loadGhostReplay(historyArray) {
        // Validate input
        if (!Array.isArray(historyArray)) {
            console.warn('Ghost replay data must be an array');
            this.ghostHistory = [];
            return false;
        }

        // Assign the history
        this.ghostHistory = historyArray;
        console.log(`Ghost replay loaded: ${historyArray.length} moves`);
        return true;
    }

    /**
     * Export move history as a clean array for database storage
     * Traverses the moveHistory LinkedList and extracts player positions
     * @returns {Array} - Array of move objects with player positions
     */
    exportHistory() {
        const historyArray = [];

        // Add initial positions (move 0)
        const startPositions = {
            moveNumber: 0,
            left: { row: this.leftPlayer.row, col: this.leftPlayer.col },
            right: { row: this.rightPlayer.row, col: this.rightPlayer.col }
        };

        // If we have move history, use the initial positions from first move
        const firstMove = this.moveHistory.getFirst();
        if (firstMove) {
            startPositions.left = { row: firstMove.leftFrom.row, col: firstMove.leftFrom.col };
            startPositions.right = { row: firstMove.rightFrom.row, col: firstMove.rightFrom.col };
        }

        historyArray.push(startPositions);

        // Traverse the linked list and extract positions
        this.moveHistory.forEach((moveData) => {
            historyArray.push({
                moveNumber: moveData.moveNumber,
                left: { row: moveData.leftTo.row, col: moveData.leftTo.col },
                right: { row: moveData.rightTo.row, col: moveData.rightTo.col }
            });
        });

        return historyArray;
    }

    /**
     * Get ghost positions for a specific move count
     * Core logic for ghost replay visualization
     * @param {number} currentMoveCount - Current player move count
     * @returns {Object|null} - Object with left and right positions, or null if no ghost
     */
    getGhostPositions(currentMoveCount) {
        // No ghost data loaded
        if (!this.ghostHistory || this.ghostHistory.length === 0) {
            return null;
        }

        // Move count is 0 - return start positions
        if (currentMoveCount === 0) {
            const startMove = this.ghostHistory[0];
            if (startMove) {
                return {
                    left: { row: startMove.left.row, col: startMove.left.col },
                    right: { row: startMove.right.row, col: startMove.right.col }
                };
            }
            return null;
        }

        // Move count exceeds history - ghost stays at final position (goal)
        if (currentMoveCount >= this.ghostHistory.length) {
            const finalMove = this.ghostHistory[this.ghostHistory.length - 1];
            return {
                left: { row: finalMove.left.row, col: finalMove.left.col },
                right: { row: finalMove.right.row, col: finalMove.right.col }
            };
        }

        // Return position at the current move count
        const moveData = this.ghostHistory[currentMoveCount];
        if (moveData) {
            return {
                left: { row: moveData.left.row, col: moveData.left.col },
                right: { row: moveData.right.row, col: moveData.right.col }
            };
        }

        return null;
    }
}

export default QuantumEngine;
